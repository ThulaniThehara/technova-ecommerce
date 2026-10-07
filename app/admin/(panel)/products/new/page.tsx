import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add product | Admin", robots: { index: false, follow: false } };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <>
      <h1 className="text-3xl font-bold text-ink-900">Add product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </>
  );
}
