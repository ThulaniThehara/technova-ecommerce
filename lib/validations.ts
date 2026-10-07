import { z } from "zod";
import { ORDER_STATUSES } from "./constants";

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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  // bcrypt only uses the first 72 bytes; a generous cap also stops absurdly large bodies.
  password: z.string().min(1, "Enter your password").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ───────────── Admin: products ─────────────

// Only http(s) URLs are accepted: the value ends up in an <img src>, and a "javascript:" or
// "data:" URL there would be an injection vector.
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// The database column is Decimal(10,2): at most 99,999,999.99 with two decimal places.
const price = z
  .number({ error: "Enter a valid price" })
  .positive("Price must be greater than 0")
  .max(99999999.99, "Price is too large")
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Use at most 2 decimal places");

// Shared by the Add/Edit form (client) and the admin API (server).
export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name").max(120, "Name is too long"),
  description: z.string().trim().min(10, "Description should be at least 10 characters").max(2000, "Description is too long"),
  price,
  stock: z
    .number({ error: "Enter the stock quantity" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(100000, "Stock is too large"),
  // Empty is allowed: the server fills in a placeholder image.
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL is too long")
    .refine((v) => v === "" || isHttpUrl(v), "Enter a valid http(s) image URL"),
  categoryId: z.string().min(1, "Choose a category"),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFieldErrors = Partial<Record<keyof ProductInput, string[]>>;

// PATCH accepts any subset (inline stock edit, active toggle, full edit) but never unknown keys.
export const productPatchSchema = productSchema
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

// ───────────── Admin: orders ─────────────

export const orderPatchSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES).optional(),
    // Only meaningful for WhatsApp orders, which are paid outside the site.
    paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
  })
  .strict()
  .refine((v) => v.orderStatus !== undefined || v.paymentStatus !== undefined, "Nothing to update");
