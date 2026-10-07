import { ArrowRight, Headphones, Laptop, ShieldCheck, Smartphone, Truck, Watch, type LucideIcon } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { getCategories, getFeaturedProducts } from "@/lib/products";
import { btnOutline, btnPrimary, sectionTitle } from "@/lib/ui";

// Stock and prices change in the admin panel, so never prerender this page at build time.
export const dynamic = "force-dynamic";

const categoryIcons: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  "smart-devices": Watch,
  accessories: Headphones,
};

const perks = [
  { icon: ShieldCheck, title: "Genuine Products", text: "100% authentic with manufacturer warranty." },
  { icon: ShieldCheck, title: "Secure Payments", text: "Pay safely online with PayHere." },
  { icon: Truck, title: "Fast Delivery", text: "Island-wide delivery in 2–4 working days." },
  { icon: Headphones, title: "Customer Support", text: "Friendly help by phone and WhatsApp." },
];

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(4)]);

  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              New arrivals 2026
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-ink-900 sm:text-5xl lg:text-[56px]">
              Upgrade Your Tech.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-600">
              Discover the latest smartphones, laptops, smart devices and accessories.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className={btnPrimary}>
                Shop Now <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/products" className={btnOutline}>
                Explore Categories
              </Link>
            </div>
          </div>
          <div className="hatch hidden aspect-[4/3] items-center justify-center rounded-2xl lg:flex">
            <span className="px-6 text-center font-mono text-xs text-slate-400">
              Smartphones · Laptops · Smart devices · Accessories
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Categories */}
        <h2 className={sectionTitle}>Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => {
            const Icon = categoryIcons[c.slug] ?? Headphones;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="rounded-xl border border-line bg-white p-5 transition hover:border-brand-200 hover:shadow-[0_8px_30px_-12px_rgba(13,26,47,0.18)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-4 font-bold text-ink-900">{c.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{c._count.products} products</p>
              </Link>
            );
          })}
        </div>

        {/* Featured */}
        <div className="mt-14 flex items-end justify-between">
          <h2 className={sectionTitle}>Featured products</h2>
          <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* CTA banner */}
        <section className="mt-14 flex flex-wrap items-center justify-between gap-5 rounded-xl bg-ink-900 px-6 py-8 sm:px-10">
          <div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Power Up Your Setup</h2>
            <p className="mt-1 text-sm text-slate-400">Explore our latest laptops and accessories.</p>
          </div>
          <Link href="/products?category=laptops" className={btnPrimary}>
            Shop Now
          </Link>
        </section>

        {/* Why choose us */}
        <h2 className={`${sectionTitle} mt-14`}>Why choose TechNova</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-line bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
