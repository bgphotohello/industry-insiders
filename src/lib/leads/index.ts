import "server-only";

import { consoleProvider } from "./providers/console";
import { fileProvider } from "./providers/file";
import { createResendProvider } from "./providers/resend";
import { createSupabaseProvider } from "./providers/supabase";
import { createWebhookProvider } from "./providers/webhook";
import type { LeadProvider, LeadRecord } from "./types";

export const LEAD_SOURCE = "industry-insider-launch";

/**
 * Build the provider chain from the environment.
 *
 * LEAD_CAPTURE_PROVIDER accepts a comma-separated list, so a lead can be
 * written to Supabase *and* emailed via Resend from one submission. A provider
 * whose credentials are missing is skipped with a server-side warning rather
 * than taking the form down.
 */
function resolveProviders(): LeadProvider[] {
  const requested = (process.env.LEAD_CAPTURE_PROVIDER ?? "console")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);

  const providers: LeadProvider[] = [];

  for (const name of requested) {
    switch (name) {
      case "console": {
        providers.push(consoleProvider);
        break;
      }

      case "file": {
        providers.push(fileProvider);
        break;
      }

      case "webhook": {
        const url = process.env.LEAD_WEBHOOK_URL;
        if (!url) {
          warnMissing("webhook", ["LEAD_WEBHOOK_URL"]);
          break;
        }
        providers.push(
          createWebhookProvider(url, process.env.LEAD_WEBHOOK_SECRET),
        );
        break;
      }

      case "resend": {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL;
        const to = (process.env.RESEND_TO_EMAIL ?? "")
          .split(",")
          .map((address) => address.trim())
          .filter(Boolean);

        if (!apiKey || !from || to.length === 0) {
          warnMissing("resend", [
            "RESEND_API_KEY",
            "RESEND_FROM_EMAIL",
            "RESEND_TO_EMAIL",
          ]);
          break;
        }
        providers.push(createResendProvider({ apiKey, from, to }));
        break;
      }

      case "supabase": {
        const url = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !serviceRoleKey) {
          warnMissing("supabase", ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
          break;
        }
        providers.push(
          createSupabaseProvider({
            url,
            serviceRoleKey,
            table: process.env.SUPABASE_LEADS_TABLE ?? "leads",
          }),
        );
        break;
      }

      default: {
        console.warn(
          `[industry-insider] Unknown LEAD_CAPTURE_PROVIDER "${name}" — ignoring.`,
        );
      }
    }
  }

  if (providers.length === 0) {
    console.warn(
      "[industry-insider] No lead provider configured; falling back to console.",
    );
    providers.push(consoleProvider);
  }

  return providers;
}

function warnMissing(provider: string, vars: string[]) {
  console.warn(
    `[industry-insider] Lead provider "${provider}" is not configured. Set: ${vars.join(", ")}.`,
  );
}

/**
 * Deliver a lead to every configured destination.
 *
 * Resolves when at least one provider accepted the lead. If every provider
 * fails the error propagates, and the caller shows the visitor a generic
 * message — provider names and status codes stay on the server.
 */
export async function deliverLead(lead: LeadRecord): Promise<void> {
  const providers = resolveProviders();
  const results = await Promise.allSettled(
    providers.map((provider) =>
      provider.deliver(lead).catch((error: unknown) => {
        console.error(
          `[industry-insider] Lead provider "${provider.name}" failed:`,
          error instanceof Error ? error.message : error,
        );
        throw error;
      }),
    ),
  );

  const delivered = results.some((result) => result.status === "fulfilled");
  if (!delivered) {
    throw new Error("All lead providers failed.");
  }
}

export type { LeadProvider, LeadRecord };
