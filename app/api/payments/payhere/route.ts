import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildCheckoutHash,
  getPayHereConfig,
  PAYHERE_CHECKOUT_URL,
  PAYHERE_CURRENCY,
  splitCustomerName,
} from "@/lib/payhere";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatOrderNumber, toPayHereAmount } from "@/lib/utils";
import { handleError } from "@/lib/api";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ orderId: z.string().min(1) });

/**
 * POST /api/payments/payhere
 * Returns the exact fields the browser must POST to PayHere, including the hash.
 *
 * The client sends only an order id. Everything that matters - the amount, the currency and
 * the hash - is read from the database and computed here, so a tampered browser cannot pay
 * Rs. 1 for a Rs. 300,000 order: the hash would not match the amount PayHere receives.
 */
async function handle(request: Request) {
  // Only a signed-in customer can start a payment, and only for their OWN order (checked below).
  const { customer, response: authResponse } = await requireCustomer();
  if (authResponse) return authResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
  }

  let config;
  try {
    config = getPayHereConfig();
  } catch (error) {
    console.error("PayHere configuration missing", error);
    return NextResponse.json(
      { success: false, message: "Online payment is unavailable right now. Please order via WhatsApp." },
      { status: 503 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: true },
  });

  // Someone else's order gets the same answer as a missing one, so ids can't be probed.
  if (!order || order.userId !== customer.id) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }
  if (order.paymentMethod !== "PAYHERE") {
    return NextResponse.json({ success: false, message: "This order is not an online payment" }, { status: 409 });
  }
  if (order.paymentStatus !== "PENDING") {
    return NextResponse.json({ success: false, message: "This order has already been settled" }, { status: 409 });
  }

  const orderCode = formatOrderNumber(order.orderNumber);
  const amount = toPayHereAmount(order.total);
  const { firstName, lastName } = splitCustomerName(order.customerName);

  const hash = buildCheckoutHash({
    merchantId: config.merchantId,
    merchantSecret: config.merchantSecret,
    orderId: orderCode,
    amount,
    currency: PAYHERE_CURRENCY,
  });

  // notify_url is a server-to-server callback: it must be a public HTTPS URL, so this flow
  // only completes on the deployed site, never on localhost.
  const fields: Record<string, string> = {
    merchant_id: config.merchantId,
    return_url: `${config.appUrl}/order-success?order=${order.id}`,
    cancel_url: `${config.appUrl}/order-success?order=${order.id}&cancelled=1`,
    notify_url: `${config.appUrl}/api/payments/payhere/notify`,
    order_id: orderCode,
    items: order.items.length === 1 ? order.items[0].productName : `TechNova order ${orderCode}`,
    currency: PAYHERE_CURRENCY,
    amount,
    first_name: firstName,
    last_name: lastName,
    email: order.customerEmail,
    phone: order.phone,
    address: order.address,
    city: order.city,
    country: "Sri Lanka",
    hash,
  };

  return NextResponse.json({ success: true, data: { checkoutUrl: PAYHERE_CHECKOUT_URL, fields } });
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return handleError(error, "POST /api/payments/payhere");
  }
}
