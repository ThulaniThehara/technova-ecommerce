import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Shopping Cart</h1>
      <CartView />
    </div>
  );
}
