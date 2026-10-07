import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderControls from "@/components/admin/OrderControls";
import StatusPill from "@/components/admin/StatusPill";
import { getAdminOrder } from "@/lib/admin-orders";
import { formatDateTime } from "@/lib/format";
import { card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order details | Admin", robots: { index: false, follow: false } };

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-ink-900">{order.orderCode}</h1>
        <StatusPill status={order.orderStatus} />
        <StatusPill status={order.paymentStatus} />
      </div>
      <p className="mt-1.5 text-sm text-slate-500">
        Placed {formatDateTime(order.createdAt)} &middot; {order.paymentMethod === "PAYHERE" ? "PayHere" : "WhatsApp"}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={`${card} overflow-x-auto`}>
            <h2 className="px-6 pt-6 text-lg font-bold text-ink-900">Items</h2>
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead className="border-y border-line bg-surface text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-3 py-3 text-right font-semibold">Unit price</th>
                  <th className="px-3 py-3 text-right font-semibold">Qty</th>
                  <th className="px-6 py-3 text-right font-semibold">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((i, n) => (
                  <tr key={n}>
                    <td className="px-6 py-4 font-medium text-ink-900">{i.productName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-slate-600">{formatPrice(i.unitPrice)}</td>
                    <td className="px-3 py-4 text-right text-slate-600">{i.quantity}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-semibold text-ink-900">{formatPrice(i.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line">
                  <td colSpan={3} className="px-6 py-4 text-right text-base font-bold text-ink-900">Total</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-base font-bold text-ink-900">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className={`${card} p-6`}>
            <h2 className="text-lg font-bold text-ink-900">Customer & delivery</h2>
            <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Customer</dt>
                <dd className="mt-1 font-medium text-ink-900">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="mt-1 font-medium text-ink-900">{order.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-all font-medium text-ink-900">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Delivery address</dt>
                <dd className="mt-1 font-medium text-ink-900">
                  {order.address}, {order.city}
                </dd>
              </div>
              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-slate-500">Order notes</dt>
                  <dd className="mt-1 font-medium text-ink-900">{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <OrderControls
          orderId={order.id}
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
          paymentMethod={order.paymentMethod}
        />
      </div>
    </>
  );
}
