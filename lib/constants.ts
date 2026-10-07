// A product at or below this many units counts as "low stock" everywhere:
// the storefront badge, the admin dashboard count and the admin product table.
export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
