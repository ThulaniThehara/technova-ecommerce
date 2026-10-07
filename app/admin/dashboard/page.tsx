import { Clock, Package, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import Logo from "@/components/layout/Logo";
import { getAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { card } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  // Second gate: verify again on the server even though proxy.ts already redirects.
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const [orders, products, pending] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
  ]);

  const stats = [
    { label: "Total orders", value: orders, icon: ShoppingBag },
    { label: "Pending orders", value: pending, icon: Clock },
    { label: "Products", value: products, icon: Package },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo href="/admin/dashboard" />
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 sm:inline">
              Admin
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1.5 text-[15px] text-slate-600">
          Signed in as {admin.name} ({admin.email})
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className={`${card} p-6`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
