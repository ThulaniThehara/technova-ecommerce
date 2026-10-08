import type { Prisma } from "../generated/prisma/client";
import { sortCategories } from "./category-icons";
import { prisma } from "./prisma";

export type ProductFilters = { q?: string; category?: string };

const withCategory = { category: { select: { name: true, slug: true } } } satisfies Prisma.ProductInclude;

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof withCategory }>;

// Public catalogue: only active products, optional case-insensitive search and category filter.
export async function getProducts({ q, category }: ProductFilters = {}, take?: number) {
  const search = q?.trim().slice(0, 100);
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  return prisma.product.findMany({ where, include: withCategory, orderBy: { createdAt: "desc" }, take });
}

export async function getFeaturedProducts(take = 4) {
  return prisma.product.findMany({
    where: { isActive: true, stock: { gt: 0 } },
    include: withCategory,
    orderBy: { price: "desc" },
    take,
  });
}

// Inactive products are treated as not found on the storefront.
export async function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({ where: { slug, isActive: true }, include: withCategory });
}

export async function getActiveProductByIdOrSlug(idOrSlug: string) {
  return prisma.product.findFirst({
    where: { isActive: true, OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: withCategory,
  });
}

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return sortCategories(categories);
}

// Plain JSON shape (Decimal -> string) shared by API responses.
export function serializeProduct(p: ProductWithCategory) {
  return { ...p, price: p.price.toFixed(2) };
}
