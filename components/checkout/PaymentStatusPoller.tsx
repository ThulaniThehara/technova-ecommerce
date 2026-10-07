"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { btnDark } from "@/lib/ui";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20; // ~1 minute, then stop and let the customer refresh

/**
 * PayHere redirects the customer back to us the moment the card form finishes, but the
 * authoritative confirmation arrives separately on our notify endpoint. So this component
 * never reads anything from the redirect URL - it asks our own server what the payment status
 * is until the notification has landed.
 */
export default function PaymentStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const timer = setInterval(async () => {
      attempts += 1;
      if (attempts > MAX_ATTEMPTS) {
        clearInterval(timer);
        if (!cancelled) setGaveUp(true);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success && json.data.paymentStatus !== "PENDING") {
          clearInterval(timer);
          router.refresh(); // re-render the server page with the settled status
        }
      } catch {
        // transient network error: just try again on the next tick
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId, router]);

  if (gaveUp) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-slate-700">
        <p>
          We haven&apos;t received confirmation from the payment provider yet. This can take a moment. Refresh this page,
          or contact us with your order number if the status does not change.
        </p>
        <button type="button" onClick={() => router.refresh()} className={`${btnDark} mt-4`}>
          Refresh status
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm font-medium text-brand-700">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>Waiting for payment confirmation from PayHere...</span>
    </div>
  );
}
