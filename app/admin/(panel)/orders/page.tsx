import type { Metadata } from "next";
import Link from "next/link";
import OrdersTable from "@/components/admin/OrdersTable";
import { listAdminOrders, parseStatusFilter } from "@/lib/admin-orders";
import { ORDER_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders | Admin", robots: { index: false, follow: false } };

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.status) ? sp.status[0] : sp.status;
  const status = parseStatusFilter(raw);

  const [orders, grouped] = await Promise.all([
    listAdminOrders(status),
    prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.orderStatus, g._count._all]));
  const total = grouped.reduce((n, g) => n + g._count._all, 0);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600"
    }`;

  return (
    <>
      <h1 className="text-3xl font-bold text-ink-900">Orders</h1>

      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by status">
        <Link href="/admin/orders" className={chip(!status)}>
          All ({total})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={chip(status === s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()} ({counts.get(s) ?? 0})
          </Link>
        ))}
      </div>

      <div className="mt-4">
        <OrdersTable orders={orders} empty={status ? "No orders with this status." : "No orders yet."} />
      </div>
    </>
  );
}
