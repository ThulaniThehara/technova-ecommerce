import { AlertTriangle, Clock, ShoppingBag, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import OrdersTable from "@/components/admin/OrdersTable";
import { getDashboardStats } from "@/lib/admin-stats";
import { card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total orders", value: String(stats.totalOrders), icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue (paid orders)", value: formatPrice(stats.revenue), icon: Wallet, href: "/admin/orders" },
    { label: "Pending orders", value: String(stats.pendingOrders), icon: Clock, href: "/admin/orders?status=PENDING" },
    { label: "Low / out of stock", value: String(stats.lowStock), icon: AlertTriangle, href: "/admin/products", warn: stats.lowStock > 0 },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-ink-900">Dashboard</h1>
      <p className="mt-1.5 text-[15px] text-slate-600">A quick look at how the store is doing.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, warn }) => (
          <Link key={label} href={href} className={`${card} p-6 transition hover:border-brand-200`}>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                warn ? "bg-amber-50 text-amber-600" : "bg-brand-50 text-brand-600"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-xl font-bold text-ink-900">Recent orders</h2>
        <Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4">
        <OrdersTable orders={stats.recentOrders} />
      </div>
    </>
  );
}
