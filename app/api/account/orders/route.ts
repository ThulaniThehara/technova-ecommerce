import { parseStatusFilter } from "@/lib/admin-orders";
import { handleError, ok } from "@/lib/api";
import { listCustomerOrders } from "@/lib/account";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/account/orders?status=PENDING - only the signed-in customer's own orders
export async function GET(request: Request) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    const status = parseStatusFilter(new URL(request.url).searchParams.get("status"));
    return ok(await listCustomerOrders(customer.id, status));
  } catch (error) {
    return handleError(error, "GET /api/account/orders");
  }
}
