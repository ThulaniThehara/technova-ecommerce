import { AlertTriangle, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";
import LiveSearchInput from "@/components/ui/LiveSearchInput";
import { listAdminCategories, listAdminProducts } from "@/lib/admin-products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { btnPrimary, card } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products | Admin", robots: { index: false, follow: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// All filters live in the URL (?category=&q=&stock=low): bookmarkable, shareable, survive a refresh.
export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const categories = await listAdminCategories();

  // Only accept a category that really exists, so a mistyped URL just shows "All".
  const requested = first(sp.category);
  const category = categories.find((c) => c.slug === requested)?.slug;
  const q = first(sp.q).trim().slice(0, 100);
  const lowStock = first(sp.stock) === "low";

  const products = await listAdminProducts({ category, q, lowStock });
  const total = categories.reduce((n, c) => n + c.count, 0);
  const filtered = Boolean(category || q || lowStock);
  const activeCategory = categories.find((c) => c.slug === category);

  const href = (next: { category?: string; q?: string; stock?: boolean }) => {
    const params = new URLSearchParams();
    const cat = "category" in next ? next.category : category;
    const query = "q" in next ? next.q : q;
    const stock = "stock" in next ? next.stock : lowStock;
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);
    if (stock) params.set("stock", "low");
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-700 hover:border-brand-200 hover:text-brand-600"
    }`;
  const row = (active: boolean) =>
    `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
      active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-surface"
    }`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">
            {activeCategory ? activeCategory.name : "Products"}
          </h1>
          <p className="mt-1.5 text-[15px] text-slate-600" aria-live="polite">
            {filtered ? `${products.length} of ${total} products` : `${total} products`}. Edit stock in place, or switch a
            product off to hide it from the store.
          </p>
        </div>
        <Link href="/admin/products/new" className={btnPrimary}>
          <Plus className="h-4 w-4" aria-hidden /> Add product
        </Link>
      </div>

      {/* Phones and tablets: categories as a sideways-scrolling chip row */}
      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:hidden" aria-label="Categories">
        <Link href={href({ category: undefined })} className={chip(!category)}>
          All ({total})
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug })} className={chip(category === c.slug)}>
            {c.name} ({c.count})
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop: category sidebar, like the storefront filters */}
        <aside className="hidden lg:block">
          <div className={`${card} sticky top-6 p-5`}>
            <h2 className="text-sm font-bold text-ink-900">Category</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href={href({ category: undefined })} aria-current={!category ? "true" : undefined} className={row(!category)}>
                  <span>All</span>
                  <span className="text-xs font-medium opacity-70">{total}</span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={href({ category: c.slug })} aria-current={category === c.slug ? "true" : undefined} className={row(category === c.slug)}>
                    <span>{c.name}</span>
                    <span className="text-xs font-medium opacity-70">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-sm font-bold text-ink-900">Stock</h2>
            <Link
              href={href({ stock: !lowStock })}
              aria-pressed={lowStock}
              className={`mt-3 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                lowStock ? "border-amber-300 bg-amber-50 text-amber-800" : "border-line text-ink-600 hover:bg-surface"
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Low / out of stock
            </Link>
            <p className="mt-2 text-xs text-slate-500">Shows products with {LOW_STOCK_THRESHOLD} or fewer units.</p>
          </div>
        </aside>

        {/* min-w-0 lets this column shrink so the table scrolls inside its card instead of widening the page */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2.5">
            {/* Search as you type: results update after a short pause, no button needed. */}
            <div className="min-w-[200px] flex-1">
              <LiveSearchInput
                action="/admin/products"
                initialValue={q}
                preserve={{ category, stock: lowStock ? "low" : undefined }}
                placeholder="Search products by name"
                ariaLabel="Search products"
              />
            </div>
            {/* Phones have no sidebar, so the stock filter sits here instead */}
            <Link
              href={href({ stock: !lowStock })}
              aria-pressed={lowStock}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition lg:hidden ${
                lowStock ? "border-amber-300 bg-amber-50 text-amber-800" : "border-line bg-white text-ink-700"
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden /> Low stock
            </Link>
          </div>

          {filtered && (
            <p className="mt-3 text-sm text-slate-600">
              Filtered view.{" "}
              <Link href="/admin/products" className="font-semibold text-brand-600 hover:underline">
                Clear all filters
              </Link>
            </p>
          )}

          <div className="mt-4">
            {products.length === 0 && filtered ? (
              <div className={`${card} px-6 py-14 text-center text-sm text-slate-500`}>
                No products match these filters.{" "}
                <Link href="/admin/products" className="font-semibold text-brand-600 hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <ProductsTable products={products} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
