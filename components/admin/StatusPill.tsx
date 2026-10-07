const tones: Record<string, string> = {
  // order status
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-brand-50 text-brand-700",
  SHIPPED: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  // payment status (PENDING shares the amber above)
  PAID: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
};

export const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        tones[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {titleCase(status)}
    </span>
  );
}
