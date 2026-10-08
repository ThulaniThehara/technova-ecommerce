import { Prisma } from "../generated/prisma/client";
import { STATUS_NOTE } from "./constants";
import { HttpError } from "./errors";
import { prisma } from "./prisma";
import { formatOrderNumber } from "./utils";
import type { CheckoutInput } from "./validations";

// A business-rule failure that is safe to show to the customer.
export class OrderError extends HttpError {}

// Stock policy: stock is decremented HERE, when the order is created, inside one transaction.
// It is restored when the order is CANCELLED or its payment FAILED (handled in later phases).
export async function createOrder(input: CheckoutInput, userId: string) {
  // Merge duplicate lines so the same product can't be listed twice to dodge the stock check.
  const wanted = new Map<string, number>();
  for (const { productId, quantity } of input.items) {
    wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(
    async (tx) => {
      // 1. Load products from the DB - prices and stock never come from the client.
      const products = await tx.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
      const byId = new Map(products.map((p) => [p.id, p]));

      // 2. Validate every line and compute the total from DB prices only.
      let total = new Prisma.Decimal(0);
      const lines: { product: (typeof products)[number]; quantity: number }[] = [];
      for (const [productId, quantity] of wanted) {
        const product = byId.get(productId);
        if (!product || !product.isActive) {
          throw new OrderError("A product in your cart is no longer available. Please review your cart.");
        }
        if (product.stock < quantity) {
          throw new OrderError(
            product.stock === 0 ? `${product.name} is out of stock` : `Only ${product.stock} of ${product.name} left in stock`,
          );
        }
        total = total.add(product.price.mul(quantity));
        lines.push({ product, quantity });
      }

      // 3. Conditional decrement: the WHERE stock >= qty is evaluated atomically by Postgres,
      //    so two simultaneous buyers can never push stock below zero.
      for (const { product, quantity } of lines) {
        const result = await tx.product.updateMany({
          where: { id: product.id, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (result.count === 0) throw new OrderError(`Insufficient stock for ${product.name}`);
      }

      // 4. The customer is checking out their cart, so empty the saved cart in this same
      //    transaction: if the order fails, the cart is kept; if it succeeds, the ordered items
      //    cannot come back from the server on the next page load.
      await tx.cartItem.deleteMany({ where: { cart: { userId } } });

      // 5. Create the order with snapshot fields (name + price at purchase time).
      return tx.order.create({
        data: {
          // The owner is the authenticated customer. It is passed in by the route handler from
          // the verified session and is deliberately NOT part of CheckoutInput, so a request
          // body can never claim an order for somebody else.
          userId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          phone: input.phone,
          address: input.address,
          city: input.city,
          notes: input.notes || null,
          // First entry of the tracking timeline.
          statusHistory: { create: { status: "PENDING", note: STATUS_NOTE.PENDING } },
          total,
          paymentMethod: input.paymentMethod,
          items: {
            create: lines.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity,
            })),
          },
        },
        include: { items: true },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );
}

type Tx = Prisma.TransactionClient;

/**
 * THE one place an order is cancelled and its stock given back. Used by both the admin
 * "cancel order" action and a failed PayHere payment.
 *
 * It is idempotent: the status flip is a conditional updateMany (`orderStatus != CANCELLED`),
 * and stock is only restored if that flip actually changed a row. So no matter how many times,
 * or in which order, an admin cancel and a PayHere failure notification arrive, stock is
 * restored exactly once. Must be called inside a transaction.
 *
 * Returns true if this call performed the cancellation.
 */
export async function cancelOrderAndRestoreStock(
  tx: Tx,
  where: { id: string } | { orderNumber: number },
  note: string = STATUS_NOTE.CANCELLED,
): Promise<boolean> {
  const flipped = await tx.order.updateMany({
    where: { ...where, orderStatus: { not: "CANCELLED" } },
    data: { orderStatus: "CANCELLED" },
  });
  if (flipped.count === 0) return false;

  const order = await tx.order.findFirstOrThrow({ where, select: { id: true } });
  await tx.orderStatusHistory.create({ data: { orderId: order.id, status: "CANCELLED", note } });

  const items = await tx.orderItem.findMany({ where: { order: where } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
  return true;
}

/**
 * Settle a PayHere payment. The first step is a conditional updateMany whose WHERE includes
 * `paymentStatus: PENDING`, so Postgres decides the winner: if PayHere delivers the same
 * notification twice (it retries), the second call changes 0 rows and we stop there.
 */
export async function settlePayHereOrder(
  orderNumber: number,
  outcome: "PAID" | "FAILED",
  paymentId?: string,
): Promise<"applied" | "already-settled"> {
  return prisma.$transaction(
    async (tx) => {
      const payment = await tx.order.updateMany({
        where: { orderNumber, paymentMethod: "PAYHERE", paymentStatus: "PENDING" },
        data: { paymentStatus: outcome, payherePaymentId: paymentId ?? null },
      });
      if (payment.count === 0) return "already-settled";

      if (outcome === "PAID") {
        // Only a still-PENDING order becomes CONFIRMED. If an admin already cancelled it,
        // it stays CANCELLED (the money then needs a manual refund) rather than being revived
        // without any stock behind it. Payment status and order status are separate: PAID
        // describes the money, CONFIRMED describes where the order is in fulfilment.
        const confirmed = await tx.order.updateMany({
          where: { orderNumber, orderStatus: "PENDING" },
          data: { orderStatus: "CONFIRMED" },
        });
        if (confirmed.count > 0) {
          const order = await tx.order.findUniqueOrThrow({ where: { orderNumber }, select: { id: true } });
          await tx.orderStatusHistory.create({
            data: { orderId: order.id, status: "CONFIRMED", note: "Payment received and order confirmed" },
          });
        }
      } else {
        // Stock policy: stock was taken when the order was created, so a failed payment
        // cancels the order and gives it back (a no-op if an admin already did).
        await cancelOrderAndRestoreStock(tx, { orderNumber }, "Payment was not completed");
      }
      return "applied";
    },
    { maxWait: 10000, timeout: 15000 },
  );
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Plain JSON shape (Decimals as 2-decimal strings) for API responses and the WhatsApp message.
export function serializeOrder(order: OrderWithItems) {
  return {
    id: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    orderCode: formatOrderNumber(order.orderNumber),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    phone: order.phone,
    address: order.address,
    city: order.city,
    notes: order.notes,
    total: order.total.toFixed(2),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      productName: i.productName,
      unitPrice: i.unitPrice.toFixed(2),
      quantity: i.quantity,
      lineTotal: i.unitPrice.mul(i.quantity).toFixed(2),
    })),
  };
}

export type SerializedOrder = ReturnType<typeof serializeOrder>;
