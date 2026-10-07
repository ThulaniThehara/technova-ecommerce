import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/products/AddToCart";
import StockBadge from "@/components/products/StockBadge";
import { getActiveProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  return { title: product?.name ?? "Product not found", description: product?.description };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getActiveProductBySlug(slug);
  if (!product) notFound(); // missing or deactivated -> 404

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="hatch overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="text-sm font-medium text-slate-500">{product.category.name}</span>
            <h1 className="mt-1.5 text-3xl font-bold text-ink-900 sm:text-4xl">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold text-ink-900">{formatPrice(product.price)}</span>
            <StockBadge stock={product.stock} />
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <AddToCart
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: Number(product.price),
                imageUrl: product.imageUrl,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-xl font-bold text-ink-900">Product description</h2>
        <p className="mt-3 leading-relaxed text-slate-600">{product.description}</p>
      </section>
    </div>
  );
}
