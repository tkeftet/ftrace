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
      // The tenant slug is the label immediately left of the base domain, so an
      // optional "www." prefix is ignored:
      //   riad21.doomedgamesstudio.com      -> "riad21"
      //   www.riad21.doomedgamesstudio.com  -> "riad21"
      const labels = hostname.slice(0, hostname.length - suffix.length).split(".");
      const slug = labels[labels.length - 1];
      // Bare "www" (i.e. www.<base>) is the canonical apex alias, not a tenant.
      if (!slug || slug === "www") {
        return sessionStorage.getItem(SESSION_SLUG_KEY) ?? null;
      }
      return slug;
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

/**
 * Builds the absolute URL to a tenant's login page (`/login` on the tenant's
 * own origin), resolving the right host for each environment:
 *   - prod (VITE_BASE_DOMAIN set):  https://<slug>.<baseDomain>/login
 *   - localhost dev:                http://<slug>.localhost:<port>/login
 *   - anything else (tunnels, etc): <current-origin>/login?tenant=<slug>
 * The query-param form is the universal fallback since getTenantSlug() reads
 * ?tenant= first.
 */
export const getTenantLoginUrl = (slug: string): string => {
  const { protocol, hostname, port, origin } = window.location;
  const base = import.meta.env.VITE_BASE_DOMAIN as string | undefined;

  if (base) return `${protocol}//${slug}.${base}/login`;

  if (hostname.split(".").pop() === "localhost") {
    return `${protocol}//${slug}.localhost${port ? `:${port}` : ""}/login`;
  }

  return `${origin}/login?tenant=${encodeURIComponent(slug)}`;
};
