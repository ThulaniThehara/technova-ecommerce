import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CUSTOMER_COOKIE, SESSION_COOKIE, verifySession } from "@/lib/session";

// FIRST gate for the protected areas. It only checks the signed JWT (no database), so it stays
// fast. It is deliberately not the only gate: every admin/customer API handler calls
// requireAdmin()/requireCustomer() and every protected page re-checks on the server, because a
// proxy/middleware bypass must never expose data.
//
//   /admin/*, /api/admin/*      -> ADMIN session (separate cookie)
//   /checkout, /account/*       -> CUSTOMER session (separate cookie)
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // ───── customer area ─────
  if (pathname === "/checkout" || pathname.startsWith("/account")) {
    const customer = await verifySession(request.cookies.get(CUSTOMER_COOKIE)?.value, "CUSTOMER");
    if (!customer) {
      // Send them to sign in, and bring them straight back afterwards. The cart is in the
      // browser, so nothing is lost on the way.
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  // ───── admin area ─────
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, "ADMIN");

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // /admin pages
  const isLoginPage = pathname === "/admin/login";
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/checkout", "/account/:path*", "/account"],
};
