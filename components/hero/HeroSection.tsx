import HeroContent, { type HeroCategory } from "./HeroContent";
import HeroScene from "./HeroScene";

/**
 * Home-page hero: text on the left, the animated 3D electronics showcase on the right.
 * `data-hero` is the hook HeroScene uses to publish scroll progress to the text (--hero-p).
 * Tune the animation in hero.config.ts, not here.
 */
export default function HeroSection({ categories }: { categories: HeroCategory[] }) {
  return (
    <section data-hero className="relative overflow-x-clip bg-white">
      {/* Quiet background texture so the sides never read as blank: a faded dot grid on the
          left and a thin ring behind the text, echoing the line-art in the reference designs. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-3/5 bg-[radial-gradient(#d5dcea_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-brand-200/60 lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/2 hidden h-[300px] w-[300px] -translate-y-1/2 rounded-full border border-brand-200/40 lg:block"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-16 lg:pt-6">
        <HeroContent categories={categories} />
        <HeroScene />
      </div>
    </section>
  );
}
