import { jwtVerify, SignJWT } from "jose";

// No database access here on purpose: proxy.ts imports this file, and it must stay light.

export type SessionRole = "ADMIN" | "CUSTOMER";

// Admins and customers get DIFFERENT cookies with different lifetimes. A customer token is
// rejected by every admin check (wrong cookie and wrong role claim), and vice versa.
export const SESSION_COOKIE = "technova_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // admin: 8 hours (cookie and JWT use the same lifetime)
export const CUSTOMER_COOKIE = "technova_customer_session";
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // customer: 7 days

const lifetime = (role: SessionRole) => (role === "ADMIN" ? SESSION_MAX_AGE : CUSTOMER_SESSION_MAX_AGE);

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export type Session = { userId: string; role: SessionRole; name?: string };

// `name` is only a display hint (so the navbar can say "Hi, Ashan" without a database call).
// It is never used for authorisation: that always uses userId + role + a database lookup.
export async function signSession(userId: string, role: SessionRole, name?: string): Promise<string> {
  return new SignJWT({ role, ...(name ? { name } : {}) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${lifetime(role)}s`)
    .sign(secretKey());
}

// Returns null for anything wrong (missing, malformed, wrong signature, expired, wrong role,
// missing secret). It fails closed: callers treat null as "not logged in".
export async function verifySession(token: string | undefined, expectedRole: SessionRole = "ADMIN"): Promise<Session | null> {
  if (!token) return null;
  try {
    // Pinning the algorithm blocks "alg: none" and algorithm-confusion tricks.
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== expectedRole || typeof payload.sub !== "string") return null;
    return { userId: payload.sub, role: expectedRole, name: typeof payload.name === "string" ? payload.name : undefined };
  } catch {
    return null;
  }
}

/** Cookie attributes shared by login, signup, profile update and logout. */
export function sessionCookie(maxAge: number) {
  return {
    httpOnly: true, // not readable from JavaScript, so XSS can't steal the session
    secure: process.env.NODE_ENV === "production", // HTTPS only in production (localhost dev is plain http)
    sameSite: "lax" as const, // not sent on cross-site POSTs, which blunts CSRF
    path: "/",
    maxAge,
  };
}
