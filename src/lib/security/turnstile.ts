import "server-only";

const VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Cloudflare Turnstile integration point.
 *
 * Turnstile is entirely optional: it switches on only when BOTH
 * TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY are present. Until then the form
 * renders no widget and verification is a no-op, so the site ships and works
 * with zero Cloudflare setup.
 *
 * The site key is public but is read here on the server and handed to the
 * widget as a prop, which keeps every Turnstile value out of the client
 * bundle's env inlining.
 */

export function getTurnstileSiteKey(): string | null {
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim();
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  return siteKey && secret ? siteKey : null;
}

export function isTurnstileEnabled(): boolean {
  return getTurnstileSiteKey() !== null;
}

/** Returns true when the token is valid, or when Turnstile is not configured. */
export async function verifyTurnstile(
  token: string,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!isTurnstileEnabled() || !secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error(
      "[industry-insider] Turnstile verification failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
