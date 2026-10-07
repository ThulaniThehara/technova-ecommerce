import { LOW_STOCK_THRESHOLD } from "./constants";
import { serializeOrder } from "./orders";
import { prisma } from "./prisma";

export async function getDashboardStats() {
  const [totalOrders, pendingOrders, revenue, lowStock, activeProducts, recent] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    // Revenue counts money actually received: PAID orders only. A cancelled order is excluded
    // too, because cancelling a paid order means it is being refunded.
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID", orderStatus: { not: "CANCELLED" } },
    }),
    prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    revenue: (revenue._sum.total ?? 0).toString(),
    lowStock,
    activeProducts,
    recentOrders: recent.map(serializeOrder),
  };
}
