import type { OrderStatus } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { serializeOrder } from "./orders";
import type { ProfileInput } from "./validations";

// Every query here is scoped by `userId`, which always comes from the verified session.
// An order that belongs to someone else is not "forbidden", it simply isn't found.

export async function listCustomerOrders(userId: string, status?: OrderStatus) {
  const rows = await prisma.order.findMany({
    where: { userId, ...(status ? { orderStatus: status } : {}) },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(serializeOrder);
}

export async function getCustomerOrder(userId: string, id: string) {
  const row = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: { include: { product: { select: { imageUrl: true, slug: true, isActive: true } } } } },
  });
  if (!row) return null;
  return {
    ...serializeOrder(row),
    items: row.items.map((i) => ({
      productName: i.productName,
      unitPrice: i.unitPrice.toFixed(2),
      quantity: i.quantity,
      lineTotal: i.unitPrice.mul(i.quantity).toFixed(2),
      imageUrl: i.product.imageUrl,
      // only link to products that can still be bought
      slug: i.product.isActive ? i.product.slug : null,
    })),
  };
}

export type CustomerOrderDetail = NonNullable<Awaited<ReturnType<typeof getCustomerOrder>>>;

export async function getCustomerSummary(userId: string) {
  const [total, pending, completed] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.count({ where: { userId, orderStatus: { in: ["PENDING", "PROCESSING", "SHIPPED"] } } }),
    prisma.order.count({ where: { userId, orderStatus: "COMPLETED" } }),
  ]);
  return { total, pending, completed };
}

export async function updateCustomerProfile(userId: string, input: ProfileInput) {
  // Only name and phone are editable here. Email and role can never be changed through this path.
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name, phone: input.phone },
    select: { id: true, name: true, email: true, phone: true },
  });
}
