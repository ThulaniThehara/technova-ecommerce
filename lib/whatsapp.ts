import { formatOrderNumber, formatPrice } from "./utils";

export type WhatsAppOrder = {
  orderNumber: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string | null;
  total: string;
  items: { productName: string; unitPrice: string; quantity: number }[];
};

// The message is built from the SAVED order (what the server stored), never from the cart.
export function buildOrderMessage(order: WhatsAppOrder): string {
  const lines = order.items.map(
    (i, n) => `${n + 1}. ${i.productName} × ${i.quantity} — ${formatPrice(Number(i.unitPrice) * i.quantity)}`,
  );
  return [
    "Hello TechNova,",
    "",
    "I would like to place an order.",
    "",
    `Order: ${formatOrderNumber(order.orderNumber)}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Delivery Address: ${order.address}, ${order.city}`,
    ...(order.notes ? [`Notes: ${order.notes}`] : []),
    "",
    "Items:",
    ...lines,
    "",
    `Total: ${formatPrice(order.total)}`,
    "",
    "Thank you!",
  ].join("\n");
}

// wa.me wants digits only: no "+", no leading "0" (07XXXXXXXX -> 947XXXXXXXX).
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `94${digits.slice(1)}` : digits;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;
}

export function getBusinessWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
}
