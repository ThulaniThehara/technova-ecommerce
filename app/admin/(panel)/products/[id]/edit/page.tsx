import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin-products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product | Admin", robots: { index: false, follow: false } };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <h1 className="text-3xl font-bold text-ink-900">Edit product</h1>
      <p className="mt-1.5 text-[15px] text-slate-600">{product.name}</p>
      <div className="mt-6">
        <ProductForm categories={categories} product={product} />
      </div>
    </>
  );
}
