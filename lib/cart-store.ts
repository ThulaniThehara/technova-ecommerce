// Guest cart persisted in localStorage. Exposed as an external store so React can
// subscribe with useSyncExternalStore (no hydration mismatch, no provider needed).
// Prices/stock here are for display only - the server re-validates both at checkout.

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

const KEY = "technova-cart";
export const EMPTY_CART: CartItem[] = [];

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY_CART;

function isCartItem(v: unknown): v is CartItem {
  const i = v as CartItem;
  return (
    !!i &&
    typeof i.productId === "string" &&
    typeof i.slug === "string" &&
    typeof i.name === "string" &&
    typeof i.imageUrl === "string" &&
    Number.isFinite(i.price) &&
    Number.isInteger(i.quantity) && i.quantity > 0 &&
    Number.isInteger(i.stock) && i.stock >= 0
  );
}

// Must return a referentially stable value while nothing changed.
export function getCart(): CartItem[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedItems; // storage blocked: keep the in-memory cart
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) && parsed.every(isCartItem) && parsed.length ? parsed : EMPTY_CART;
  } catch {
    cachedItems = EMPTY_CART;
  }
  return cachedItems;
}

function save(items: CartItem[]) {
  const raw = items.length ? JSON.stringify(items) : null;
  try {
    if (raw) window.localStorage.setItem(KEY, raw);
    else window.localStorage.removeItem(KEY);
  } catch {}
  cachedRaw = raw;
  cachedItems = items.length ? items : EMPTY_CART;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener(); // other tabs
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// Returns the quantity actually in the cart for that product after the add.
export function addToCart(item: Omit<CartItem, "quantity">, quantity: number): number {
  const items = getCart();
  const existing = items.find((i) => i.productId === item.productId);
  const next = Math.min((existing?.quantity ?? 0) + quantity, item.stock);
  if (next < 1) return 0;
  const updated = existing
    ? items.map((i) => (i.productId === item.productId ? { ...i, ...item, quantity: next } : i))
    : [...items, { ...item, quantity: next }];
  save(updated);
  return next;
}

export function setCartQuantity(productId: string, quantity: number) {
  save(
    getCart().map((i) =>
      i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i,
    ),
  );
}

export function removeFromCart(productId: string) {
  save(getCart().filter((i) => i.productId !== productId));
}

export function clearCart() {
  save([]);
}
