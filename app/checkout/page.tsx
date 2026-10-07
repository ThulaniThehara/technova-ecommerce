import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { isPayHereConfigured } from "@/lib/payhere";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  // Checked on the server: the merchant credentials must never be read in the browser.
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Checkout</h1>
      <CheckoutForm payHereEnabled={isPayHereConfigured()} />
    </div>
  );
}
