import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderTracker from "@/components/account/OrderTracker";
import StatusPill from "@/components/admin/StatusPill";
import { getCustomerOrder } from "@/lib/account";
import { getCustomer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { btnOutline, card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export default async function MyOrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const customer = (await getCustomer())!;
  // Scoped to this customer: someone else's order id is indistinguishable from a missing one.
  const order = await getCustomerOrder(customer.id, (await params).id);
  if (!order) notFound();

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const dt = "text-slate-500";
  const dd = "mt-0.5 font-medium text-ink-900";

  return (
    <>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to My Orders
      </Link>

      <header className={`${card} mt-4 p-5 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">Order #{order.orderCode}</h2>
            <p className="mt-1 text-sm text-slate-500">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <Link href="/products" className={`${btnOutline} hidden sm:inline-flex`}>
            Continue Shopping
          </Link>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
          <div>
            <dt className={dt}>Order status</dt>
            <dd className="mt-1.5"><StatusPill status={order.orderStatus} /></dd>
          </div>
          <div>
            <dt className={dt}>Payment status</dt>
            <dd className="mt-1.5"><StatusPill status={order.paymentStatus} /></dd>
          </div>
        </dl>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <section id="tracking" className={`${card} scroll-mt-24 p-5 sm:p-6`} aria-labelledby="tracking-title">
            <h3 id="tracking-title" className="mb-5 text-lg font-bold text-ink-900">Track Your Order</h3>
            <OrderTracker status={order.orderStatus} history={order.history} placedAt={order.createdAt} />
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <h3 className="text-lg font-bold text-ink-900">Items in this order</h3>
            <ul className="mt-4 divide-y divide-line">
              {order.items.map((i, n) => (
                <li key={n} className="flex items-center gap-4 py-4">
                  <span className="hatch h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.imageUrl} alt="" className="h-full w-full object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {i.slug ? (
                      <Link href={`/products/${i.slug}`} className="line-clamp-2 font-semibold text-ink-900 hover:text-brand-600">
                        {i.productName}
                      </Link>
                    ) : (
                      <p className="line-clamp-2 font-semibold text-ink-900">{i.productName}</p>
                    )}
                    <p className="mt-0.5 text-sm text-slate-500">
                      {formatPrice(i.unitPrice)} × {i.quantity}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-500">Subtotal</p>
                    <p className="font-bold text-ink-900">{formatPrice(i.lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className={`${card} p-5 sm:p-6`}>
            <h3 className="text-lg font-bold text-ink-900">Payment Information</h3>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className={dt}>Payment method</dt>
                <dd className={dd}>{order.paymentMethod === "PAYHERE" ? "PayHere" : "WhatsApp"}</dd>
              </div>
              <div>
                <dt className={dt}>Payment status</dt>
                <dd className="mt-1"><StatusPill status={order.paymentStatus} /></dd>
              </div>
            </dl>
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <h3 className="text-lg font-bold text-ink-900">Order Summary</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className={dt}>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
                <dd className="font-medium text-ink-900">{formatPrice(order.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className={dt}>Delivery</dt>
                <dd className="font-medium text-emerald-700">Free</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold text-ink-900">Total</dt>
                <dd className="font-bold text-ink-900">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className={`${card} p-5 sm:p-6`}>
            <h3 className="text-lg font-bold text-ink-900">Delivery Details</h3>
            <p className="mt-1 text-xs text-slate-500">As entered at checkout. Later profile changes do not alter it.</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className={dt}>Customer</dt>
                <dd className={dd}>{order.customerName}</dd>
              </div>
              <div>
                <dt className={dt}>Phone</dt>
                <dd className={dd}>{order.phone}</dd>
              </div>
              <div>
                <dt className={dt}>Email</dt>
                <dd className={`${dd} break-all`}>{order.customerEmail}</dd>
              </div>
              <div>
                <dt className={dt}>Delivery address</dt>
                <dd className={dd}>{order.address}, {order.city}</dd>
              </div>
              {order.notes && (
                <div>
                  <dt className={dt}>Notes</dt>
                  <dd className={dd}>{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
