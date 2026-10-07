import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

/**
 * Stock indicator. Two looks, same information:
 *  - "dot"  : coloured dot + label, used inside product cards and detail pages
 *  - "pill" : tinted pill, used as a corner badge on card images
 */
export default function StockBadge({
  stock,
  variant = "dot",
  className = "",
}: {
  stock: number;
  variant?: "dot" | "pill";
  className?: string;
}) {
  const state =
    stock === 0
      ? { label: "Out of stock", dot: "bg-slate-400", text: "text-slate-500", pill: "bg-slate-100 text-slate-600" }
      : stock <= LOW_STOCK_THRESHOLD
        ? { label: `Low stock — ${stock} left`, dot: "bg-amber-500", text: "text-amber-600", pill: "bg-amber-50 text-amber-700" }
        : { label: "In stock", dot: "bg-emerald-500", text: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700" };

  if (variant === "pill") {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${state.pill} ${className}`}>
        {stock === 0 ? "Out of stock" : stock <= LOW_STOCK_THRESHOLD ? "Low Stock" : "In stock"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${state.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${state.dot}`} aria-hidden />
      {state.label}
    </span>
  );
}
