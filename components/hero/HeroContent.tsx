import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { categoryIcons, fallbackCategoryIcon } from "@/lib/category-icons";
import { btnOutline, btnPrimary } from "@/lib/ui";

export type HeroCategory = { id: string; name: string; slug: string; count: number };

// Short proof points under the buttons. Same claims as the "Why choose TechNova" section.
const stats = [
  { value: "100%", label: "Genuine products" },
  { value: "2–4 days", label: "Island-wide delivery" },
  { value: "2 ways", label: "Pay online or WhatsApp" },
];

/**
 * The hero text. A server component: it is real HTML immediately, before any 3D code loads.
 * As the page scrolls, HeroScene writes --hero-p (0..1) on the hero element and the text eases
 * up and fades with it. With no scrolling (or reduced motion) --hero-p is 0 and nothing moves.
 */
export default function HeroContent({ categories }: { categories: HeroCategory[] }) {
  return (
    <div
      className="will-change-transform"
      style={{
        opacity: "calc(1 - var(--hero-p, 0) * 1.15)",
        transform: "translateY(calc(var(--hero-p, 0) * -44px))",
      }}
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
        New arrivals 2026
      </span>

      {/* Accent bar + highlighted last word, in the style of the reference landing pages */}
      <div className="mt-5 border-l-4 border-brand-600 pl-5 sm:pl-6">
        <h1 className="text-4xl font-bold leading-[1.08] text-ink-900 sm:text-5xl lg:text-[56px]">
          Upgrade Your <span className="text-brand-600">Tech.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">
          Discover the latest smartphones, laptops, smart devices and accessories.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/products" className={btnPrimary}>
          Shop Now <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link href="/products" className={btnOutline}>
          Explore Categories
        </Link>
      </div>

      <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-lg font-bold text-ink-900 sm:text-xl">{s.value}</dt>
            <dd className="mt-0.5 text-xs leading-snug text-slate-500">{s.label}</dd>
          </div>
        ))}
      </dl>

      {categories.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Popular categories</p>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {categories.map((c) => {
              const Icon = categoryIcons[c.slug] ?? fallbackCategoryIcon;
              return (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon className="h-4 w-4 text-brand-600" aria-hidden />
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
