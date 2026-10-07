import { NextResponse } from "next/server";
import { getProducts, serializeProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

// GET /api/products?q=&category=  - public, active products only
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const products = await getProducts({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });
    return NextResponse.json({ success: true, data: products.map(serializeProduct) });
  } catch (error) {
    console.error("GET /api/products failed", error);
    return NextResponse.json({ success: false, message: "Could not load products" }, { status: 500 });
  }
}
