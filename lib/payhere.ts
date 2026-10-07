import { createHash, timingSafeEqual } from "crypto";

// Everything in this file is SERVER ONLY. The merchant secret must never reach the browser,
// which is why it has no NEXT_PUBLIC_ prefix and why the hash is generated here, not on the client.

export const PAYHERE_CURRENCY = "LKR";

// Sandbox by default: the assessment requires the sandbox environment.
export const PAYHERE_CHECKOUT_URL =
  process.env.PAYHERE_CHECKOUT_URL ?? "https://sandbox.payhere.lk/pay/checkout";

const md5Upper = (value: string) => createHash("md5").update(value, "utf8").digest("hex").toUpperCase();

type PayHereConfig = { merchantId: string; merchantSecret: string; appUrl: string };

export function getPayHereConfig(): PayHereConfig {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  // Trailing slashes would produce "//api/..." in the callback URLs PayHere stores.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");

  if (!merchantId || !merchantSecret || !appUrl) {
    throw new Error(
      "PayHere is not configured: PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET and NEXT_PUBLIC_APP_URL are all required",
    );
  }
  return { merchantId, merchantSecret, appUrl };
}

export function isPayHereConfigured(): boolean {
  try {
    getPayHereConfig();
    return true;
  } catch {
    return false;
  }
}

// PayHere hashes the secret once, then folds that digest into the payload hash,
// so the raw secret itself is never part of the string being hashed.
const secretHash = (merchantSecret: string) => md5Upper(merchantSecret);

/**
 * Hash sent WITH the checkout form:
 *   md5(merchant_id + order_id + amount + currency + md5(merchant_secret).toUpperCase()).toUpperCase()
 * `amount` must be the exact same string posted in the form (two decimals, no separators).
 */
export function buildCheckoutHash(params: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency?: string;
}): string {
  const currency = params.currency ?? PAYHERE_CURRENCY;
  return md5Upper(
    params.merchantId + params.orderId + params.amount + currency + secretHash(params.merchantSecret),
  );
}

/**
 * Hash PayHere sends BACK in the server notification, as `md5sig`:
 *   md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code
 *       + md5(merchant_secret).toUpperCase()).toUpperCase()
 * The amount/currency must be the raw strings from the callback, not re-formatted ones,
 * or the digest will not match.
 */
export function buildNotificationHash(params: {
  merchantSecret: string;
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
}): string {
  return md5Upper(
    params.merchantId +
      params.orderId +
      params.payhereAmount +
      params.payhereCurrency +
      params.statusCode +
      secretHash(params.merchantSecret),
  );
}

// Constant-time comparison so a response cannot be tuned byte-by-byte against our signature.
export function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected.toUpperCase(), "utf8");
  const b = Buffer.from(received.trim().toUpperCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// PayHere status codes (documented values).
export const PAYHERE_STATUS = {
  SUCCESS: "2",
  PENDING: "0",
  CANCELED: "-1",
  FAILED: "-2",
  CHARGEDBACK: "3",
} as const;

// PayHere requires separate first/last name fields; our order stores one customer name.
export function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1)! };
}
