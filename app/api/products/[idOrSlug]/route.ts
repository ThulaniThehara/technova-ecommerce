import { NextResponse } from "next/server";
import { getActiveProductByIdOrSlug, serializeProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

// GET /api/products/:idOrSlug - public; inactive products behave as 404
export async function GET(_request: Request, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const { idOrSlug } = await params;
    const product = await getActiveProductByIdOrSlug(idOrSlug);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: serializeProduct(product) });
  } catch (error) {
    console.error("GET /api/products/[idOrSlug] failed", error);
    return NextResponse.json({ success: false, message: "Could not load product" }, { status: 500 });
  }
}
