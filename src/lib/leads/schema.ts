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

/**
 * Normalise a phone number to E.164, so every record lands in the CRM as one
 * format ("+12145550134") no matter how it was typed.
 *
 * Deliberately forgiving — "214.555.0134", "(214) 555 0134" and
 * "+1 214-555-0134" are all the same number, and none of them is a mistake
 * worth bouncing someone over. Anything beginning with "+" is treated as
 * already international and kept; everything else is read as US/Canada, which
 * is the whole of Dallas–Fort Worth.
 *
 * Returns null when it cannot make sense of the input.
 */
export function normalisePhone(raw: string): string | null {
  const value = raw.trim();
  if (value === "") return null;

  const digits = value.replace(/\D/g, "");

  if (value.startsWith("+")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

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
  phone: trimmed(30)
    .pipe(z.string().min(1, "Please enter your cell phone number."))
    .transform((value, ctx) => {
      const normalised = normalisePhone(value);
      if (normalised === null) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter a valid cell phone number.",
        });
        return z.NEVER;
      }
      return normalised;
    }),
  trecNumber: trimmed(20)
    // "na", "n/a", "N.A." and friends all normalise to a clean "NA".
    .transform((value) =>
      /^n\.?\/?\.?a\.?$/i.test(value) ? "NA" : value,
    )
    .pipe(
      z
        .string()
        .min(
          1,
          "Please enter your TREC license number, or NA if you are not a realtor.",
        ),
    )
    // Real numbers land uppercase with spaces and dashes stripped, so
    // "trec 0654-321" and "TREC0654321" are the same value in the CRM.
    .transform((value) =>
      value === "NA" ? value : value.replace(/[\s-]/g, "").toUpperCase(),
    ),
  company: trimmed(120).pipe(z.string().min(1, "Please enter your company.")),
  role: trimmed(120).pipe(
    z.string().min(1, "Please select at least one professional role."),
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
  "phone",
  "trecNumber",
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
