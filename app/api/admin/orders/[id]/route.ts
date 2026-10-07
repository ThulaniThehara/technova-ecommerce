import { getAdminOrder, updateAdminOrder } from "@/lib/admin-orders";
import { fail, handleError, ok, readBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { orderPatchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/orders/:id
export async function GET(_request: Request, { params }: Ctx) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const order = await getAdminOrder((await params).id);
    return order ? ok(order) : fail("Order not found", 404);
  } catch (error) {
    return handleError(error, "GET /api/admin/orders/[id]");
  }
}

// PATCH /api/admin/orders/:id  { orderStatus?, paymentStatus? }
// Cancelling restores stock inside the same transaction.
export async function PATCH(request: Request, { params }: Ctx) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await readBody(request, orderPatchSchema);
  if (body.response) return body.response;

  try {
    return ok(await updateAdminOrder((await params).id, body.data));
  } catch (error) {
    return handleError(error, "PATCH /api/admin/orders/[id]");
  }
}
