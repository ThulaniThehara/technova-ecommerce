"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/useCart";
import { addToCart } from "@/lib/cart-store";
import { btnPrimary } from "@/lib/ui";

type Props = {
  product: { id: string; slug: string; name: string; price: number; imageUrl: string; stock: number };
};

export default function AddToCart({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { items } = useCart();
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const remaining = Math.max(product.stock - inCart, 0);

  if (product.stock === 0) {
    return (
      <button disabled className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-6 py-3.5 font-semibold text-slate-400">
        Out of stock
      </button>
    );
  }

  const qty = Math.min(quantity, Math.max(remaining, 1));

  function handleAdd() {
    const now = addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      qty,
    );
    if (now === 0) return toast.error("No more stock available");
    toast.success(`${product.name} added to cart (${now} in cart)`);
    setQuantity(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-ink-900">Quantity</span>
        <div className="inline-flex items-center rounded-xl border border-line bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-ink-700 transition hover:bg-surface disabled:opacity-40"
            disabled={qty <= 1}
            onClick={() => setQuantity(qty - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-ink-700 transition hover:bg-surface disabled:opacity-40"
            disabled={qty >= remaining}
            onClick={() => setQuantity(qty + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-slate-500">Max {product.stock}</span>
      </div>

      <button type="button" onClick={handleAdd} disabled={remaining === 0} className={`${btnPrimary} w-full py-3.5 text-base`}>
        <ShoppingCart className="h-5 w-5" aria-hidden />
        {remaining === 0 ? "All available stock is in your cart" : "Add to Cart"}
      </button>

      {inCart > 0 && (
        <p className="text-sm text-slate-600">
          {inCart} in your cart.{" "}
          <Link href="/cart" className="font-semibold text-brand-600 hover:underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
