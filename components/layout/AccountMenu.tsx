"use client";

import { ChevronDown, Loader2, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { clearCart, setCartOwner } from "@/lib/cart-store";

/** Signs the customer out. The cart is deliberately left alone. */
export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      // The saved cart stays on the server for the next sign-in. Clearing the browser copy means
      // the next person on a shared device does not inherit this customer's items.
      clearCart();
      setCartOwner(null);
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return { signOut, pending };
}

/** Desktop avatar button with a dropdown: My Account, My Orders, Sign out. */
export default function AccountMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { signOut, pending } = useSignOut();

  // Close on outside click and on Escape (keyboard users).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const first = name.trim().split(/\s+/)[0] || "Account";
  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-surface";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 transition hover:bg-surface"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white" aria-hidden>
          {first.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[110px] truncate text-sm font-semibold text-ink-900 lg:inline">{first}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lg">
          <p className="truncate px-3 py-2 text-xs text-slate-500">Signed in as {name}</p>
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)} className={item}>
            <User className="h-4 w-4" aria-hidden /> My Account
          </Link>
          <Link href="/account/orders" role="menuitem" onClick={() => setOpen(false)} className={item}>
            <Package className="h-4 w-4" aria-hidden /> My Orders
          </Link>
          <button type="button" role="menuitem" onClick={signOut} disabled={pending} className={`${item} disabled:opacity-60`}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
