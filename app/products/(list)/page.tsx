import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import LiveSearchInput from "@/components/ui/LiveSearchInput";
import { getCategories, getProducts } from "@/lib/products";
import { btnPrimary } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Filters live in the URL (?q=&category=), so results are shareable and survive refresh.
export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const category = first(sp.category);

  const [products, categories] = await Promise.all([getProducts({ q, category }), getCategories()]);

  const chipHref = (slug?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("category", slug);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600"
    }`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Products</h1>

      {/* Search as you type: results update after a short pause, no button needed. */}
      <div className="mt-7">
        <LiveSearchInput
          action="/products"
          initialValue={q}
          preserve={{ category }}
          placeholder="Search products"
          ariaLabel="Search products"
        />
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Categories">
        <Link href={chipHref()} className={chip(!category)}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={chipHref(c.slug)} className={chip(category === c.slug)}>
            {c.name} <span className="font-medium opacity-70">({c._count.products})</span>
          </Link>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-600" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q && <> matching &ldquo;{q}&rdquo;</>}
      </p>

      {products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-20 text-center">
          <PackageSearch className="h-10 w-10 text-slate-300" aria-hidden />
          <h2 className="mt-4 text-lg font-bold text-ink-900">No products found</h2>
          <p className="mt-1 text-sm text-slate-600">Try a different search term or category.</p>
          <Link href="/products" className={`${btnPrimary} mt-6`}>
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
