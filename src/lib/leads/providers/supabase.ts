import type { LeadProvider, LeadRecord } from "../types";

const TIMEOUT_MS = 8_000;

/**
 * Inserts each lead into a Supabase table via PostgREST.
 *
 * Uses the REST endpoint directly so the launch site carries no Supabase SDK.
 * When the member portal is built (see README, "Adding the member area") the
 * `@supabase/ssr` client is introduced there for auth; this provider can then
 * be swapped to use it, or left exactly as is.
 *
 * The service role key bypasses row-level security, so this module must only
 * ever be imported from server code. It is never referenced from a client
 * component and is not prefixed with NEXT_PUBLIC_.
 *
 * Expected table (SQL in README):
 *   create table public.leads (
 *     id uuid primary key default gen_random_uuid(),
 *     first_name text not null,
 *     last_name  text not null,
 *     email      text not null,
 *     phone      text not null,
 *     company    text,
 *     role       text,
 *     licence    text,
 *     referral   text,
 *     consent    boolean not null default false,
 *     source     text,
 *     created_at timestamptz not null default now()
 *   );
 */
export function createSupabaseProvider(config: {
  url: string;
  serviceRoleKey: string;
  table: string;
}): LeadProvider {
  return {
    name: "supabase",
    async deliver(lead: LeadRecord) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const endpoint = `${config.url.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(config.table)}`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            apikey: config.serviceRoleKey,
            authorization: `Bearer ${config.serviceRoleKey}`,
            "content-type": "application/json",
            // Keeps the response body empty — nothing to leak, less to parse.
            prefer: "return=minimal",
          },
          body: JSON.stringify({
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            role: lead.role,
            licence: lead.licence,
            referral: lead.referral,
            consent: lead.consent,
            source: lead.source,
            created_at: lead.submittedAt,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Supabase responded ${response.status}`);
        }
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
