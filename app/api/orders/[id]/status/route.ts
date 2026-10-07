import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/orders/:id/status
 * Used by the order-success page to poll while PayHere's server notification lands.
 *
 * Returns only the three status fields - no customer details - so the unguessable order id
 * being in a URL cannot leak personal data.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true, paymentStatus: true, orderStatus: true },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { paymentStatus: order.paymentStatus, orderStatus: order.orderStatus },
  });
}
