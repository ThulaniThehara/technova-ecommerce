"use client";

import { Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/useCart";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  // The admin panel has its own shell, so the storefront chrome stays out of it.
  if (pathname.startsWith("/admin")) return null;

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

        <div className="flex items-center gap-1">
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
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-ink-700 hover:bg-surface"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
