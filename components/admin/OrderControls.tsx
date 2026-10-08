"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { allowedNextStatuses, statusLabel } from "@/lib/constants";
import { btnDark, card, input, label } from "@/lib/ui";

type Props = {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: "PAYHERE" | "WHATSAPP";
};

const titleCase = (s: string) => (s === "PENDING" || s === "PAID" ? s.charAt(0) + s.slice(1).toLowerCase() : statusLabel(s));

export default function OrderControls({ orderId, orderStatus, paymentStatus, paymentMethod }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(orderStatus);
  const [payment, setPayment] = useState(paymentStatus);
  const [busy, setBusy] = useState<"status" | "payment" | null>(null);

  const cancelled = orderStatus === "CANCELLED";
  // Final states (cancelled, delivered) have nothing left to change.
  const options = allowedNextStatuses(orderStatus);
  const finished = options.length === 0;

  async function save(kind: "status" | "payment") {
    if (kind === "status" && status === "CANCELLED") {
      const sure = window.confirm("Cancel this order? The items will be returned to stock. This cannot be undone.");
      if (!sure) return;
    }
    setBusy(kind);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kind === "status" ? { orderStatus: status } : { paymentStatus: payment }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.message ?? "Could not update the order");
        // Put the control back to what the server says is true.
        setStatus(orderStatus);
        setPayment(paymentStatus);
        return;
      }
      toast.success(kind === "status" ? `Order marked ${titleCase(status)}` : `Payment marked ${titleCase(payment)}`);
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={`${card} space-y-6 p-6`}>
      <div>
        <h2 className="text-lg font-bold text-ink-900">Update order</h2>
        <p className="mt-1 text-sm text-slate-500">
          {cancelled
            ? "This order is cancelled and can no longer be changed."
            : finished
              ? "This order has been delivered."
              : "Move the order forward. The customer sees every change on their tracking page."}
        </p>
      </div>

      <div>
        <label htmlFor="orderStatus" className={label}>Order status</label>
        <div className="flex gap-2">
          <select
            id="orderStatus"
            value={status}
            disabled={finished || busy !== null}
            onChange={(e) => setStatus(e.target.value)}
            className={`${input} flex-1`}
          >
            <option value={orderStatus}>{titleCase(orderStatus)} (current)</option>
            {options.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => save("status")}
            disabled={finished || busy !== null || status === orderStatus}
            className={`${btnDark} px-5`}
          >
            {busy === "status" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Update
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="paymentStatus" className={label}>Payment status</label>
        {paymentMethod === "WHATSAPP" ? (
          <>
            <div className="flex gap-2">
              <select
                id="paymentStatus"
                value={payment}
                disabled={cancelled || busy !== null}
                onChange={(e) => setPayment(e.target.value)}
                className={`${input} flex-1`}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
              </select>
              <button
                type="button"
                onClick={() => save("payment")}
                disabled={cancelled || busy !== null || payment === paymentStatus}
                className={`${btnDark} px-5`}
              >
                {busy === "payment" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Update
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              WhatsApp orders are paid outside the site. Mark this as Paid once you have received the money.
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-surface px-4 py-3 text-sm text-slate-600">
            {titleCase(paymentStatus)} &mdash; online payments are confirmed automatically by PayHere and cannot be edited here.
          </p>
        )}
      </div>
    </section>
  );
}
