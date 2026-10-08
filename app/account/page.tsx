import { CheckCircle2, Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import StatusPill from "@/components/admin/StatusPill";
import { getCustomerSummary, listCustomerOrders } from "@/lib/account";
import { getCustomer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { btnOutline, card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const customer = (await getCustomer())!; // the layout already redirected anyone who is not signed in
  const [summary, recent] = await Promise.all([
    getCustomerSummary(customer.id),
    listCustomerOrders(customer.id, undefined, undefined, 3),
  ]);

  const cards = [
    { label: "Total Orders", value: summary.total, icon: ShoppingBag, href: "/account/orders" },
    { label: "Pending Orders", value: summary.pending, icon: Clock, href: "/account/orders" },
    { label: "Delivered Orders", value: summary.completed, icon: CheckCircle2, href: "/account/orders?status=COMPLETED" },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-ink-900">Welcome back, {customer.name.split(" ")[0]}</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className={`${card} p-5 transition hover:border-brand-200`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-ink-900">{value}</p>
          </Link>
        ))}
      </div>

      <section className={`${card} mt-8 p-5 sm:p-6`} aria-labelledby="recent-title">
        <div className="flex items-center justify-between gap-3">
          <h3 id="recent-title" className="text-lg font-bold text-ink-900">Recent Orders</h3>
          <Link href="/account/orders" className={`${btnOutline} px-4 py-2`}>
            View All Orders
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No orders yet. <Link href="/products" className="font-semibold text-brand-600 hover:underline">Start shopping</Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 hover:text-brand-600">
                  <span>
                    <span className="block font-bold text-ink-900">{o.orderCode}</span>
                    <span className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-ink-900">{formatPrice(o.total)}</span>
                    <StatusPill status={o.orderStatus} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
