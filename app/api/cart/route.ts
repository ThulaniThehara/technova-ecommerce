import { handleError, ok, readBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth";
import { getServerCart, replaceServerCart } from "@/lib/server-cart";
import { cartItemsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/cart - the signed-in customer's saved cart
export async function GET() {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    return ok(await getServerCart(customer.id));
  } catch (error) {
    return handleError(error, "GET /api/cart");
  }
}

// PUT /api/cart { items: [{ productId, quantity }] } - replace the saved cart (the user id comes from the session)
export async function PUT(request: Request) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    const body = await readBody(request, cartItemsSchema);
    if (body.response) return body.response;
    return ok(await replaceServerCart(customer.id, body.data.items));
  } catch (error) {
    return handleError(error, "PUT /api/cart");
  }
}
