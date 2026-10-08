/**
 * After login the customer is sent back to where they were going (e.g. /checkout). That target
 * comes from the URL, so it must be validated: otherwise /login?redirect=https://evil.example
 * would bounce a freshly signed-in user to an attacker's site (an "open redirect").
 * Only same-site paths are allowed.
 */
export function safeRedirect(value: string | string[] | null | undefined, fallback = "/account"): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "string") return fallback;
  // must be a path ("/x"), not protocol-relative ("//host") or backslash tricks ("/\host")
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(raw)) return fallback;
  // never "redirect" into the API or the admin area from the customer login
  if (raw.startsWith("/api") || raw.startsWith("/admin")) return fallback;
  return raw;
}
