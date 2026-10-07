import Link from "next/link";
import type { SerializedOrder } from "@/lib/orders";
import { card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import StatusPill from "./StatusPill";

// overflow-x-auto: on a phone the table scrolls sideways instead of squashing its columns.
export default function OrdersTable({ orders, empty = "No orders yet." }: { orders: SerializedOrder[]; empty?: string }) {
  if (orders.length === 0) {
    return <div className={`${card} px-6 py-14 text-center text-sm text-slate-500`}>{empty}</div>;
  }

  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Order</th>
            <th className="px-5 py-3 font-semibold">Customer</th>
            <th className="px-5 py-3 font-semibold">Date</th>
            <th className="px-5 py-3 text-right font-semibold">Total</th>
            <th className="px-5 py-3 font-semibold">Payment</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id} className="transition hover:bg-surface/60">
              <td className="px-5 py-4 font-bold text-ink-900">{o.orderCode}</td>
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">{o.customerName}</p>
                <p className="text-xs text-slate-500">{o.phone}</p>
              </td>
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
                <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
