import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/orders - admin only (second gate; proxy.ts is the first)
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ success: true, data: orders.map(serializeOrder) });
  } catch (error) {
    console.error("GET /api/admin/orders failed", error);
    return NextResponse.json({ success: false, message: "Could not load orders" }, { status: 500 });
  }
}
