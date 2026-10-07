import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";
import { listAdminProducts } from "@/lib/admin-products";
import { btnPrimary } from "@/lib/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products | Admin", robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">Products</h1>
          <p className="mt-1.5 text-[15px] text-slate-600">
            {products.length} products. Edit stock in place, or switch a product off to hide it from the store.
          </p>
        </div>
        <Link href="/admin/products/new" className={btnPrimary}>
          <Plus className="h-4 w-4" aria-hidden /> Add product
        </Link>
      </div>

      <div className="mt-6">
        <ProductsTable products={products} />
      </div>
    </>
  );
}
