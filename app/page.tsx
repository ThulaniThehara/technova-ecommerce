import { ArrowRight, Headset, Laptop, Plug, ShieldCheck, Smartphone, Truck, Watch, type LucideIcon } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/products";

// Stock and prices change in the admin panel, so never prerender this page at build time.
export const dynamic = "force-dynamic";

const categoryIcons: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  "smart-devices": Watch,
  accessories: Plug,
};

const perks = [
  { icon: Truck, title: "Island-wide delivery", text: "Fast, tracked shipping to your door." },
  { icon: ShieldCheck, title: "Genuine products", text: "Brand-new items with warranty." },
  { icon: Headset, title: "Order your way", text: "Pay online or order via WhatsApp." },
];

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-700 text-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">Electronics &amp; tech gadgets</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The latest tech, <span className="text-indigo-300">delivered.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-300">
              Smartphones, laptops, smart devices and accessories from the brands you trust. Secure checkout with PayHere,
              or send your order straight to us on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 shadow transition hover:bg-indigo-50">
                Shop now <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/products?category=smartphones" className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Browse phones
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c.slug] ?? Plug;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs text-slate-500">{c._count.products} products</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 grid w-full max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {perks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
