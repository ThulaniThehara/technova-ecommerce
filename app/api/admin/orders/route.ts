import { listAdminOrders, parseStatusFilter } from "@/lib/admin-orders";
import { handleError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/orders?status=PENDING - admin only (second gate; proxy.ts is the first)
export async function GET(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const status = parseStatusFilter(new URL(request.url).searchParams.get("status"));
    return ok(await listAdminOrders(status));
  } catch (error) {
    return handleError(error, "GET /api/admin/orders");
  }
}
