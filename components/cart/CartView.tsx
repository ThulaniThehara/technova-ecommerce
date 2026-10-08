"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuthModal } from "@/components/auth/AuthModal";
import { clearCart, removeFromCart, setCartQuantity } from "@/lib/cart-store";
import { btnPrimary, card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./useCart";

export default function CartView() {
  const { openAuth, signedIn } = useAuthModal();
  const { items, ready, subtotal } = useCart();

  if (!ready) {
    return <div className="mt-8 h-48 animate-pulse rounded-xl bg-slate-200" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-20 text-center">
        <ShoppingBag className="h-10 w-10 text-slate-300" aria-hidden />
        <h2 className="mt-4 text-lg font-bold text-ink-900">Your cart is empty</h2>
        <p className="mt-1 text-sm text-slate-600">Browse our products and add something you like.</p>
        <Link href="/products" className={`${btnPrimary} mt-6`}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <ul className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <li key={item.productId} className={`${card} flex gap-4 p-4`}>
            <Link href={`/products/${item.slug}`} className="hatch h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/products/${item.slug}`} className="line-clamp-2 font-bold text-ink-900 hover:text-brand-600">
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
                <div className="inline-flex items-center rounded-xl border border-line">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => setCartQuantity(item.productId, item.quantity - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl text-ink-700 transition hover:bg-surface disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center font-bold tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    onClick={() => setCartQuantity(item.productId, item.quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl text-ink-700 transition hover:bg-surface disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="font-bold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
              {item.quantity >= item.stock && (
                <p className="text-xs font-medium text-amber-600">Maximum available quantity ({item.stock})</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <aside className={`${card} h-fit p-6 lg:sticky lg:top-24`}>
        <h2 className="text-lg font-bold text-ink-900">Order Summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
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
        <Link
          href="/checkout"
          onClick={(e) => {
            // Guests get the sign-in pop-up right here; signed-in customers go straight to checkout.
            if (!signedIn) {
              e.preventDefault();
              openAuth("login", "/checkout");
            }
          }}
          className={`${btnPrimary} mt-6 w-full py-3.5 text-base`}
        >
          Proceed to Checkout
        </Link>
        <button
          type="button"
          onClick={clearCart}
          className="mt-3 w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-surface"
        >
          Clear cart
        </button>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Final prices and availability are confirmed when you place your order.
        </p>
      </aside>
    </div>
  );
}
