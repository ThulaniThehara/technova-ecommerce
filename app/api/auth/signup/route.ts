import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { Prisma } from "../../../../generated/prisma/client";
import { fail, handleError, readBody } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isLimited, recordFailure } from "@/lib/rate-limit";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, sessionCookie, signSession } from "@/lib/session";
import { signupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const DUPLICATE = "An account with this email already exists.";

// POST /api/auth/signup - creates a CUSTOMER account and signs it in.
export async function POST(request: Request) {
  try {
    const body = await readBody(request, signupSchema);
    if (body.response) return body.response;
    const { name, email, phone, password } = body.data;

    // Every attempt counts (not only failures): stops one address creating accounts in bulk.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limitKey = `signup:${ip}`;
    if (isLimited(limitKey)) return fail("Too many sign-up attempts. Please try again in a few minutes.", 429);
    recordFailure(limitKey);

    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) return fail(DUPLICATE, 409);

    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    try {
      // The role is set here, on the server, to CUSTOMER. The request body has no say in it.
      user = await prisma.user.create({ data: { name, email, phone, passwordHash, role: "CUSTOMER" } });
    } catch (error) {
      // Two sign-ups with the same email racing each other: the unique index lets only one win.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return fail(DUPLICATE, 409);
      throw error;
    }

    const response = NextResponse.json({ success: true, data: { name: user.name, email: user.email } }, { status: 201 });
    response.cookies.set(CUSTOMER_COOKIE, await signSession(user.id, "CUSTOMER", user.name), sessionCookie(CUSTOMER_SESSION_MAX_AGE));
    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/signup");
  }
}
