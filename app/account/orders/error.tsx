"use client";

import { AlertTriangle } from "lucide-react";
import { btnPrimary, card } from "@/lib/ui";

export default function OrdersError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className={`${card} flex flex-col items-center px-6 py-16 text-center`} role="alert">
      <AlertTriangle className="h-10 w-10 text-amber-500" aria-hidden />
      <h2 className="mt-4 text-lg font-bold text-ink-900">We couldn&apos;t load your orders right now.</h2>
      <p className="mt-1 text-sm text-slate-500">Please check your connection and try again.</p>
      <button type="button" onClick={reset} className={`${btnPrimary} mt-6`}>
        Try Again
      </button>
    </div>
  );
}
