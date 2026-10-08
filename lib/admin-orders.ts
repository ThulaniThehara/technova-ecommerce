import type { OrderStatus } from "../generated/prisma/client";
import { allowedNextStatuses, ORDER_STATUSES, STATUS_NOTE, statusLabel } from "./constants";
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
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  return row
    ? {
        ...serializeOrder(row),
        history: row.statusHistory.map((h) => ({
          status: h.status,
          note: h.note,
          createdAt: h.createdAt.toISOString(),
        })),
      }
    : null;
}

/**
 * Apply an admin change to an order inside ONE transaction, so a cancel and its stock
 * restore either both happen or neither does.
 *
 * Rules:
 *  - Status moves forward only (see allowedNextStatuses) and every change is written to the
 *    order's tracking history. A cancelled order is final: re-opening it would need stock
 *    re-taken, which could oversell. A delivered order cannot be cancelled.
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
        // Same status = nothing to do (no duplicate timeline entry). Otherwise it must be a
        // valid move: forward only, or cancel before delivery.
        if (!allowedNextStatuses(order.orderStatus).includes(nextStatus)) {
          throw new HttpError(
            order.orderStatus === "CANCELLED"
              ? "A cancelled order cannot be re-opened. Ask the customer to place a new order."
              : `An order that is ${statusLabel(order.orderStatus)} cannot be moved to ${statusLabel(nextStatus)}.`,
            409,
          );
        }
        if (nextStatus === "CANCELLED") {
          await cancelOrderAndRestoreStock(tx, { id }, "Cancelled by administrator");
        } else {
          // Conditional on the status we just read, so two admins (or a concurrent cancel)
          // can never overwrite each other.
          const moved = await tx.order.updateMany({
            where: { id, orderStatus: order.orderStatus },
            data: { orderStatus: nextStatus },
          });
          if (moved.count === 0) throw new HttpError("This order was just changed by someone else. Please reload.", 409);
          await tx.orderStatusHistory.create({ data: { orderId: id, status: nextStatus, note: STATUS_NOTE[nextStatus] } });
        }
      }
    },
    { maxWait: 10000, timeout: 15000 },
  );

  return getAdminOrder(id);
}
