"use server";

import { headers } from "next/headers";

import { deliverLead, LEAD_SOURCE } from "@/lib/leads";
import {
  fieldErrorsFromZod,
  isHoneypotTripped,
  leadSchema,
} from "@/lib/leads/schema";
import type { LeadSubmissionState } from "@/lib/leads/types";
import { toLeadRecord } from "@/lib/leads/types";
import { checkRate } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { interest } from "@/content/site";

/**
 * Server action behind the interest-list form.
 *
 * Order matters: cheap local checks run before anything that costs a network
 * round trip, and no branch below ever reports *why* a bot was rejected.
 *
 *   1. honeypot        — silent success, so scripts get no signal
 *   2. rate limit      — blocks double-submits and bursts
 *   3. schema          — validates and normalises (email lowercased/trimmed)
 *   4. Turnstile       — only if configured
 *   5. delivery        — fan out to every configured provider
 */
export async function submitLead(
  formData: FormData,
): Promise<LeadSubmissionState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    company: String(formData.get("company") ?? ""),
    role: String(formData.get("role") ?? ""),
    referral: String(formData.get("referral") ?? ""),
    consent: formData.get("consent") === "true" || formData.get("consent") === "on",
    website: String(formData.get("website") ?? ""),
    turnstileToken: String(formData.get("turnstileToken") ?? ""),
  };

  // 1. Honeypot. A filled hidden field means a bot: report success and drop
  //    the submission, so the script never learns it was caught. This is the
  //    only place the rule is enforced — never in the browser, where an
  //    auto-filling password manager would lock a real person out.
  if (isHoneypotTripped(raw.website)) {
    return { status: "success" };
  }

  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip")?.trim() ??
    "unknown";

  // 2. Rate limit, keyed on IP + email so one shared office IP cannot lock out
  //    a colleague.
  const rate = checkRate(`${clientIp}:${raw.email.trim().toLowerCase()}`);
  if (!rate.ok) {
    return {
      status: "error",
      message:
        rate.reason === "duplicate"
          ? "That request is already on its way. Give it a moment."
          : "Too many attempts just now. Please try again shortly.",
    };
  }

  // 3. Validate + normalise. This is authoritative regardless of what the
  //    browser already checked.
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = fieldErrorsFromZod(parsed.error);
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    };
  }

  // 4. Turnstile. No-op unless both Turnstile keys are configured.
  const humanVerified = await verifyTurnstile(
    parsed.data.turnstileToken,
    clientIp === "unknown" ? undefined : clientIp,
  );
  if (!humanVerified) {
    return {
      status: "error",
      message: "We couldn’t verify that request. Please try again.",
    };
  }

  // 5. Deliver. Provider internals never reach the browser.
  try {
    await deliverLead(toLeadRecord(parsed.data, LEAD_SOURCE));
    return { status: "success" };
  } catch (error) {
    console.error(
      "[industry-insider] Lead delivery failed:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: interest.genericError };
  }
}
