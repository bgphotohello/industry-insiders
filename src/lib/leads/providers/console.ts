import type { LeadProvider, LeadRecord } from "../types";

/** Masks an email as "p•••n@example.com" so server logs never hold a full address. */
function redactEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return "•••";
  const head = local.slice(0, 1);
  const tail = local.length > 2 ? local.slice(-1) : "";
  return `${head}•••${tail}@${domain}`;
}

/**
 * Default development destination.
 *
 * Logs a redacted, structured summary to the *server* console so a developer
 * can confirm the pipeline end to end without personal data landing in the
 * browser, in a log aggregator, or in a screen share.
 */
export const consoleProvider: LeadProvider = {
  name: "console",
  async deliver(lead: LeadRecord) {
    console.info("[industry-insider] interest-list submission", {
      name: `${lead.firstName.slice(0, 1)}. ${lead.lastName.slice(0, 1)}.`,
      email: redactEmail(lead.email),
      // Presence only. The console provider is the local-development default,
      // so it deliberately never prints a phone number or a licence number.
      phone: lead.phone ? "provided" : "empty",
      company: lead.company ? "provided" : "empty",
      role: lead.role || "empty",
      trecNumber: lead.trecNumber ? "provided" : "empty",
      referral: lead.referral ? "provided" : "empty",
      consent: lead.consent,
      submittedAt: lead.submittedAt,
      source: lead.source,
    });
  },
};
