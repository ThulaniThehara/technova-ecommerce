import { PackageOpen, Search } from "lucide-react";
import Link from "next/link";
import StatusPill from "@/components/admin/StatusPill";
import { listCustomerOrders } from "@/lib/account";
import { parseStatusFilter } from "@/lib/admin-orders";
import { getCustomer } from "@/lib/auth";
import { ORDER_STATUSES, statusLabel } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { btnOutline, btnPrimary, card, input } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

const methodLabel = (m: string) => (m === "PAYHERE" ? "PayHere" : "WhatsApp");

export default async function MyOrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const customer = (await getCustomer())!;
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const status = parseStatusFilter(first(sp.status));
  const q = first(sp.q)?.trim().slice(0, 30) || undefined;
  const orders = await listCustomerOrders(customer.id, status, q);

  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/account/orders?${qs}` : "/account/orders";
  };
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600"
    }`;

  const filtered = Boolean(status || q);

  return (
    <>
      <h2 className="text-2xl font-bold text-ink-900">My Orders</h2>
      <p className="mt-1 text-sm text-slate-600">View your orders and track their current status.</p>

      <form action="/account/orders" role="search" className="relative mt-5 max-w-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by order number (e.g. TN-0007)"
          aria-label="Search orders by order number"
          className={`${input} pl-10`}
        />
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by status">
        <Link href={href()} className={chip(!status)}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={href(s)} className={chip(status === s)} aria-current={status === s ? "true" : undefined}>
            {statusLabel(s)}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className={`${card} mt-5 flex flex-col items-center px-6 py-16 text-center`}>
          <PackageOpen className="h-10 w-10 text-slate-300" aria-hidden />
          <h3 className="mt-4 text-lg font-bold text-ink-900">{filtered ? "No matching orders" : "No orders yet"}</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {filtered
              ? "Try a different status or order number."
              : "When you place an order, you’ll be able to track it here."}
          </p>
          <Link href={filtered ? "/account/orders" : "/products"} className={`${btnPrimary} mt-6`}>
            {filtered ? "Show all orders" : "Start Shopping"}
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className={`${card} mt-5 hidden overflow-x-auto md:block`}>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Order Number</th>
                  <th className="px-5 py-3 font-semibold">Order Date</th>
                  <th className="px-5 py-3 font-semibold">Items</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Order Status</th>
                  <th className="px-5 py-3 font-semibold">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => {
                  const count = o.items.reduce((n, i) => n + i.quantity, 0);
                  return (
                    <tr key={o.id} className="hover:bg-surface/60">
                      <td className="px-5 py-4 font-bold text-ink-900">{o.orderCode}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDateTime(o.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{count} {count === 1 ? "item" : "items"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-ink-900">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4">
                        <p className="mb-1 text-xs text-slate-500">{methodLabel(o.paymentMethod)}</p>
                        <StatusPill status={o.paymentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={o.orderStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link href={`/account/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                          View Order
                        </Link>
                        <span className="mx-2 text-slate-300" aria-hidden>|</span>
                        <Link href={`/account/orders/${o.id}#tracking`} className="font-semibold text-brand-600 hover:underline">
                          Track Order
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per order */}
          <ul className="mt-5 space-y-4 md:hidden">
            {orders.map((o) => {
              const count = o.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <li key={o.id} className={`${card} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900">Order #{o.orderCode}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(o.createdAt)}</p>
                    </div>
                    <StatusPill status={o.orderStatus} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Items</dt>
                      <dd className="font-medium text-ink-900">{count} {count === 1 ? "item" : "items"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Total</dt>
                      <dd className="font-bold text-ink-900">{formatPrice(o.total)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-slate-500">Payment ({methodLabel(o.paymentMethod)})</dt>
                      <dd className="mt-1"><StatusPill status={o.paymentStatus} /></dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link href={`/account/orders/${o.id}#tracking`} className={`${btnPrimary} py-2.5`}>
                      Track Order
                    </Link>
                    <Link href={`/account/orders/${o.id}`} className={`${btnOutline} py-2.5`}>
                      View Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
