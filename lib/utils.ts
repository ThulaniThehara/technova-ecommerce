// Order numbers are stored as autoincrement integers and displayed as TN-0001.
export function formatOrderNumber(orderNumber: number): string {
  return `TN-${String(orderNumber).padStart(4, "0")}`;
}

// PayHere requires the amount with exactly two decimals ("1500.00").
// Accepts a Prisma Decimal, number or numeric string; avoids float rounding for Decimals.
export function toPayHereAmount(amount: { toFixed(dp: number): string } | number | string): string {
  if (typeof amount === "object") return amount.toFixed(2);
  return Number(amount).toFixed(2);
}

// Display price for the UI, e.g. "Rs. 280,000.00".
export function formatPrice(amount: { toString(): string } | number | string): string {
  return `Rs. ${Number(amount.toString()).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
