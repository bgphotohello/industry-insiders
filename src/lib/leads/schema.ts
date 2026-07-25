import { z } from "zod";

/**
 * The single schema for an interest-list submission.
 *
 * It is authoritative on the server (the server action re-validates every
 * submission regardless of what the browser did) and is reused on the client
 * for instant field feedback. Client-side validation is a convenience only.
 */

const trimmed = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().max(max, `Please keep this under ${max} characters.`));

export const leadSchema = z.object({
  firstName: trimmed(80).pipe(
    z.string().min(1, "Please enter your first name."),
  ),
  lastName: trimmed(80).pipe(z.string().min(1, "Please enter your last name.")),
  email: z
    .string()
    // Normalise before validating so "  Person@Example.COM " is accepted and
    // stored as "person@example.com".
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.string().min(1, "Please enter your email address."))
    .pipe(z.email("Please enter a valid email address."))
    .pipe(z.string().max(254, "Please enter a valid email address.")),
  company: trimmed(120).pipe(z.string().min(1, "Please enter your company.")),
  role: trimmed(120).pipe(
    z.string().min(1, "Please enter your professional role."),
  ),
  referral: trimmed(500).optional().default(""),
  consent: z.boolean().optional().default(false),
  /**
   * Honeypot. Real people never see this field.
   *
   * Deliberately NOT constrained here. This schema also runs in the browser,
   * and a "must be empty" rule would turn a password manager auto-filling the
   * hidden field into a dead submit button with no visible error — a real
   * person silently unable to join. The check lives on the server instead, via
   * `isHoneypotTripped`, which the action runs before anything else.
   */
  website: z.string().optional().default(""),
  /** Cloudflare Turnstile token; only required when Turnstile is configured. */
  turnstileToken: z.string().optional().default(""),
});

/**
 * True when the hidden honeypot field came back with anything in it.
 *
 * Kept beside the schema so the rule and the field that carries it stay
 * together; called by the server action before any other work.
 */
export function isHoneypotTripped(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/** Shape submitted by the browser (pre-transform). */
export type LeadFormValues = z.input<typeof leadSchema>;

/** Shape after validation + normalisation (post-transform). */
export type LeadInput = z.output<typeof leadSchema>;

/** Field names the client form renders and can attach errors to. */
export const leadFieldNames = [
  "firstName",
  "lastName",
  "email",
  "company",
  "role",
  "referral",
  "consent",
] as const;

export type LeadFieldName = (typeof leadFieldNames)[number];

/**
 * Collapse a ZodError into a `{ field: message }` map.
 *
 * Written against `error.issues` directly rather than a helper, so it is not
 * coupled to any one Zod minor version's flatten/treeify API.
 */
export function fieldErrorsFromZod(
  error: z.ZodError,
): Partial<Record<LeadFieldName, string>> {
  const result: Partial<Record<LeadFieldName, string>> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string") continue;
    if (!(leadFieldNames as readonly string[]).includes(key)) continue;

    const field = key as LeadFieldName;
    // Keep the first message per field — that is the most specific one.
    if (result[field] === undefined) {
      result[field] = issue.message;
    }
  }

  return result;
}
