"use client";

import { useEffect } from "react";
import { type CartItem, getCart, getCartOwner, getCartVersion, replaceCart, setCartOwner, subscribe } from "@/lib/cart-store";

const PUSH_DELAY_MS = 600;

const toLines = (items: CartItem[]) => items.map((i) => ({ productId: i.productId, quantity: i.quantity }));

/**
 * Keeps the browser cart and the signed-in customer's saved cart together. Rendered only while
 * signed in (see the root layout). It renders nothing.
 *
 * Two different situations, told apart by who the browser cart is a mirror of:
 *
 *  - A cart that does NOT yet belong to this account (a guest cart, or a brand-new device):
 *    MERGE it into the saved cart once. Same product: quantities add up, capped at stock.
 *    An empty new-device cart simply receives the saved cart, which is how a cart follows you
 *    to your phone. Then the browser is marked as a mirror of this account.
 *  - A cart that already mirrors this account: just PULL the saved version. (Merging again would
 *    add the cart to itself and double every quantity on each page load.)
 *
 * After that, every change made in this browser is saved to the server a moment later.
 * Prices and stock are never trusted from here: the server re-reads them, and the order API
 * recomputes everything at checkout.
 */
export default function CartSync({ userId }: { userId: string }) {
  useEffect(() => {
    let cancelled = false;
    let pushTimer: number | undefined;
    let applyingRemote = false; // true while we write the server's cart into the browser
    let unsubscribe: (() => void) | undefined;
    let remoteWrites = 0; // how many of the cart changes were us applying the server's cart
    const startVersion = getCartVersion();

    async function sync(attempt = 0) {
      const mirror = getCartOwner() === userId;
      const sentVersion = getCartVersion();
      const sent = toLines(getCart());
      try {
        const res = mirror
          ? await fetch("/api/cart", { cache: "no-store" })
          : await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items: sent }),
            });
        if (!res.ok) return; // 401 = signed out meanwhile; anything else: keep the browser cart as it is
        const json = await res.json();
        if (cancelled || !json.success) return;

        // The customer edited the cart while we were waiting. Never overwrite a newer edit:
        // when pulling, keep the local one (the push below will save it); when merging, merge
        // again from the fresh state so nothing they just added is lost.
        if (getCartVersion() !== sentVersion) {
          if (mirror) return;
          if (attempt < 2) return sync(attempt + 1);
        }

        // Always apply it: even with the same quantities, prices and stock come back fresh.
        applyingRemote = true;
        replaceCart(json.data as CartItem[]);
        applyingRemote = false;
        remoteWrites += 1;
        setCartOwner(userId);
      } catch {
        // offline or transient error: the browser cart still works; sync resumes on the next change
      }
    }

    function push() {
      window.clearTimeout(pushTimer);
      pushTimer = window.setTimeout(async () => {
        // Only save a cart that mirrors THIS account; never overwrite the saved cart with a stranger's.
        if (getCartOwner() !== userId) return;
        try {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: toLines(getCart()) }),
            keepalive: true, // let the save finish even if the page is being closed
          });
        } catch {
          // will be retried by the next change
        }
      }, PUSH_DELAY_MS);
    }

    sync().then(() => {
      if (cancelled) return;
      // Start saving changes only AFTER the first sync, so an empty new-device cart can't wipe the saved one.
      unsubscribe = subscribe(() => {
        if (!applyingRemote) push();
      });
      // The customer may have changed the cart while that first sync was still in flight (easy on a
      // slow connection). Those edits happened before we were listening, so save them now.
      if (getCartVersion() - remoteWrites !== startVersion) push();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(pushTimer);
      unsubscribe?.();
    };
  }, [userId]);

  return null;
}
