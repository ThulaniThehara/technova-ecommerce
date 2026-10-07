"use client";

import { useSyncExternalStore } from "react";
import { EMPTY_CART, getCart, subscribe } from "@/lib/cart-store";

export function useCart() {
  const items = useSyncExternalStore(subscribe, getCart, () => EMPTY_CART);
  return {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}
