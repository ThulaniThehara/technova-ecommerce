import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { fail, handleError, readBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clearFailures, isLimited, recordFailure } from "@/lib/rate-limit";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, sessionCookie, signSession } from "@/lib/session";
import { customerLoginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// One message for every failure, so the response never reveals whether an email is registered.
const INVALID = "Invalid email or password.";

// Compared against when the email is unknown, so "no such user" costs the same time as a wrong
// password and the response time does not reveal which emails exist.
const dummyHash = bcrypt.hash("not-a-real-password", 12);

// POST /api/auth/login - CUSTOMER login. (Admins use /api/auth/admin/login.)
export async function POST(request: Request) {
  try {
    const body = await readBody(request, customerLoginSchema);
    if (body.response) return body.response;
    const { email, password } = body.data;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limitKey = `customer:${ip}:${email}`;
    if (isLimited(limitKey)) return fail("Too many failed attempts. Please try again in a few minutes.", 429);

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash));

    // An ADMIN account is rejected here exactly like a wrong password: admins use their own login,
    // and cannot be used as customers.
    if (!user || !passwordOk || user.role !== "CUSTOMER") {
      recordFailure(limitKey);
      return fail(INVALID, 401);
    }

    clearFailures(limitKey);
    const response = NextResponse.json({ success: true, data: { name: user.name, email: user.email } });
    response.cookies.set(CUSTOMER_COOKIE, await signSession(user.id, "CUSTOMER", user.name), sessionCookie(CUSTOMER_SESSION_MAX_AGE));
    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/login");
  }
}
