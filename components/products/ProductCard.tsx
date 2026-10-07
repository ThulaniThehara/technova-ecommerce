import Link from "next/link";
import type { ProductWithCategory } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import StockBadge from "./StockBadge";

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {/* Plain <img>: admin-provided image URLs can point to any host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-105 ${product.stock === 0 ? "opacity-60 grayscale" : ""}`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{product.category.name}</span>
        <h3 className="line-clamp-2 font-semibold text-slate-900">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
