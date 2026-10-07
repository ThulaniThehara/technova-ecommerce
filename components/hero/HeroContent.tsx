import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { btnOutline, btnPrimary } from "@/lib/ui";

/**
 * The hero text. A server component: it is real HTML immediately, before any 3D code loads.
 * As the page scrolls, HeroScene writes --hero-p (0..1) on the hero element and the text eases
 * up and fades with it. With no scrolling (or reduced motion) --hero-p is 0 and nothing moves.
 */
export default function HeroContent() {
  return (
    <div
      className="will-change-transform"
      style={{
        opacity: "calc(1 - var(--hero-p, 0) * 1.15)",
        transform: "translateY(calc(var(--hero-p, 0) * -44px))",
      }}
    >
      <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        New arrivals 2026
      </span>
      <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-ink-900 sm:text-5xl lg:text-[56px]">Upgrade Your Tech.</h1>
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
  );
}
