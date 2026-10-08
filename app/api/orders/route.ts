import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth";
import { createOrder, OrderError, serializeOrder } from "@/lib/orders";
import { checkoutSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// POST /api/orders - customers only. Prices, totals and stock are decided here, not by the client,
// and the order is owned by the account in the verified session (never a user id from the body).
export async function POST(request: Request) {
  // 1. Must be a signed-in CUSTOMER. Anonymous callers and admin accounts get 401.
  const { customer, response } = await requireCustomer();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  // 2. Validate. checkoutSchema has no userId/price/total fields: unknown keys are simply dropped.
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }

  try {
    const order = await createOrder(parsed.data, customer.id);
    return NextResponse.json({ success: true, data: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("POST /api/orders failed", error);
    return NextResponse.json({ success: false, message: "Could not place your order. Please try again." }, { status: 500 });
  }
}
