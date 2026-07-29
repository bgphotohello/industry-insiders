import type { LeadProvider, LeadRecord } from "../types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#6b7280;font:500 12px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#091526;font:400 15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif">${escapeHtml(value) || "—"}</td>
  </tr>`;
}

/**
 * Emails an internal notification for each new interest-list submission via
 * the Resend REST API.
 *
 * Uses fetch directly rather than the `resend` SDK: one HTTP call does not
 * justify a dependency, and this keeps the server bundle small.
 */
export function createResendProvider(config: {
  apiKey: string;
  from: string;
  to: string[];
}): LeadProvider {
  return {
    name: "resend",
    async deliver(lead: LeadRecord) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const fullName = `${lead.firstName} ${lead.lastName}`.trim();

      try {
        const response = await fetch(RESEND_ENDPOINT, {
          method: "POST",
          headers: {
            authorization: `Bearer ${config.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            from: config.from,
            to: config.to,
            reply_to: lead.email,
            subject: `Interest list — ${fullName}${lead.company ? `, ${lead.company}` : ""}`,
            html: `<div style="background:#f8f5ef;padding:32px">
              <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7d2a3;padding:32px">
                <p style="margin:0 0 4px;color:#c8a15a;font:500 11px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase">Industry Insider</p>
                <h1 style="margin:0 0 24px;color:#091526;font:400 24px/1.3 Georgia,serif">New interest-list submission</h1>
                <table style="border-collapse:collapse;width:100%">
                  ${row("Name", fullName)}
                  ${row("Email", lead.email)}
                  ${row("Cell phone", lead.phone)}
                  ${row("TREC #", lead.trecNumber)}
                  ${row("Company", lead.company)}
                  ${row("Role", lead.role)}
                  ${row("Heard via", lead.referral)}
                  ${row("Marketing consent", lead.consent ? "Yes" : "No")}
                  ${row("Submitted", lead.submittedAt)}
                  ${row("Source", lead.source)}
                </table>
              </div>
            </div>`,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Resend responded ${response.status}`);
        }
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
