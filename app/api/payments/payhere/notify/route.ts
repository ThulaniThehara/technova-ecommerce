import { NextResponse } from "next/server";
import { settlePayHereOrder } from "@/lib/orders";
import { buildNotificationHash, getPayHereConfig, PAYHERE_STATUS, signaturesMatch } from "@/lib/payhere";
import { prisma } from "@/lib/prisma";
import { parseOrderNumber, toPayHereAmount } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/payhere/notify
 *
 * The ONLY place an order becomes PAID. PayHere calls this server-to-server, so it cannot be
 * faked by the customer's browser - and even a direct POST here is useless without the merchant
 * secret, because the md5sig would not verify.
 *
 * Deliberately NOT trusted: the browser's return_url redirect. That only navigates the user;
 * the money is confirmed here.
 *
 * Always responds 200: PayHere retries non-2xx responses, and a replay of a notification we
 * have already rejected (bad signature) or already applied would never succeed on a retry.
 */
async function handle(request: Request) {
  const ok = () => NextResponse.json({ received: true });

  let form: FormData;
  try {
    // PayHere posts application/x-www-form-urlencoded, not JSON.
    form = await request.formData();
  } catch (error) {
    console.error("[payhere/notify] could not read form body", error);
    return ok();
  }

  const field = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };

  const merchantId = field("merchant_id");
  const orderId = field("order_id");
  const payhereAmount = field("payhere_amount");
  const payhereCurrency = field("payhere_currency");
  const statusCode = field("status_code");
  const md5sig = field("md5sig");
  const paymentId = field("payment_id");

  console.log("[payhere/notify] received", { orderId, statusCode, payhereAmount, payhereCurrency, paymentId });

  let config;
  try {
    config = getPayHereConfig();
  } catch (error) {
    console.error("[payhere/notify] PayHere is not configured", error);
    return ok();
  }

  // 1. The notification must be for OUR merchant account.
  if (merchantId !== config.merchantId) {
    console.error("[payhere/notify] REJECTED: merchant_id mismatch");
    return ok();
  }

  // 2. Signature check - proves the sender knows the merchant secret.
  const expected = buildNotificationHash({
    merchantSecret: config.merchantSecret,
    merchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
  });
  if (!signaturesMatch(expected, md5sig)) {
    console.error("[payhere/notify] REJECTED: md5sig verification failed", { orderId });
    return ok();
  }

  // 3. Resolve the order the notification refers to.
  const orderNumber = parseOrderNumber(orderId);
  if (orderNumber === null) {
    console.error("[payhere/notify] REJECTED: unrecognised order_id format", { orderId });
    return ok();
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    console.error("[payhere/notify] REJECTED: unknown order", { orderId });
    return ok();
  }

  // 4. The amount actually paid must equal what we recorded. Compared numerically so that
  //    "1500.0" and "1500.00" are treated as equal, while 1 vs 1500 is not.
  const expectedAmount = toPayHereAmount(order.total);
  if (Number(payhereAmount) !== Number(expectedAmount) || payhereCurrency !== "LKR") {
    console.error("[payhere/notify] REJECTED: amount/currency mismatch", {
      orderId,
      expected: `${expectedAmount} LKR`,
      received: `${payhereAmount} ${payhereCurrency}`,
    });
    return ok();
  }

  // 5. Apply the outcome. settlePayHereOrder only acts while the order is still PENDING,
  //    so duplicate notifications are harmless.
  try {
    if (statusCode === PAYHERE_STATUS.SUCCESS) {
      const result = await settlePayHereOrder(orderNumber, "PAID", paymentId);
      console.log(`[payhere/notify] ${orderId} -> PAID (${result})`);
    } else if (statusCode === PAYHERE_STATUS.CANCELED || statusCode === PAYHERE_STATUS.FAILED) {
      const result = await settlePayHereOrder(orderNumber, "FAILED", paymentId);
      console.log(`[payhere/notify] ${orderId} -> FAILED, stock restored (${result})`);
    } else {
      // status_code 0 (pending) or 3 (chargeback): leave the order untouched for a human to review.
      console.log(`[payhere/notify] ${orderId} -> no action for status_code ${statusCode}`);
    }
  } catch (error) {
    console.error("[payhere/notify] failed to settle order", { orderId }, error);
  }

  return ok();
}

// Outer safety net. PayHere must always get a 200 (it retries anything else), and an unexpected
// error must be logged, never returned.
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    console.error("[payhere/notify] unexpected error", error);
    return NextResponse.json({ received: true });
  }
}
