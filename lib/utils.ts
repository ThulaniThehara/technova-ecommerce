// Order numbers are stored as autoincrement integers and displayed as TN-0001.
export function formatOrderNumber(orderNumber: number): string {
  return `TN-${String(orderNumber).padStart(4, "0")}`;
}

// Inverse of formatOrderNumber: PayHere echoes back the order_id we sent ("TN-0001"),
// and we need the integer to find the order again. Returns null for anything unexpected.
export function parseOrderNumber(orderCode: string): number | null {
  const match = /^TN-(\d{1,9})$/.exec(orderCode.trim());
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

// PayHere requires the amount with exactly two decimals ("1500.00").
// Accepts a Prisma Decimal, number or numeric string; avoids float rounding for Decimals.
export function toPayHereAmount(amount: { toFixed(dp: number): string } | number | string): string {
  if (typeof amount === "object") return amount.toFixed(2);
  return Number(amount).toFixed(2);
}

// Display price for the UI, e.g. "LKR 280,000" (cents are shown only when they exist).
export function formatPrice(amount: { toString(): string } | number | string): string {
  const value = Number(amount.toString());
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return `LKR ${value.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
