import type { LeadFieldName, LeadInput } from "./schema";

/**
 * A validated, normalised lead ready to be delivered to a destination.
 * This — not the raw form payload — is what every provider receives.
 */
export type LeadRecord = {
  firstName: string;
  lastName: string;
  email: string;
  /** E.164, e.g. "+12145550134". */
  phone: string;
  company: string;
  /** One of the ROLE_OPTIONS slugs. */
  role: string;
  /** A TREC licence number, or "N/A" for anyone not licensed. */
  licence: string;
  referral: string;
  consent: boolean;
  /** ISO-8601, stamped on the server. */
  submittedAt: string;
  /** Where the submission came from, e.g. "industry-insider-launch". */
  source: string;
};

/**
 * The contract every lead destination implements.
 *
 * Adding a new CRM means adding one file under `providers/` that satisfies
 * this interface and registering it in `resolveProviders()` — nothing in the
 * form, the server action, or the UI changes.
 */
export type LeadProvider = {
  /** Stable identifier, matches the LEAD_CAPTURE_PROVIDER env value. */
  readonly name: string;
  /**
   * Deliver the lead. Throw on failure — the caller decides how a failure is
   * surfaced, and never leaks provider details to the browser.
   */
  deliver(lead: LeadRecord): Promise<void>;
};

export function toLeadRecord(input: LeadInput, source: string): LeadRecord {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    company: input.company,
    role: input.role,
    licence: input.licence,
    referral: input.referral,
    consent: input.consent,
    submittedAt: new Date().toISOString(),
    source,
  };
}

/** Discriminated result returned by the server action to the client. */
export type LeadSubmissionState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      /** Safe, human-readable message. Never contains provider internals. */
      message: string;
      fieldErrors?: Partial<Record<LeadFieldName, string>>;
    };
