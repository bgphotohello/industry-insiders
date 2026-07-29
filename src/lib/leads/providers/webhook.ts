import type { LeadProvider, LeadRecord } from "../types";

const TIMEOUT_MS = 8_000;

/**
 * Generic outbound webhook — GoHighLevel, Zapier, Make, HubSpot, or any CRM
 * that accepts a JSON POST.
 *
 * The body is deliberately flat and vendor-neutral. If a destination needs a
 * different shape, map it here rather than changing the LeadRecord type.
 */
export function createWebhookProvider(url: string, secret?: string): LeadProvider {
  return {
    name: "webhook",
    async deliver(lead: LeadRecord) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(secret ? { "x-industry-insider-signature": secret } : {}),
          },
          body: JSON.stringify({
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            role: lead.role,
            trec_license: lead.licence,
            referral_source: lead.referral,
            marketing_consent: lead.consent,
            submitted_at: lead.submittedAt,
            source: lead.source,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Webhook responded ${response.status}`);
        }
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
