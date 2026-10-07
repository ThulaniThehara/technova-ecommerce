"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import LogoutButton from "./LogoutButton";

const tabs = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminHeader({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo href="/admin/dashboard" />
          <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 sm:inline">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 transition hover:bg-surface sm:inline-flex"
          >
            View store <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <span className="hidden text-sm text-slate-500 md:inline">{name}</span>
          <LogoutButton />
        </div>
      </div>

      {/* Scrolls sideways on narrow screens instead of wrapping. */}
      <nav aria-label="Admin" className="mx-auto w-full max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex gap-1">
          {tabs.map((t) => {
            const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    active ? "border-brand-600 text-brand-600" : "border-transparent text-ink-600 hover:text-brand-600"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
