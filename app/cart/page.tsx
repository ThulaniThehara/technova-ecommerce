import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Shopping cart</h1>
      <CartView />
    </div>
  );
}
