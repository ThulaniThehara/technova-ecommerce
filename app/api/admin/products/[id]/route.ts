import { deleteProduct, getAdminProduct, updateProduct } from "@/lib/admin-products";
import { fail, handleError, ok, readBody } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productPatchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/products/:id
export async function GET(_request: Request, { params }: Ctx) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const product = await getAdminProduct((await params).id);
    return product ? ok(product) : fail("Product not found", 404);
  } catch (error) {
    return handleError(error, "GET /api/admin/products/[id]");
  }
}

// PATCH /api/admin/products/:id - any subset of fields (full edit, inline stock, active toggle)
export async function PATCH(request: Request, { params }: Ctx) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await readBody(request, productPatchSchema);
  if (body.response) return body.response;

  try {
    return ok(await updateProduct((await params).id, body.data));
  } catch (error) {
    return handleError(error, "PATCH /api/admin/products/[id]");
  }
}

// DELETE /api/admin/products/:id - refused (409) if the product appears on any order
export async function DELETE(_request: Request, { params }: Ctx) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await deleteProduct((await params).id);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error, "DELETE /api/admin/products/[id]");
  }
}
