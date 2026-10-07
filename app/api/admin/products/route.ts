import { createProduct, listAdminProducts } from "@/lib/admin-products";
import { handleError, ok, readBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/admin/products - every product, including inactive ones
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    return ok(await listAdminProducts());
  } catch (error) {
    return handleError(error, "GET /api/admin/products");
  }
}

// POST /api/admin/products
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await readBody(request, productSchema);
  if (body.response) return body.response;

  try {
    return ok(await createProduct(body.data), 201);
  } catch (error) {
    return handleError(error, "POST /api/admin/products");
  }
}
