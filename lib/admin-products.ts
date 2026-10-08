import { Prisma } from "../generated/prisma/client";
import { sortCategories } from "./category-icons";
import { LOW_STOCK_THRESHOLD } from "./constants";
import { HttpError } from "./errors";
import { prisma } from "./prisma";
import { slugify } from "./slug";
import type { ProductInput } from "./validations";

const include = {
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { orderItems: true } },
} satisfies Prisma.ProductInclude;

type AdminProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

// Plain JSON for API responses and client components (Decimal -> 2dp string).
export function serializeAdminProduct(p: AdminProductRow) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price.toFixed(2),
    stock: p.stock,
    imageUrl: p.imageUrl,
    isActive: p.isActive,
    categoryId: p.categoryId,
    category: p.category,
    orderCount: p._count.orderItems,
    updatedAt: p.updatedAt.toISOString(),
  };
}
export type AdminProduct = ReturnType<typeof serializeAdminProduct>;

const placeholderImage = (name: string) =>
  `https://placehold.co/800x800/0f172a/e2e8f0/png?text=${encodeURIComponent(name)}`;

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const clash = await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  throw new HttpError("Could not generate a unique URL for this product name", 409);
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new HttpError("The selected category does not exist", 400);
}

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export type AdminProductFilters = {
  /** Category slug. */
  category?: string;
  /** Case-insensitive match on the product name. */
  q?: string;
  /** Only products at or below the low-stock threshold (includes out of stock). */
  lowStock?: boolean;
};

export async function listAdminProducts({ category, q, lowStock }: AdminProductFilters = {}) {
  const search = q?.trim().slice(0, 100);
  const where: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(lowStock ? { stock: { lte: LOW_STOCK_THRESHOLD } } : {}),
  };
  const rows = await prisma.product.findMany({ where, include, orderBy: [{ createdAt: "desc" }, { name: "asc" }] });
  return rows.map(serializeAdminProduct);
}

// Sidebar data: every category with how many products it holds (active AND inactive: admins see all).
export async function listAdminCategories() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });
  return sortCategories(categories).map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products }));
}

export async function getAdminProduct(id: string) {
  const row = await prisma.product.findUnique({ where: { id }, include });
  return row ? serializeAdminProduct(row) : null;
}

export async function createProduct(input: ProductInput) {
  await assertCategoryExists(input.categoryId);
  try {
    const row = await prisma.product.create({
      data: {
        name: input.name,
        // The slug is generated, never typed by the admin, so it is always URL-safe and unique.
        slug: await uniqueSlug(slugify(input.name)),
        description: input.description,
        price: input.price.toFixed(2),
        stock: input.stock,
        imageUrl: input.imageUrl || placeholderImage(input.name),
        isActive: input.isActive,
        categoryId: input.categoryId,
      },
      include,
    });
    return serializeAdminProduct(row);
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError("A product with this name already exists. Please try again.", 409);
    throw e;
  }
}

export async function updateProduct(id: string, patch: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!existing) throw new HttpError("Product not found", 404);
  if (patch.categoryId) await assertCategoryExists(patch.categoryId);

  const data: Prisma.ProductUncheckedUpdateInput = {};
  if (patch.name !== undefined) data.name = patch.name; // slug stays stable so existing links keep working
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.price !== undefined) data.price = patch.price.toFixed(2);
  if (patch.stock !== undefined) data.stock = patch.stock;
  if (patch.isActive !== undefined) data.isActive = patch.isActive;
  if (patch.categoryId !== undefined) data.categoryId = patch.categoryId;
  if (patch.imageUrl !== undefined) data.imageUrl = patch.imageUrl || placeholderImage(patch.name ?? existing.name);

  const row = await prisma.product.update({ where: { id }, data, include });
  return serializeAdminProduct(row);
}

// Products that appear on any order are never deleted: order history references them.
// The admin deactivates those instead (isActive = false hides them from the storefront).
export async function deleteProduct(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, _count: { select: { orderItems: true } } },
  });
  if (!existing) throw new HttpError("Product not found", 404);
  if (existing._count.orderItems > 0) {
    throw new HttpError("This product appears on past orders and cannot be deleted. Deactivate it instead.", 409);
  }
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    // An order for it was placed between the check above and this delete: the FK blocks it.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      throw new HttpError("This product was just ordered and cannot be deleted. Deactivate it instead.", 409);
    }
    throw e;
  }
}
