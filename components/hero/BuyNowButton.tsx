"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { type RefObject, useState } from "react";
import type { SceneControls } from "./controls";
import { SCENE_CONFIG } from "./hero.config";

/**
 * The BUY NOW call to action under the 3D cart. It is a real DOM button (not drawn inside the
 * canvas) so it is keyboard- and screen-reader-accessible. Hovering or focusing it tells the 3D
 * scene to react; clicking plays the short "pull-in" animation, then goes to the shop.
 */
export default function BuyNowButton({ controls }: { controls: RefObject<SceneControls> }) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  function handleClick() {
    if (leaving) return; // ignore repeat clicks while the pull-in animation is playing
    setLeaving(true);
    const c = controls.current;
    if (!c || c.reducedMotion) {
      router.push("/products");
      window.setTimeout(() => setLeaving(false), 2500);
      return;
    }
    c.triggerPull();
    window.setTimeout(() => router.push("/products"), SCENE_CONFIG.click.navigateAfterMs);
    // Re-arm shortly after, so the button still works if the user comes back with the Back button.
    window.setTimeout(() => setLeaving(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-busy={leaving}
      onPointerEnter={() => controls.current?.setHover(1)}
      onPointerLeave={() => controls.current?.setHover(0)}
      onFocus={() => controls.current?.setHover(1)}
      onBlur={() => controls.current?.setHover(0)}
      className="group absolute bottom-[6%] left-1/2 z-10 -translate-x-1/2 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_0_28px_-4px_rgba(34,211,238,0.55),0_12px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/20 transition duration-300 hover:scale-105 hover:shadow-[0_0_44px_-2px_rgba(34,211,238,0.85),0_14px_34px_-10px_rgba(0,0,0,0.7)] focus-visible:scale-105 active:scale-100"
    >
      <ShoppingCart className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden />
      Buy now
    </button>
  );
}
