import { fail, handleError, ok } from "@/lib/api";
import { getCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/:id/status
 * Used by the order-success page to poll while PayHere's server notification lands.
 *
 * Returns only the two status fields - no customer details - so the unguessable order id
 * being in a URL cannot leak personal data.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { paymentStatus: true, orderStatus: true, userId: true },
    });
    // Orders belong to a customer: only the owner may look. (Orders from before accounts existed
    // have no owner and stay reachable by their unguessable id, as before.)
    if (!order) return fail("Order not found", 404);
    if (order.userId && order.userId !== (await getCustomer())?.id) return fail("Order not found", 404);

    return ok({ paymentStatus: order.paymentStatus, orderStatus: order.orderStatus });
  } catch (error) {
    return handleError(error, "GET /api/orders/[id]/status");
  }
}
