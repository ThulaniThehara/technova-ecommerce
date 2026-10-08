import type { NextConfig } from "next";

// Baseline security headers for every response. A strict Content-Security-Policy is deliberately
// not set: it would need a nonce for Next's inline scripts and an allow-list for PayHere, and a
// wrong CSP breaks checkout. These headers are the low-risk, high-value set.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" }, // browsers must not guess a file's type
  { key: "X-Frame-Options", value: "DENY" }, // nobody can embed the site in an iframe (clickjacking)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // order ids in URLs don't leak to other sites
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" }, // the site uses none of these
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }, // HTTPS only (ignored on http://localhost)
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin pages and APIs hold private data: never let a browser or CDN cache them.
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
