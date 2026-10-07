import { jwtVerify, SignJWT } from "jose";

// No database access here on purpose: proxy.ts imports this file, and it must stay light.

export const SESSION_COOKIE = "technova_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds (cookie + JWT use the same lifetime)

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export type Session = { userId: string; role: "ADMIN" };

export async function signSession(userId: string, role: "ADMIN"): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

// Returns null for anything wrong (missing, malformed, wrong signature, expired, wrong role,
// missing secret). It fails closed: callers treat null as "not logged in".
export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    // Pinning the algorithm blocks "alg: none" and algorithm-confusion tricks.
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.role !== "ADMIN" || typeof payload.sub !== "string") return null;
    return { userId: payload.sub, role: "ADMIN" };
  } catch {
    return null;
  }
}
