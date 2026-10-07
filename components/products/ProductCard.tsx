import Link from "next/link";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { ProductWithCategory } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import StockBadge from "./StockBadge";

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:border-brand-200 hover:shadow-[0_8px_30px_-12px_rgba(13,26,47,0.18)]"
    >
      <div className="hatch relative aspect-[4/3] overflow-hidden">
        {product.stock <= LOW_STOCK_THRESHOLD && (
          <StockBadge stock={product.stock} variant="pill" className="absolute left-3 top-3 z-10" />
        )}
        {/* Plain <img>: admin-provided image URLs can point to any host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
            product.stock === 0 ? "opacity-60 grayscale" : ""
          }`}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium text-slate-500">{product.category.name}</span>
        <h3 className="line-clamp-2 text-[15px] font-bold text-ink-900">{product.name}</h3>
        <p className="mt-0.5 text-lg font-bold text-ink-900">{formatPrice(product.price)}</p>
        <StockBadge stock={product.stock} className="mt-0.5" />
        <span className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition group-hover:bg-brand-700">
          View details
        </span>
      </div>
    </Link>
  );
}
