"use client";

import { Loader2, LogOut, Menu, Package, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModal";
import { useCart } from "@/components/cart/useCart";
import { btnPrimary } from "@/lib/ui";
import AccountMenu, { useSignOut } from "./AccountMenu";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navbar({ customer }: { customer: { name: string } | null }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();
  const { signOut, pending } = useSignOut();
  const { openAuth } = useAuthModal();

  // The admin panel has its own shell, so the storefront chrome stays out of it.
  if (pathname.startsWith("/admin")) return null;

  const mobileItem = "flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-base font-medium text-ink-700 hover:bg-surface";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[15px] font-medium transition ${
                    active ? "text-brand-600" : "text-ink-600 hover:text-brand-600"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition hover:bg-surface"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {/* Desktop auth area */}
          <div className="hidden items-center gap-1.5 md:flex">
            {customer ? (
              <AccountMenu name={customer.name} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-700 transition hover:bg-surface"
                >
                  Sign In
                </button>
                <button type="button" onClick={() => openAuth("signup")} className={`${btnPrimary} px-4 py-2`}>
                  Create Account
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition hover:bg-surface md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          {[...links, { href: "/cart", label: `Cart${count > 0 ? ` (${count})` : ""}` }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={mobileItem}>
              {l.label}
            </Link>
          ))}

          <div className="my-2 border-t border-line" />

          {customer ? (
            <>
              <p className="px-3 pb-1 pt-2 text-xs text-slate-500">Signed in as {customer.name}</p>
              <Link href="/account" onClick={() => setOpen(false)} className={mobileItem}>
                <User className="h-4 w-4" aria-hidden /> My Account
              </Link>
              <Link href="/account/orders" onClick={() => setOpen(false)} className={mobileItem}>
                <Package className="h-4 w-4" aria-hidden /> My Orders
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
                disabled={pending}
                className={`${mobileItem} disabled:opacity-60`}
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
                Sign out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openAuth("login");
                }}
                className="rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold text-ink-700"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openAuth("signup");
                }}
                className={`${btnPrimary} py-3`}
              >
                Create Account
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
