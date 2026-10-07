"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_CART, getCart, subscribe } from "@/lib/cart-store";

const noopSubscribe = () => () => {};

export function useCart() {
  const items = useSyncExternalStore(subscribe, getCart, () => EMPTY_CART);
  // false on the server and during hydration, true afterwards: lets pages show a skeleton
  // instead of flashing "your cart is empty" before localStorage has been read.
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return {
    items,
    ready,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}
