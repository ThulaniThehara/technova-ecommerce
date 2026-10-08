import { CheckCircle2, Clock, PackageCheck, Settings2, Truck, XCircle } from "lucide-react";
import { statusLabel } from "@/lib/constants";

const tones: Record<string, string> = {
  // order status
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-sky-50 text-sky-700",
  PROCESSING: "bg-brand-50 text-brand-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  // payment status (PENDING shares the amber above)
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};

// Colour is never the only signal: every status also has an icon and its name in text.
const icons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROCESSING: Settings2,
  SHIPPED: Truck,
  COMPLETED: PackageCheck,
  CANCELLED: XCircle,
  PAID: CheckCircle2,
  FAILED: XCircle,
} as const;

export const titleCase = statusLabel;

export default function StatusPill({ status }: { status: string }) {
  const Icon = icons[status as keyof typeof icons];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {statusLabel(status)}
    </span>
  );
}
