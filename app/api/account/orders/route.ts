import { parseStatusFilter } from "@/lib/admin-orders";
import { handleError, ok } from "@/lib/api";
import { listCustomerOrders } from "@/lib/account";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/account/orders?status=PENDING&q=TN-0007 - only the signed-in customer's own orders
export async function GET(request: Request) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    const params = new URL(request.url).searchParams;
    const status = parseStatusFilter(params.get("status"));
    const q = params.get("q")?.trim().slice(0, 30) || undefined;
    return ok(await listCustomerOrders(customer.id, status, q));
  } catch (error) {
    return handleError(error, "GET /api/account/orders");
  }
}
