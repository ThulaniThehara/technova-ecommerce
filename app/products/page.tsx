import { PackageSearch, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { getCategories, getProducts } from "@/lib/products";

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
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
      active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
    }`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Products</h1>

      {/* Plain GET form: works without JavaScript and keeps the URL in sync. */}
      <form action="/products" method="get" role="search" className="mt-6 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            placeholder="Search phones, laptops, accessories..."
            aria-label="Search products"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <button type="submit" className="h-12 rounded-xl bg-indigo-600 px-5 font-semibold text-white transition hover:bg-indigo-700">
          Search
        </button>
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Categories">
        <Link href={chipHref()} className={chip(!category)}>All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={chipHref(c.slug)} className={chip(category === c.slug)}>
            {c.name} <span className="opacity-70">({c._count.products})</span>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-600" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {q && <> matching &ldquo;{q}&rdquo;</>}
      </p>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <PackageSearch className="h-12 w-12 text-slate-400" aria-hidden />
          <h2 className="mt-4 text-lg font-semibold">No products found</h2>
          <p className="mt-1 text-sm text-slate-600">Try a different search term or category.</p>
          <Link href="/products" className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700">
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
