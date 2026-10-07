import type { OrderStatus } from "../generated/prisma/client";
import { ORDER_STATUSES } from "./constants";
import { HttpError } from "./errors";
import { cancelOrderAndRestoreStock, serializeOrder } from "./orders";
import { prisma } from "./prisma";

export function parseStatusFilter(value: string | null | undefined): OrderStatus | undefined {
  return ORDER_STATUSES.find((s) => s === value);
}

export async function listAdminOrders(status?: OrderStatus, take = 200) {
  const rows = await prisma.order.findMany({
    where: status ? { orderStatus: status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(serializeOrder);
}

export async function getAdminOrder(id: string) {
  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  return row ? serializeOrder(row) : null;
}

/**
 * Apply an admin change to an order inside ONE transaction, so a cancel and its stock
 * restore either both happen or neither does.
 *
 * Rules:
 *  - A cancelled order is final. Re-opening it would need stock re-taken, which could
 *    oversell, so it is refused.
 *  - A completed order cannot be cancelled (it has been delivered).
 *  - Cancelling goes through cancelOrderAndRestoreStock, the same idempotent function the
 *    PayHere failure path uses, so stock comes back exactly once.
 *  - Payment status is only editable for WhatsApp orders (paid outside the site). PayHere
 *    payments are only ever changed by PayHere's verified server notification.
 */
export async function updateAdminOrder(
  id: string,
  patch: { orderStatus?: OrderStatus; paymentStatus?: "PENDING" | "PAID" },
) {
  await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        select: { orderStatus: true, paymentMethod: true, paymentStatus: true },
      });
      if (!order) throw new HttpError("Order not found", 404);

      const nextStatus = patch.orderStatus;
      const nextPayment = patch.paymentStatus;

      if (nextPayment && nextPayment !== order.paymentStatus) {
        if (order.paymentMethod !== "WHATSAPP") {
          throw new HttpError("Online payments are confirmed automatically by PayHere and cannot be edited.", 409);
        }
        if (order.orderStatus === "CANCELLED" || nextStatus === "CANCELLED") {
          throw new HttpError("The payment status of a cancelled order cannot be changed.", 409);
        }
        await tx.order.update({ where: { id }, data: { paymentStatus: nextPayment } });
      }

      if (nextStatus && nextStatus !== order.orderStatus) {
        if (order.orderStatus === "CANCELLED") {
          throw new HttpError("A cancelled order cannot be re-opened. Ask the customer to place a new order.", 409);
        }
        if (nextStatus === "CANCELLED") {
          if (order.orderStatus === "COMPLETED") {
            throw new HttpError("A completed order cannot be cancelled.", 409);
          }
          await cancelOrderAndRestoreStock(tx, { id });
        } else {
          // Conditional on not being cancelled, so a concurrent cancel can never be undone.
          const moved = await tx.order.updateMany({
            where: { id, orderStatus: { not: "CANCELLED" } },
            data: { orderStatus: nextStatus },
          });
          if (moved.count === 0) throw new HttpError("This order was just cancelled and can no longer be changed.", 409);
        }
      }
    },
    { maxWait: 10000, timeout: 15000 },
  );

  return getAdminOrder(id);
}
