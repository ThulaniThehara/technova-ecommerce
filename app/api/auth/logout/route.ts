import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, SESSION_COOKIE, sessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST (not GET) so a link or image on another site can't log anyone out.
// Clears BOTH session cookies: whichever kind of user is signed in, they are signed out.
// The cart is deliberately left alone (it lives in the browser and in the database).
export async function POST() {
  const response = NextResponse.json({ success: true });
  for (const name of [SESSION_COOKIE, CUSTOMER_COOKIE]) {
    response.cookies.set(name, "", { ...sessionCookie(0), maxAge: 0 });
  }
  return response;
}
