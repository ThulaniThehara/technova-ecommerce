import { handleError, ok, readBody } from "@/lib/api";
import { requireCustomer } from "@/lib/auth";
import { mergeIntoServerCart } from "@/lib/server-cart";
import { cartItemsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// POST /api/cart/merge { items } - merge the browser cart into the saved cart; returns the merged cart
export async function POST(request: Request) {
  try {
    const { customer, response } = await requireCustomer();
    if (response) return response;
    const body = await readBody(request, cartItemsSchema);
    if (body.response) return body.response;
    return ok(await mergeIntoServerCart(customer.id, body.data.items));
  } catch (error) {
    return handleError(error, "POST /api/cart/merge");
  }
}
