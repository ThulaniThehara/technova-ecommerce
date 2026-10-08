import { updateAdminOrder } from "@/lib/admin-orders";
import { handleError, ok, readBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// PATCH /api/admin/orders/:id/status  { "status": "SHIPPED" }
// Admin only. Same rules as PATCH /api/admin/orders/:id: forward-only moves, a timeline entry
// for every change, and stock returned on cancel.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await readBody(request, orderStatusSchema);
  if (body.response) return body.response;

  try {
    return ok(await updateAdminOrder((await params).id, { orderStatus: body.data.status }));
  } catch (error) {
    return handleError(error, "PATCH /api/admin/orders/[id]/status");
  }
}
