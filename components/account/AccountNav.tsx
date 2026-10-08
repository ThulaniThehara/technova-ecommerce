"use client";

import { LayoutDashboard, Loader2, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSignOut } from "@/components/layout/AccountMenu";

const tabs = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "My Orders", icon: Package, exact: false },
  { href: "/account/profile", label: "Profile", icon: User, exact: false },
];

/** Side menu on large screens, a scrollable row of tabs on phones. */
export default function AccountNav() {
  const pathname = usePathname();
  const { signOut, pending } = useSignOut();
  const base =
    "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition";

  return (
    <nav aria-label="Account" className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${base} ${active ? "bg-brand-600 text-white" : "bg-white text-ink-700 ring-1 ring-line hover:text-brand-600 lg:bg-transparent lg:ring-0 lg:hover:bg-surface"}`}
              >
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={signOut}
            disabled={pending}
            className={`${base} w-full bg-white text-ink-700 ring-1 ring-line hover:text-red-600 disabled:opacity-60 lg:bg-transparent lg:ring-0 lg:hover:bg-surface`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
