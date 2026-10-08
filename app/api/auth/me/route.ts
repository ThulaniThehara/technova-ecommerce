import { handleError, ok } from "@/lib/api";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/auth/me - the signed-in customer (never the password hash), or 401.
export async function GET() {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    return ok(customer);
  } catch (error) {
    return handleError(error, "GET /api/auth/me");
  }
}
