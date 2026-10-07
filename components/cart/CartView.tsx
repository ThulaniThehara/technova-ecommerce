"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { clearCart, removeFromCart, setCartQuantity } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./useCart";

export default function CartView() {
  const { items, ready, subtotal } = useCart();

  if (!ready) {
    return <div className="mt-8 h-48 animate-pulse rounded-2xl bg-slate-200" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-slate-400" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-600">Browse our products and add something you like.</p>
        <Link href="/products" className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <Link href={`/products/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 font-semibold hover:text-indigo-600">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500">{formatPrice(item.price)} each</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center rounded-xl border border-slate-300">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => setCartQuantity(item.productId, item.quantity - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-semibold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    onClick={() => setCartQuantity(item.productId, item.quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
              {item.quantity >= item.stock && <p className="text-xs text-amber-600">Maximum available quantity ({item.stock})</p>}
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-medium">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Delivery</dt>
            <dd className="text-slate-500">Confirmed after order</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-bold">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="mt-6 block rounded-xl bg-indigo-600 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-indigo-700">
          Proceed to checkout
        </Link>
        <button type="button" onClick={clearCart} className="mt-3 w-full rounded-xl px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
          Clear cart
        </button>
        <p className="mt-4 text-xs text-slate-500">Final prices and availability are confirmed when you place your order.</p>
      </aside>
    </div>
  );
}
