import { CheckCircle2, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { buildOrderMessage, buildWhatsAppUrl, getBusinessWhatsAppNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation" };

const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

// Status comes from the database on every request - never from the browser.
// The order id (an unguessable cuid) is the only thing in the URL.
export default async function OrderSuccessPage({ searchParams }: PageProps<"/order-success">) {
  const sp = await searchParams;
  const id = Array.isArray(sp.order) ? sp.order[0] : sp.order;
  if (!id) notFound();

  const row = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!row) notFound();
  const order = serializeOrder(row);

  const whatsappNumber = getBusinessWhatsAppNumber();
  const whatsappUrl =
    order.paymentMethod === "WHATSAPP" && whatsappNumber ? buildWhatsAppUrl(whatsappNumber, buildOrderMessage(order)) : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold">Thank you, {order.customerName.split(" ")[0]}!</h1>
          <p className="mt-1 text-slate-600">
            Your order <span className="font-semibold text-slate-900">{order.orderCode}</span> has been placed.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm">
          <div><dt className="text-slate-500">Order status</dt><dd className="font-semibold">{label(order.orderStatus)}</dd></div>
          <div><dt className="text-slate-500">Payment status</dt><dd className="font-semibold">{label(order.paymentStatus)}</dd></div>
          <div><dt className="text-slate-500">Payment method</dt><dd className="font-semibold">{label(order.paymentMethod)}</dd></div>
          <div><dt className="text-slate-500">Deliver to</dt><dd className="font-semibold">{order.city}</dd></div>
        </dl>

        <ul className="mt-6 divide-y divide-slate-100 text-sm">
          {order.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3 py-2.5">
              <span>{i.productName} <span className="text-slate-500">× {i.quantity}</span></span>
              <span className="font-medium">{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base">
          <span className="font-semibold">Total</span>
          <span className="font-bold">{formatPrice(order.total)}</span>
        </div>

        {whatsappUrl && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-slate-700">Haven&apos;t sent your order message yet? Send it to us on WhatsApp so we can confirm it.</p>
            <a href={whatsappUrl} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
              <MessageCircle className="h-5 w-5" aria-hidden /> Send order on WhatsApp
            </a>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/products" className="font-medium text-indigo-600 hover:underline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
