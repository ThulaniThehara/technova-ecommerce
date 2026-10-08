import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { CUSTOMER_COOKIE, SESSION_COOKIE, verifySession } from "./session";

export type Admin = { id: string; name: string; email: string };
export type Customer = { id: string; name: string; email: string; phone: string | null };

// ───────────── Admin ─────────────

// Reads the session cookie, verifies the JWT, then re-checks the user in the database,
// so deleting an admin (or changing their role) takes effect immediately instead of
// waiting for the token to expire.
export async function getAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token, "ADMIN");
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return null;
  return { id: user.id, name: user.name, email: user.email };
}

// For API route handlers. Call it at the top of EVERY admin handler - the proxy is a first
// gate, not the only one (a 2025 Next.js bug let requests skip middleware entirely):
//
//   const { admin, response } = await requireAdmin();
//   if (response) return response;
export async function requireAdmin(): Promise<
  { admin: Admin; response?: never } | { admin?: never; response: NextResponse }
> {
  let admin: Admin | null;
  try {
    admin = await getAdmin();
  } catch (error) {
    // e.g. the database is unreachable. Fail closed (no access) with a clean JSON body.
    console.error("requireAdmin could not verify the session", error);
    return {
      response: NextResponse.json({ success: false, message: "Could not verify your session. Please try again." }, { status: 503 }),
    };
  }
  if (!admin) {
    return { response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) };
  }
  return { admin };
}

// ───────────── Customer ─────────────

/**
 * The signed-in customer, or null. The user id comes ONLY from the verified session cookie
 * (never from a request body or URL), and the account is re-read from the database every time,
 * so a deleted account or a changed role stops working immediately.
 * Admin accounts are rejected here: they cannot check out as customers.
 */
export async function getCustomer(): Promise<Customer | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  const session = await verifySession(token, "CUSTOMER");
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  if (!user || user.role !== "CUSTOMER") return null;
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

/**
 * Cheap check for the layout/navbar: verifies the token only (no database call) and returns
 * the display name. NEVER use this to authorise anything; use getCustomer()/requireCustomer().
 */
export async function getCustomerDisplay(): Promise<{ id: string; name: string } | null> {
  const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
  const session = await verifySession(token, "CUSTOMER");
  return session ? { id: session.userId, name: session.name ?? "Account" } : null;
}

// For customer API handlers:
//
//   const { customer, response } = await requireCustomer();
//   if (response) return response;
export async function requireCustomer(): Promise<
  { customer: Customer; response?: never } | { customer?: never; response: NextResponse }
> {
  let customer: Customer | null;
  try {
    customer = await getCustomer();
  } catch (error) {
    console.error("requireCustomer could not verify the session", error);
    return {
      response: NextResponse.json({ success: false, message: "Could not verify your session. Please try again." }, { status: 503 }),
    };
  }
  if (!customer) {
    return { response: NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 }) };
  }
  return { customer };
}
