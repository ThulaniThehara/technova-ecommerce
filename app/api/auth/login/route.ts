import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clearFailures, isLimited, recordFailure } from "@/lib/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";
import { handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

// One generic message for every failure, so the response never reveals whether an email exists.
const INVALID = { success: false, message: "Invalid email or password." };

// Compared against when the email is unknown, so "no such user" costs the same time as
// "wrong password" and response timing doesn't leak which emails are registered.
const dummyHash = bcrypt.hash("not-a-real-password", 12);

async function handle(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const limitKey = `${ip}:${email}`;
  if (isLimited(limitKey)) {
    return NextResponse.json(
      { success: false, message: "Too many failed attempts. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? (await dummyHash));

  if (!user || !passwordOk || user.role !== "ADMIN") {
    recordFailure(limitKey);
    return NextResponse.json(INVALID, { status: 401 });
  }

  clearFailures(limitKey);
  const token = await signSession(user.id, "ADMIN");
  const response = NextResponse.json({ success: true, data: { name: user.name, email: user.email } });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript, so XSS can't steal the session
    secure: process.env.NODE_ENV === "production", // HTTPS only in production (localhost dev is plain http)
    sameSite: "lax", // not sent on cross-site POSTs, which blunts CSRF
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

// Outer safety net: whatever goes wrong inside, the client gets {success, message} and never a
// stack trace. The real error stays in the server log.
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return handleError(error, "POST /api/auth/login");
  }
}
