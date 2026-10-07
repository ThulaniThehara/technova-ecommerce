import { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { formatOrderNumber } from "./utils";
import type { CheckoutInput } from "./validations";

// A business-rule failure that is safe to show to the customer.
export class OrderError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}

// Stock policy: stock is decremented HERE, when the order is created, inside one transaction.
// It is restored when the order is CANCELLED or its payment FAILED (handled in later phases).
export async function createOrder(input: CheckoutInput) {
  // Merge duplicate lines so the same product can't be listed twice to dodge the stock check.
  const wanted = new Map<string, number>();
  for (const { productId, quantity } of input.items) {
    wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
  }

  return prisma.$transaction(
    async (tx) => {
      // 1. Load products from the DB - prices and stock never come from the client.
      const products = await tx.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
      const byId = new Map(products.map((p) => [p.id, p]));

      // 2. Validate every line and compute the total from DB prices only.
      let total = new Prisma.Decimal(0);
      const lines: { product: (typeof products)[number]; quantity: number }[] = [];
      for (const [productId, quantity] of wanted) {
        const product = byId.get(productId);
        if (!product || !product.isActive) {
          throw new OrderError("A product in your cart is no longer available. Please review your cart.");
        }
        if (product.stock < quantity) {
          throw new OrderError(
            product.stock === 0 ? `${product.name} is out of stock` : `Only ${product.stock} of ${product.name} left in stock`,
          );
        }
        total = total.add(product.price.mul(quantity));
        lines.push({ product, quantity });
      }

      // 3. Conditional decrement: the WHERE stock >= qty is evaluated atomically by Postgres,
      //    so two simultaneous buyers can never push stock below zero.
      for (const { product, quantity } of lines) {
        const result = await tx.product.updateMany({
          where: { id: product.id, isActive: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (result.count === 0) throw new OrderError(`Insufficient stock for ${product.name}`);
      }

      // 4. Create the order with snapshot fields (name + price at purchase time).
      return tx.order.create({
        data: {
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          phone: input.phone,
          address: input.address,
          city: input.city,
          notes: input.notes || null,
          total,
          paymentMethod: input.paymentMethod,
          items: {
            create: lines.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity,
            })),
          },
        },
        include: { items: true },
      });
    },
    { maxWait: 10000, timeout: 15000 },
  );
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Plain JSON shape (Decimals as 2-decimal strings) for API responses and the WhatsApp message.
export function serializeOrder(order: OrderWithItems) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderCode: formatOrderNumber(order.orderNumber),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    phone: order.phone,
    address: order.address,
    city: order.city,
    notes: order.notes,
    total: order.total.toFixed(2),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      productName: i.productName,
      unitPrice: i.unitPrice.toFixed(2),
      quantity: i.quantity,
      lineTotal: i.unitPrice.mul(i.quantity).toFixed(2),
    })),
  };
}

export type SerializedOrder = ReturnType<typeof serializeOrder>;
