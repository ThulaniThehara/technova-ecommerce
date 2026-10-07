import { z } from "zod";

// Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX
export const PHONE_REGEX = /^(?:\+94|0)7\d{8}$/;

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Missing product"),
  quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(100, "Quantity is too large"),
});

// One schema, two places: the checkout form validates with it for instant feedback and
// POST /api/orders validates again on the server (the client is never trusted).
// Note there is deliberately NO price or total field - the server computes those.
export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
  customerEmail: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254)),
  phone: z.string().trim().regex(PHONE_REGEX, "Enter a valid Sri Lankan mobile number, e.g. 0771234567"),
  address: z.string().trim().min(10, "Enter your full delivery address").max(300, "Address is too long"),
  city: z.string().trim().min(2, "Enter your city").max(80, "City is too long"),
  notes: z.string().trim().max(300, "Notes are too long").optional(),
  paymentMethod: z.enum(["PAYHERE", "WHATSAPP"], { error: "Choose a payment method" }),
  items: z.array(orderItemSchema).min(1, "Your cart is empty").max(30, "Too many different items in one order"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckoutFieldErrors = Partial<Record<keyof CheckoutInput, string[]>>;
