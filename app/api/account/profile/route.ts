import { NextResponse } from "next/server";
import { updateCustomerProfile } from "@/lib/account";
import { handleError, readBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth";
import { CUSTOMER_COOKIE, CUSTOMER_SESSION_MAX_AGE, sessionCookie, signSession } from "@/lib/session";
import { profileSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// PATCH /api/account/profile { name, phone } - the user id comes from the session, not the body.
export async function PATCH(request: Request) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;

    const body = await readBody(request, profileSchema);
    if (body.response) return body.response;

    const user = await updateCustomerProfile(customer.id, body.data);

    // The navbar greeting reads the name from the session token, so issue a fresh one.
    const res = NextResponse.json({ success: true, data: user });
    res.cookies.set(CUSTOMER_COOKIE, await signSession(user.id, "CUSTOMER", user.name), sessionCookie(CUSTOMER_SESSION_MAX_AGE));
    return res;
  } catch (error) {
    return handleError(error, "PATCH /api/account/profile");
  }
}
