import { prisma } from "./prisma";

// A signed-in customer's cart lives in the database so it follows them to any device.
// It stores only product ids + quantities. Everything shown (name, price, stock) is read fresh.

export type ServerCartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number; // display only; the order API recomputes prices from the database
  imageUrl: string;
  quantity: number;
  stock: number;
};

type Line = { productId: string; quantity: number };

// Turn stored lines into displayable items: drop products that were deleted, deactivated or sold out,
// and never show more than is in stock.
async function hydrate(lines: Line[]): Promise<ServerCartItem[]> {
  if (lines.length === 0) return [];
  const products = await prisma.product.findMany({ where: { id: { in: lines.map((l) => l.productId) }, isActive: true, stock: { gt: 0 } } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: ServerCartItem[] = [];
  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p) continue;
    items.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.imageUrl,
      quantity: Math.max(1, Math.min(line.quantity, p.stock)),
      stock: p.stock,
    });
  }
  return items;
}

async function readLines(userId: string): Promise<Line[]> {
  const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  return cart?.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) ?? [];
}

// Replace the whole stored cart with these lines (after validating them), in one transaction.
async function writeLines(userId: string, lines: Line[]): Promise<ServerCartItem[]> {
  const items = await hydrate(lines);
  await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (items.length) {
      await tx.cartItem.createMany({ data: items.map((i) => ({ cartId: cart.id, productId: i.productId, quantity: i.quantity })) });
    }
    await tx.cart.update({ where: { id: cart.id }, data: {} }); // bump updatedAt
  });
  return items;
}

export async function getServerCart(userId: string): Promise<ServerCartItem[]> {
  return hydrate(await readLines(userId));
}

/** The cart exactly as the browser sent it (used when the customer edits their cart). */
export async function replaceServerCart(userId: string, lines: Line[]): Promise<ServerCartItem[]> {
  return writeLines(userId, mergeLines(lines, []));
}

/**
 * Sign-in merge: combine the guest/browser cart with the saved cart.
 * iPhone x1 in the browser + iPhone x2 saved = iPhone x3, but never more than is in stock.
 */
export async function mergeIntoServerCart(userId: string, browserLines: Line[]): Promise<ServerCartItem[]> {
  return writeLines(userId, mergeLines(await readLines(userId), browserLines));
}

function mergeLines(a: Line[], b: Line[]): Line[] {
  const totals = new Map<string, number>();
  for (const l of [...a, ...b]) totals.set(l.productId, (totals.get(l.productId) ?? 0) + l.quantity);
  return [...totals].map(([productId, quantity]) => ({ productId, quantity }));
}
