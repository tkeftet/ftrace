/**
 * Resolves the tenant slug from the current hostname/URL.
 *
 * Priority:
 *  1. ?tenant=slug  query param  (saves to sessionStorage for navigation persistence)
 *  2. Subdomain of VITE_BASE_DOMAIN  (e.g. pixelandplay.agile-many-unprotected.ngrok-free.dev)
 *  3. Root VITE_BASE_DOMAIN  →  check sessionStorage (set by a previous ?tenant= on same tab)
 *  4. localhost subdomain  (e.g. pixelandplay.localhost:5173)
 *  5. Bare localhost  →  super-admin (null)
 *
 * Local dev:
 *   localhost:5173                  → null  (super-admin / landing)
 *   pixelandplay.localhost:5173     → "pixelandplay"
 *
 * Via ngrok (VITE_BASE_DOMAIN = agile-many-unprotected.ngrok-free.dev):
 *   https://agile-many-unprotected.ngrok-free.dev                      → null  (super-admin)
 *   https://agile-many-unprotected.ngrok-free.dev?tenant=pixelandplay  → "pixelandplay"
 *   https://agile-many-unprotected.ngrok-free.dev/login  (after above) → "pixelandplay" (from storage)
 */
const SESSION_SLUG_KEY = "ftrace_tenant_slug";

export const getTenantSlug = (): string | null => {
  // 1. Query param — works on any URL; persist so navigation drops don't lose slug
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get("tenant");
  if (querySlug) {
    sessionStorage.setItem(SESSION_SLUG_KEY, querySlug);
    return querySlug;
  }

  const hostname = window.location.hostname; // no port
  const baseDomain = import.meta.env.VITE_BASE_DOMAIN as string | undefined;

  if (baseDomain) {
    // 2. Subdomain of the configured base domain (paid ngrok wildcard / custom domain)
    const suffix = `.${baseDomain}`;
    if (hostname.endsWith(suffix)) {
      return hostname.slice(0, hostname.length - suffix.length) || null;
    }

    // 3. Exact base domain — rely on sessionStorage (set by ?tenant= earlier in this tab)
    if (hostname === baseDomain) {
      return sessionStorage.getItem(SESSION_SLUG_KEY) ?? null;
    }

    // hostname doesn't match baseDomain at all (e.g. still on localhost during dev)
    // — fall through to localhost detection below
  }

  // 4. localhost subdomain  →  pixelandplay.localhost → "pixelandplay"
  const parts = hostname.split(".");
  if (parts[parts.length - 1] === "localhost") {
    return parts.length >= 2 ? parts[0] : null;
  }

  // 5. Bare hostname with no dots = super-admin (plain "localhost" caught above)
  if (parts.length === 1) return null;

  // Anything else (ngrok, cloudflare, custom domains without VITE_BASE_DOMAIN set):
  // rely on ?tenant= query param (step 1 above) or sessionStorage set by a prior visit.
  return sessionStorage.getItem(SESSION_SLUG_KEY) ?? null;
};

export const clearTenantSlug = () =>
  sessionStorage.removeItem(SESSION_SLUG_KEY);

export const isSuperAdminDomain = () => getTenantSlug() === null;
