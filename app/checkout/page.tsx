import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getCustomer } from "@/lib/auth";
import { isPayHereConfigured } from "@/lib/payhere";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Second gate (proxy.ts is the first): checkout needs a signed-in CUSTOMER. The cart stays in the
  // browser, so nothing is lost while they sign in and come straight back here.
  const customer = await getCustomer();
  if (!customer) redirect("/login?redirect=/checkout");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Checkout</h1>
      {/* Prefilled from the account; the customer may change them for this order only (the profile is not touched). */}
      <CheckoutForm
        payHereEnabled={isPayHereConfigured()}
        prefill={{ name: customer.name, email: customer.email, phone: customer.phone ?? "" }}
      />
    </div>
  );
}
