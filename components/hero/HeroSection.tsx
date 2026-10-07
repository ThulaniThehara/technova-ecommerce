import HeroContent from "./HeroContent";
import HeroScene from "./HeroScene";

/**
 * Home-page hero: text on the left, the animated 3D electronics showcase on the right.
 * `data-hero` is the hook HeroScene uses to publish scroll progress to the text (--hero-p).
 * Tune the animation in hero.config.ts, not here.
 */
export default function HeroSection() {
  return (
    <section data-hero className="overflow-x-clip bg-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:min-h-[min(90vh,720px)] lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-16">
        <HeroContent />
        <HeroScene />
      </div>
    </section>
  );
}
