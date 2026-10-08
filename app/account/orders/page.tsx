import { PackageOpen } from "lucide-react";
import Link from "next/link";
import StatusPill from "@/components/admin/StatusPill";
import { listCustomerOrders } from "@/lib/account";
import { parseStatusFilter } from "@/lib/admin-orders";
import { getCustomer } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { btnPrimary, card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export default async function MyOrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const customer = (await getCustomer())!;
  const raw = (await searchParams).status;
  const status = parseStatusFilter(Array.isArray(raw) ? raw[0] : raw);
  const orders = await listCustomerOrders(customer.id, status);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600"
    }`;

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Filter by status">
        <Link href="/account/orders" className={chip(!status)}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/account/orders?status=${s}`} className={chip(status === s)}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className={`${card} mt-5 flex flex-col items-center px-6 py-16 text-center`}>
          <PackageOpen className="h-10 w-10 text-slate-300" aria-hidden />
          <h2 className="mt-4 text-lg font-bold text-ink-900">
            {status ? "No orders with this status" : "You haven’t placed any orders yet."}
          </h2>
          <Link href={status ? "/account/orders" : "/products"} className={`${btnPrimary} mt-6`}>
            {status ? "Show all orders" : "Start Shopping"}
          </Link>
        </div>
      ) : (
        <div className={`${card} mt-5 overflow-x-auto`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface/60">
                  <td className="px-5 py-4 font-bold text-ink-900">{o.orderCode}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDateTime(o.createdAt)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-ink-900">{formatPrice(o.total)}</td>
                  <td className="px-5 py-4">
                    <p className="mb-1 text-xs text-slate-500">{o.paymentMethod === "PAYHERE" ? "PayHere" : "WhatsApp"}</p>
                    <StatusPill status={o.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={o.orderStatus} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/account/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
