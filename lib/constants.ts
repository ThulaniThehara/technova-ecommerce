// A product at or below this many units counts as "low stock" everywhere:
// the storefront badge, the admin dashboard count and the admin product table.
export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

// COMPLETED is the stored value; customers and admins see it as "Delivered".
// (The value is kept as COMPLETED so the live database never needs a destructive rename.)
export const ORDER_STATUS_LABEL: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  COMPLETED: "Delivered",
  CANCELLED: "Cancelled",
};

export const statusLabel = (s: string) =>
  ORDER_STATUS_LABEL[s as OrderStatusValue] ?? s.charAt(0) + s.slice(1).toLowerCase();

// The steps of the tracking timeline, in order. CANCELLED is not a step: it ends the journey.
export const TRACK_STEPS = [
  { status: "PENDING", label: "Order Placed", hint: "We have received your order." },
  { status: "CONFIRMED", label: "Confirmed", hint: "Your order has been confirmed." },
  { status: "PROCESSING", label: "Processing", hint: "Your items are being prepared." },
  { status: "SHIPPED", label: "Shipped", hint: "Your order is on its way." },
  { status: "COMPLETED", label: "Delivered", hint: "Your order has been delivered." },
] as const satisfies readonly { status: OrderStatusValue; label: string; hint: string }[];

const FLOW = TRACK_STEPS.map((s) => s.status) as OrderStatusValue[];

/**
 * Which statuses an admin may move an order to. Forward only (an order never goes back from
 * Shipped to Processing), and it can be cancelled until it is delivered. A cancelled or
 * delivered order is final.
 */
export function allowedNextStatuses(from: string): OrderStatusValue[] {
  const i = FLOW.indexOf(from as OrderStatusValue);
  if (i === -1 || from === "COMPLETED") return []; // CANCELLED / unknown / delivered: final
  return [...FLOW.slice(i + 1), "CANCELLED"];
}

// Default note written to the timeline for each status.
export const STATUS_NOTE: Record<OrderStatusValue, string> = {
  PENDING: "Order placed successfully",
  CONFIRMED: "Order confirmed",
  PROCESSING: "Order is being prepared",
  SHIPPED: "Order has been shipped",
  COMPLETED: "Order delivered",
  CANCELLED: "Order cancelled",
};
