import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PaymentStatusPoller from "@/components/checkout/PaymentStatusPoller";
import { getCustomer } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { btnDark, btnOutline, card } from "@/lib/ui";
import { formatPrice } from "@/lib/utils";
import { buildOrderMessage, buildWhatsAppUrl, getBusinessWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

const statusPill: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
};

// Status comes from the database on every request - never from the browser.
// The order id (an unguessable cuid) is the only thing in the URL.
export default async function OrderSuccessPage({ searchParams }: PageProps<"/order-success">) {
  const sp = await searchParams;
  const id = Array.isArray(sp.order) ? sp.order[0] : sp.order;
  if (!id) notFound();

  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!row) notFound();
  // Only the customer who placed the order may view it (legacy orders without an owner excepted).
  if (row.userId && row.userId !== (await getCustomer())?.id) notFound();
  const order = serializeOrder(row);

  const whatsappNumber = getBusinessWhatsAppNumber();
  const whatsappUrl =
    order.paymentMethod === "WHATSAPP" && whatsappNumber ? buildWhatsAppUrl(whatsappNumber, buildOrderMessage(order)) : null;

  const isPayHere = order.paymentMethod === "PAYHERE";
  const awaitingPayment = isPayHere && order.paymentStatus === "PENDING";
  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED";

  const heading = failed ? "Payment Not Completed" : paid ? "Order Confirmed!" : "Order Received!";
  const subtitle = failed
    ? "The payment was not completed, so this order has been cancelled."
    : paid
      ? "Thank you for shopping with TechNova. Payment received through PayHere."
      : isPayHere
        ? "Thank you for shopping with TechNova. We are confirming your payment."
        : "Thank you for shopping with TechNova. Send us your order on WhatsApp to confirm it.";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${failed ? "bg-red-50" : "bg-emerald-50"}`}
        >
          {failed ? (
            <XCircle className="h-9 w-9 text-red-600" aria-hidden />
          ) : (
            <CheckCircle2 className="h-9 w-9 text-emerald-600" aria-hidden />
          )}
        </span>
        <h1 className="mt-6 text-3xl font-bold text-ink-900 sm:text-4xl">{heading}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
      </div>

      {/* The payment status below is read from our database, which is only updated by
          PayHere's verified server notification - not by the redirect that brought you here. */}
      {awaitingPayment && <PaymentStatusPoller orderId={order.id} />}

      <div className={`${card} mt-8 p-6 sm:p-8`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Order Number</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{order.orderCode}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              statusPill[order.paymentStatus] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {label(order.paymentStatus)}
          </span>
        </div>

        <dl className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Customer</dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">
              {order.customerName}
              <br />
              <span className="font-normal text-slate-600">{order.customerEmail}</span>
              <br />
              <span className="font-normal text-slate-600">{order.phone}</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Delivery address</dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">
              {order.address}, {order.city}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Payment method</dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">
              {order.paymentMethod === "PAYHERE" ? "PayHere" : "WhatsApp"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Order status</dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">{label(order.orderStatus)}</dd>
          </div>
        </dl>

        <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
          {order.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3">
              <span className="text-ink-900">
                {i.productName} <span className="text-slate-500">× {i.quantity}</span>
              </span>
              <span className="shrink-0 font-semibold text-ink-900">{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="text-lg font-bold text-ink-900">Total</span>
          <span className="text-lg font-bold text-ink-900">{formatPrice(order.total)}</span>
        </div>
      </div>

      {failed && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-slate-700">
          The payment was cancelled or declined, so this order has been cancelled and the items returned to stock. You can
          place the order again, or send it to us on WhatsApp instead.
        </p>
      )}

      {whatsappUrl && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm text-slate-700">
            Haven&apos;t sent your order message yet? Send it to us on WhatsApp so we can confirm it.
          </p>
          <a
            href={whatsappUrl}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-5 w-5" aria-hidden /> Send order on WhatsApp
          </a>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className={`${btnDark} px-8 py-3.5 text-base`}>
          Continue Shopping
        </Link>
        <Link href="/products" className={`${btnOutline} px-8 py-3.5 text-base`}>
          View Products
        </Link>
      </div>
    </div>
  );
}
