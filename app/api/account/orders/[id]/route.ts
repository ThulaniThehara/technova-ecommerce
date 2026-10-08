import { fail, handleError, ok } from "@/lib/api";
import { getCustomerOrder } from "@/lib/account";
import { requireCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/account/orders/:id - 404 unless the order belongs to the signed-in customer
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    const order = await getCustomerOrder(customer.id, (await params).id);
    // Someone else's order and a missing order look identical on purpose.
    return order ? ok(order) : fail("Order not found", 404);
  } catch (error) {
    return handleError(error, "GET /api/account/orders/[id]");
  }
}
