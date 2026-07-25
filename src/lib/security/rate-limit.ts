import "server-only";

/**
 * Small in-memory sliding-window limiter.
 *
 * Deliberately dependency-free and per-instance: it stops a single visitor
 * hammering the form (double-clicks, impatient retries, naive scripts) without
 * introducing Redis for a launch page. Serverless instances do not share this
 * map, so it is a speed bump rather than a hard guarantee — Turnstile and the
 * honeypot are the real bot controls.
 *
 * If the site later needs a strict global limit, swap the body of `checkRate`
 * for a Redis/Upstash call; the signature is designed not to change.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
/** Two submissions closer together than this are treated as a double-submit. */
const MIN_GAP_MS = 2_000;

/** Bounds memory if a burst of unique keys arrives. */
const MAX_TRACKED_KEYS = 5_000;

export type RateResult =
  | { ok: true }
  | { ok: false; reason: "duplicate" | "throttled" };

export function checkRate(key: string): RateResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();

  const bucket = buckets.get(key) ?? { hits: [] };
  const recent = bucket.hits.filter((time) => now - time < WINDOW_MS);

  const last = recent[recent.length - 1];
  if (last !== undefined && now - last < MIN_GAP_MS) {
    buckets.set(key, { hits: recent });
    return { ok: false, reason: "duplicate" };
  }

  if (recent.length >= MAX_PER_WINDOW) {
    buckets.set(key, { hits: recent });
    return { ok: false, reason: "throttled" };
  }

  recent.push(now);
  buckets.set(key, { hits: recent });
  return { ok: true };
}
