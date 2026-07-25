import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { LeadProvider, LeadRecord } from "../types";

const LEADS_DIR = path.join(process.cwd(), ".leads");
const LEADS_FILE = path.join(LEADS_DIR, "leads.jsonl");

/**
 * Development-only destination: appends one JSON object per line to
 * `.leads/leads.jsonl` (git-ignored) so form submissions can be inspected
 * locally with the full payload intact.
 *
 * Refuses to run in production — real submissions belong in a real system,
 * and container filesystems on Vercel are ephemeral and non-shared anyway.
 */
export const fileProvider: LeadProvider = {
  name: "file",
  async deliver(lead: LeadRecord) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        'The "file" lead provider is development-only. Set LEAD_CAPTURE_PROVIDER to a production destination.',
      );
    }

    await mkdir(LEADS_DIR, { recursive: true });
    await appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, "utf8");
  },
};
