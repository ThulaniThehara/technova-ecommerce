import { Check, XCircle } from "lucide-react";
import { TRACK_STEPS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

type HistoryEntry = { status: string; note: string | null; createdAt: string };
type StepState = "done" | "current" | "upcoming";

/**
 * "Track Your Order". Shows where the order is in its lifecycle (Placed, Confirmed, Processing,
 * Shipped, Delivered). Every date comes from the order's status history, so a step that has
 * not happened yet shows no date. Horizontal on desktop, vertical on mobile.
 * A cancelled order is shown as its own state instead of a step that carries on after Shipped.
 */
export default function OrderTracker({
  status,
  history,
  placedAt,
}: {
  status: string;
  history: HistoryEntry[];
  placedAt: string;
}) {
  if (status === "CANCELLED") {
    const entry = [...history].reverse().find((h) => h.status === "CANCELLED");
    return (
      <div role="status" className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden />
        <div>
          <p className="font-bold text-red-700">Order Cancelled</p>
          <p className="mt-1 text-sm text-slate-700">This order has been cancelled.</p>
          {entry && (
            <p className="mt-2 text-sm text-slate-600">
              Cancelled on {formatDateTime(entry.createdAt)}
              {entry.note ? ` · ${entry.note}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    TRACK_STEPS.findIndex((s) => s.status === status),
  );
  const delivered = status === "COMPLETED";

  const steps = TRACK_STEPS.map((step, i) => {
    const state: StepState = delivered || i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
    // First time the order reached this step. The very first step falls back to the order date.
    const at = history.find((h) => h.status === step.status)?.createdAt ?? (i === 0 ? placedAt : null);
    return { ...step, state, at };
  });

  const stateText = { done: "Completed", current: "Current status", upcoming: "Upcoming" } as const;

  const marker = (state: StepState) =>
    state === "done"
      ? "border-emerald-600 bg-emerald-600 text-white"
      : state === "current"
        ? "border-brand-600 bg-white text-brand-600 ring-4 ring-brand-100"
        : "border-slate-300 bg-white text-slate-300";

  const icon = (state: StepState) =>
    state === "done" ? (
      <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
    ) : (
      <span className={`h-2.5 w-2.5 rounded-full ${state === "current" ? "bg-brand-600" : "bg-transparent"}`} />
    );

  return (
    <div>
      {/* Desktop: horizontal */}
      <ol className="hidden md:flex" aria-label="Order progress">
        {steps.map((s, i) => (
          <li key={s.status} className="relative flex-1 text-center" aria-current={s.state === "current" ? "step" : undefined}>
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute right-1/2 top-4 h-0.5 w-full ${s.state === "upcoming" ? "bg-slate-200" : "bg-emerald-600"}`}
              />
            )}
            <span className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 ${marker(s.state)}`}>
              {icon(s.state)}
            </span>
            <p className={`mt-3 text-sm font-bold ${s.state === "upcoming" ? "text-slate-400" : "text-ink-900"}`}>{s.label}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{stateText[s.state]}</p>
            <p className="mt-1 px-2 text-xs text-slate-500">{s.at ? formatDateTime(s.at) : "Pending"}</p>
          </li>
        ))}
      </ol>

      {/* Mobile: vertical, no horizontal overflow */}
      <ol className="md:hidden" aria-label="Order progress">
        {steps.map((s, i) => (
          <li key={s.status} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s.state === "current" ? "step" : undefined}>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-4 top-8 h-full w-0.5 -translate-x-1/2 ${steps[i + 1].state === "upcoming" ? "bg-slate-200" : "bg-emerald-600"}`}
              />
            )}
            <span className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${marker(s.state)}`}>
              {icon(s.state)}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-bold ${s.state === "upcoming" ? "text-slate-400" : "text-ink-900"}`}>
                {s.label} <span className="ml-1 text-xs font-medium text-slate-500">· {stateText[s.state]}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{s.at ? formatDateTime(s.at) : "Pending"}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
