export default function StockBadge({ stock }: { stock: number }) {
  const [label, style] =
    stock === 0
      ? ["Out of stock", "bg-red-50 text-red-700 ring-red-600/20"]
      : stock <= 5
        ? [`Only ${stock} left`, "bg-amber-50 text-amber-700 ring-amber-600/20"]
        : ["In stock", "bg-emerald-50 text-emerald-700 ring-emerald-600/20"];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {label}
    </span>
  );
}
