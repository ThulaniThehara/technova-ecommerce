import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySession } from "./session";

export type Admin = { id: string; name: string; email: string };

// Reads the session cookie, verifies the JWT, then re-checks the user in the database,
// so deleting an admin (or changing their role) takes effect immediately instead of
// waiting for the token to expire.
export async function getAdmin(): Promise<Admin | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
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
