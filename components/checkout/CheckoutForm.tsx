"use client";

import { CheckCircle2, CreditCard, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/components/cart/useCart";
import { clearCart } from "@/lib/cart-store";
import type { SerializedOrder } from "@/lib/orders";
import { btnPrimary, card, input, inputError, label as labelClass } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";
import { type CheckoutFieldErrors, checkoutSchema } from "@/lib/validations";
import { buildOrderMessage, buildWhatsAppUrl, getBusinessWhatsAppNumber } from "@/lib/whatsapp";

type FormState = { customerName: string; customerEmail: string; phone: string; address: string; city: string; notes: string };
const initial: FormState = { customerName: "", customerEmail: "", phone: "", address: "", city: "", notes: "" };

// Submits a real <form> POST to PayHere as a top-level navigation. A plain redirect cannot be
// used because PayHere requires the signed fields to arrive as POST data, and window.open would
// be blocked by mobile popup blockers after an await.
function postToPayHere(checkoutUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  for (const [name, value] of Object.entries(fields)) {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = name;
    hidden.value = value;
    form.appendChild(hidden);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutForm({
  payHereEnabled,
  prefill,
}: {
  payHereEnabled: boolean;
  prefill: { name: string; email: string; phone: string };
}) {
  const router = useRouter();
  const { items, ready, subtotal } = useCart();
  const [form, setForm] = useState<FormState>({
    ...initial,
    customerName: prefill.name,
    customerEmail: prefill.email,
    phone: prefill.phone,
  });
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
    if (paymentMethod === "PAYHERE" && !payHereEnabled) {
      toast.error("Online payment is unavailable right now. Please order via WhatsApp.");
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
      if (res.status === 401) {
        // Session expired (or signed out in another tab). The cart is in the browser, so it is safe.
        toast.error("Your session has expired. Please sign in again to finish your order.");
        router.push("/login?redirect=/checkout");
        return;
      }
      if (!res.ok || !json.success) {
        if (json.errors) setErrors(json.errors);
        toast.error(json.message ?? "Could not place your order");
        return;
      }

      const order: SerializedOrder = json.data;

      if (order.paymentMethod === "PAYHERE") {
        // Ask the server for the signed payment fields - the hash is generated there, never here.
        const payRes = await fetch("/api/payments/payhere", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const payJson = await payRes.json();
        if (!payRes.ok || !payJson.success) {
          // The order exists and stock is held; send them to the order page rather than losing it.
          toast.error(payJson.message ?? "Could not start the payment.");
          clearCart();
          router.push(`/order-success?order=${order.id}`);
          return;
        }
        clearCart();
        postToPayHere(payJson.data.checkoutUrl, payJson.data.fields);
        return; // the browser is now navigating to PayHere
      }

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
      <div className={`${card} mx-auto mt-8 max-w-xl p-8 text-center`}>
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-ink-900">Order {placed.order.orderCode} received</h2>
        <p className="mt-2 text-slate-600">
          Opening WhatsApp so you can send your order to us. If nothing opened, tap the button below.
        </p>
        <a
          href={placed.whatsappUrl}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          <MessageCircle className="h-5 w-5" aria-hidden /> Send order on WhatsApp
        </a>
        <div className="mt-4">
          <Link href={`/order-success?order=${placed.order.id}`} className="text-sm font-semibold text-brand-600 hover:underline">
            View order status
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-xl bg-slate-200" aria-label="Loading checkout" />;

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line bg-white px-6 py-20 text-center">
        <h2 className="text-lg font-bold text-ink-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-600">Add some products before checking out.</p>
        <Link href="/products" className={`${btnPrimary} mt-6`}>
          Browse products
        </Link>
      </div>
    );
  }

  const field = (key: keyof FormState, text: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={key} className={labelClass}>{text}</label>
      <input
        id={key}
        name={key}
        value={form[key]}
        onChange={update(key)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        className={errors[key] ? inputError : input}
        {...props}
      />
      {errors[key] && <p id={`${key}-error`} className="mt-1.5 text-sm font-medium text-red-600">{errors[key]![0]}</p>}
    </div>
  );

  const methodCard = (selected: boolean, disabled: boolean) =>
    `flex items-start gap-3.5 rounded-xl border p-4 transition ${
      disabled
        ? "cursor-not-allowed border-line bg-surface opacity-60"
        : selected
          ? "cursor-pointer border-brand-600 bg-brand-50"
          : "cursor-pointer border-line bg-white hover:border-brand-200"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className={`${card} space-y-5 p-6`}>
          <h2 className="text-lg font-bold text-ink-900">Customer Information</h2>
          {field("customerName", "Full Name", { autoComplete: "name", maxLength: 100 })}
          {field("customerEmail", "Email Address", { type: "email", autoComplete: "email", inputMode: "email", maxLength: 254 })}
          {field("phone", "Phone Number", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "0771234567", maxLength: 12 })}
          {field("address", "Delivery Address", { autoComplete: "street-address", maxLength: 300 })}
          {field("city", "City", { autoComplete: "address-level2", maxLength: 80 })}
          <div>
            <label htmlFor="notes" className={labelClass}>
              Order Notes <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              maxLength={300}
              value={form.notes}
              onChange={update("notes")}
              placeholder="Delivery instructions, preferred call time..."
              className={input}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className={`${card} p-6`}>
          <h2 className="text-lg font-bold text-ink-900">Order Summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3">
                <span className="hatch h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.imageUrl} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{i.name}</span>
                  <span className="block text-xs text-slate-500">Qty {i.quantity}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-ink-900">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery</dt>
              <dd className="text-slate-500">Confirmed after order</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold text-ink-900">Total</dt>
              <dd className="font-bold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
          </dl>
        </section>

        <fieldset className={`${card} p-6`}>
          <legend className="px-1 text-lg font-bold text-ink-900">Payment Method</legend>

          <div className="mt-4 space-y-3">
            <label className={methodCard(paymentMethod === "PAYHERE", !payHereEnabled)}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <CreditCard className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-bold text-ink-900">PayHere Online Payment</span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  {payHereEnabled ? "Pay securely through PayHere Sandbox." : "Unavailable right now."}
                </span>
              </span>
              <input
                type="radio"
                name="paymentMethod"
                className="mt-1 h-4 w-4 accent-[#1668f0]"
                disabled={!payHereEnabled}
                checked={paymentMethod === "PAYHERE"}
                onChange={() => setPaymentMethod("PAYHERE")}
              />
            </label>

            <label className={methodCard(paymentMethod === "WHATSAPP", false)}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-bold text-ink-900">Order via WhatsApp</span>
                <span className="mt-0.5 block text-sm text-slate-600">Send your order directly to our WhatsApp.</span>
              </span>
              <input
                type="radio"
                name="paymentMethod"
                className="mt-1 h-4 w-4 accent-[#1668f0]"
                checked={paymentMethod === "WHATSAPP"}
                onChange={() => setPaymentMethod("WHATSAPP")}
              />
            </label>
          </div>

          <button type="submit" disabled={submitting} className={`${btnPrimary} mt-5 w-full py-3.5 text-base`}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitting ? "Placing order..." : paymentMethod === "PAYHERE" ? "Pay with PayHere" : "Place Order"}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            The final total is calculated by our server from current prices.
          </p>
          <Link href="/cart" className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:underline">
            Back to cart
          </Link>
        </fieldset>
      </aside>
    </form>
  );
}
