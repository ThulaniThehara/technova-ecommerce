import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { getAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    { label: "Total orders", value: orders },
    { label: "Pending orders", value: pending },
    { label: "Products", value: products },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-slate-600">Signed in as {admin.name} ({admin.email})</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
