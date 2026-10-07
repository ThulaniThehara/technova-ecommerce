import { handleError, ok } from "@/lib/api";
import { getDashboardStats } from "@/lib/admin-stats";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/dashboard
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    return ok(await getDashboardStats());
  } catch (error) {
    return handleError(error, "GET /api/admin/dashboard");
  }
}
