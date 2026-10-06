import { createHash } from "node:crypto";

import type { LeadProvider, LeadRecord } from "../types";

const TIMEOUT_MS = 8_000;

/**
 * Mailchimp provider — adds consenting leads to the client's audience, sorted
 * the way the client asked (Breanna, 6 Oct): everyone tagged by what they are,
 * and anyone on the agent side of the business additionally tagged
 * "Pending Review", because the Realtor list is curated to top producers and
 * nobody goes straight onto the invitation segment.
 *
 * Structure is expressed entirely through TAGS, not through audiences or
 * groups, for two reasons. Tags are created by Mailchimp automatically the
 * first time they are applied, so this integration needs zero set-up clicks in
 * the Mailchimp UI. And one audience with tags is Mailchimp's own recommended
 * shape — multiple audiences double-bill for the same person the moment they
 * appear in both.
 *
 * The client's review workflow lands as: segment on `Pending Review` to see the
 * holding area; approving someone = removing that tag (and sending the
 * invitation); the "Industry Partner" / "Realtor" / "Broker" tags make the
 * one-list-per-kind views they asked for. "Website Signup" marks provenance,
 * so contacts added by hand stay distinguishable.
 *
 * CONSENT: a lead that did not tick the marketing checkbox is NOT sent to
 * Mailchimp at all — that is the entire meaning of the checkbox. The lead
 * still reaches every other configured provider (the notification email, the
 * database), so no one is lost; they are just not on a marketing list they
 * never agreed to join.
 *
 * People are subscribed as `subscribed`, not `pending`: the checkbox is an
 * express opt-in collected with the submission, so a second confirm-your-email
 * step would only bleed signups. If the client ever wants double opt-in,
 * change both status fields below to "pending".
 */

/** Role labels as the form stores them (comma-joined when several apply). */
const AGENT_ROLES = ["Realtor", "Broker"];
const PARTNER_ROLE = "Industry Partner";

/** The tag Breanna's "holding area to be pre-approved" maps onto. */
const PENDING_TAG = "Pending Review";
const SOURCE_TAG = "Website Signup";

export function tagsForLead(role: string): string[] {
  const roles = role
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const tags = [SOURCE_TAG];
  for (const known of [...AGENT_ROLES, PARTNER_ROLE]) {
    if (roles.includes(known)) tags.push(known);
  }
  if (roles.some((value) => AGENT_ROLES.includes(value))) {
    tags.push(PENDING_TAG);
  }
  return tags;
}

export function createMailchimpProvider(config: {
  apiKey: string;
  audienceId: string;
}): LeadProvider {
  // Keys end in their datacenter ("...-us21"), which is also the API host.
  const datacenter = config.apiKey.split("-").pop();
  const base = `https://${datacenter}.api.mailchimp.com/3.0`;
  const authorization = `Basic ${Buffer.from(`key:${config.apiKey}`).toString("base64")}`;

  async function call(
    method: "PUT" | "POST",
    path: string,
    body: unknown,
  ): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${base}${path}`, {
        method,
        headers: {
          authorization,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) {
        // Mailchimp's error body says what went wrong; keep it in the server
        // logs and out of anything a browser could ever see.
        console.error(
          `[industry-insider] Mailchimp ${method} ${path} responded ${response.status}:`,
          await response.text().catch(() => "(unreadable body)"),
        );
        throw new Error(`Mailchimp responded ${response.status}`);
      }
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    name: "mailchimp",
    async deliver(lead: LeadRecord) {
      if (!lead.consent) {
        // Not a failure — the respectful handling of "no".
        console.info(
          "[industry-insider] Lead did not opt in to marketing; not sent to Mailchimp.",
        );
        return;
      }

      // Mailchimp addresses members by the MD5 of the lowercased email; PUT is
      // an upsert, so someone submitting twice updates rather than errors.
      const memberHash = createHash("md5")
        .update(lead.email.toLowerCase())
        .digest("hex");

      await call("PUT", `/lists/${config.audienceId}/members/${memberHash}`, {
        email_address: lead.email,
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: {
          FNAME: lead.firstName,
          LNAME: lead.lastName,
          PHONE: lead.phone,
        },
      });

      // Tags go through their own endpoint: the member PUT ignores tags on
      // records that already exist, and a silent partial apply is exactly the
      // kind of bug that puts an unvetted Realtor on the invitation list.
      await call("POST", `/lists/${config.audienceId}/members/${memberHash}/tags`, {
        tags: tagsForLead(lead.role).map((name) => ({
          name,
          status: "active",
        })),
      });
    },
  };
}
