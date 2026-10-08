import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusPill from "@/components/admin/StatusPill";
import { getCustomerOrder } from "@/lib/account";
import { getCustomer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";

export default async function MyOrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const customer = (await getCustomer())!;
  // Scoped to this customer: someone else's order id is indistinguishable from a missing one.
  const order = await getCustomerOrder(customer.id, (await params).id);
  if (!order) notFound();

  return (
    <>
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-ink-900">{order.orderCode}</h2>
        <StatusPill status={order.orderStatus} />
        <StatusPill status={order.paymentStatus} />
      </div>
      <p className="mt-1.5 text-sm text-slate-500">
        Placed {formatDateTime(order.createdAt)} &middot; {order.paymentMethod === "PAYHERE" ? "PayHere" : "WhatsApp"}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={`${card} min-w-0 p-6 lg:col-span-2`}>
          <h3 className="text-lg font-bold text-ink-900">Items</h3>
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
                <p className="shrink-0 font-bold text-ink-900">{formatPrice(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-line pt-4 text-base">
            <span className="font-bold text-ink-900">Total</span>
            <span className="font-bold text-ink-900">{formatPrice(order.total)}</span>
          </div>
        </section>

        <section className={`${card} h-fit p-6`}>
          <h3 className="text-lg font-bold text-ink-900">Delivery</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="mt-0.5 font-medium text-ink-900">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Phone</dt>
              <dd className="mt-0.5 font-medium text-ink-900">{order.phone}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="mt-0.5 break-all font-medium text-ink-900">{order.customerEmail}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd className="mt-0.5 font-medium text-ink-900">
                {order.address}, {order.city}
              </dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-slate-500">Notes</dt>
                <dd className="mt-0.5 font-medium text-ink-900">{order.notes}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </>
  );
}
