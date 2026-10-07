"use client";

import { CheckCircle2, CreditCard, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/components/cart/useCart";
import { clearCart } from "@/lib/cart-store";
import type { SerializedOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { type CheckoutFieldErrors, checkoutSchema } from "@/lib/validations";
import { buildOrderMessage, buildWhatsAppUrl, getBusinessWhatsAppNumber } from "@/lib/whatsapp";

type FormState = { customerName: string; customerEmail: string; phone: string; address: string; city: string; notes: string };
const initial: FormState = { customerName: "", customerEmail: "", phone: "", address: "", city: "", notes: "" };

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-base outline-none transition focus:ring-2 ${
    hasError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
  }`;

export default function CheckoutForm() {
  const { items, ready, subtotal } = useCart();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<"WHATSAPP" | "PAYHERE">("WHATSAPP");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ order: SerializedOrder; whatsappUrl: string } | null>(null);

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Same schema the server uses. Prices/totals are not part of it - the server computes them.
    const parsed = checkoutSchema.safeParse({
      ...form,
      notes: form.notes || undefined,
      paymentMethod,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors as CheckoutFieldErrors;
      setErrors(fieldErrors);
      toast.error(fieldErrors.items?.[0] ?? "Please fix the highlighted fields");
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    const whatsappNumber = getBusinessWhatsAppNumber();
    if (paymentMethod === "WHATSAPP" && !whatsappNumber) {
      toast.error("WhatsApp ordering is not configured right now. Please try again later.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message ?? "Could not place your order");
        return;
      }

      const order: SerializedOrder = json.data;
      // Build the message from the SAVED order returned by the server, not from the cart.
      const whatsappUrl = buildWhatsAppUrl(whatsappNumber, buildOrderMessage(order));
      clearCart();
      setPlaced({ order, whatsappUrl });
      // location.href (not window.open): mobile browsers block popups opened after an await.
      window.location.href = whatsappUrl;
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-2xl font-bold">Order {placed.order.orderCode} received</h2>
        <p className="mt-2 text-slate-600">
          Opening WhatsApp so you can send your order to us. If nothing opened, tap the button below.
        </p>
        <a href={placed.whatsappUrl} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white hover:bg-emerald-700">
          <MessageCircle className="h-5 w-5" aria-hidden /> Send order on WhatsApp
        </a>
        <div className="mt-4">
          <Link href={`/order-success?order=${placed.order.id}`} className="text-sm font-medium text-indigo-600 hover:underline">
            View order status
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-slate-200" aria-label="Loading checkout" />;

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-600">Add some products before checking out.</p>
        <Link href="/products" className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
          Browse products
        </Link>
      </div>
    );
  }

  const field = (key: keyof FormState, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={key}
        name={key}
        value={form[key]}
        onChange={update(key)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className={inputClass(!!errors[key])}
        {...props}
      />
      {errors[key] && <p id={`${key}-error`} className="mt-1 text-sm text-red-600">{errors[key]![0]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Customer details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("customerName", "Full name", { autoComplete: "name", maxLength: 100 })}
            {field("customerEmail", "Email", { type: "email", autoComplete: "email", inputMode: "email", maxLength: 254 })}
            {field("phone", "Mobile number", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "0771234567", maxLength: 12 })}
            {field("city", "City", { autoComplete: "address-level2", maxLength: 80 })}
          </div>
          {field("address", "Delivery address", { autoComplete: "street-address", maxLength: 300 })}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-700">Order notes (optional)</label>
            <textarea id="notes" name="notes" rows={3} maxLength={300} value={form.notes} onChange={update("notes")} className={inputClass(false)} />
          </div>
        </section>

        <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          <legend className="px-1 text-lg font-semibold">Payment method</legend>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${paymentMethod === "WHATSAPP" ? "border-indigo-500 bg-indigo-50" : "border-slate-300"}`}>
            <input type="radio" name="paymentMethod" className="mt-1" checked={paymentMethod === "WHATSAPP"} onChange={() => setPaymentMethod("WHATSAPP")} />
            <span>
              <span className="flex items-center gap-2 font-semibold"><MessageCircle className="h-4 w-4" aria-hidden /> Order via WhatsApp</span>
              <span className="mt-0.5 block text-sm text-slate-600">We save your order, then open WhatsApp with your full order ready to send.</span>
            </span>
          </label>
          <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70">
            <input type="radio" name="paymentMethod" className="mt-1" disabled />
            <span>
              <span className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" aria-hidden /> Pay online with PayHere</span>
              <span className="mt-0.5 block text-sm text-slate-600">Coming soon.</span>
            </span>
          </label>
        </fieldset>
      </div>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 py-2.5">
              <span className="min-w-0">{i.name} <span className="text-slate-500">× {i.quantity}</span></span>
              <span className="shrink-0 font-medium">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatPrice(subtotal)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "Placing order..." : "Place order"}
        </button>
        <p className="mt-3 text-xs text-slate-500">The final total is calculated by our server from current prices.</p>
        <Link href="/cart" className="mt-3 block text-center text-sm font-medium text-indigo-600 hover:underline">Back to cart</Link>
      </aside>
    </form>
  );
}
