"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, type ReactNode, useEffect, useRef, useState } from "react";
import heroImage from "@/public/images/hero.png";
import BuyNowButton from "./BuyNowButton";
import { type SceneControls, createControls } from "./controls";
import { useIsMobile, useReducedMotion, useWebGLSupport } from "./hooks";
import SceneLoader from "./SceneLoader";

// The 3D engine (three.js) is ~hundreds of KB. Loading it lazily means the headline and buttons
// paint immediately and the scene fades in when it is ready.
const ElectronicsScene = dynamic(() => import("./ElectronicsScene"), { ssr: false });

/** If WebGL fails to start (old GPU, blocked context), the hero degrades to a still image. */
class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function StaticFallback() {
  return (
    <Image
      src={heroImage}
      alt="Shopping on a laptop and tablet with a glowing cart, buy now button and payment successful confirmation"
      fill
      priority
      sizes="(min-width: 1024px) 600px, 100vw"
      className="object-cover"
    />
  );
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Client wrapper around the 3D scene. It owns everything the DOM contributes: pointer position,
 * scroll progress, visibility, reduced-motion and mobile flags. Those go into a mutable
 * `controls` object that the scene reads each frame (no React re-renders per mouse move).
 */
export default function HeroScene() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const webgl = useWebGLSupport();

  const controls = useRef<SceneControls>(createControls());
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [visible, setVisible] = useState(true);

  // Keep the scene's flags in step with the media queries.
  useEffect(() => {
    controls.current.setFlags(reduced, mobile);
  }, [reduced, mobile]);

  // Pointer parallax + scroll progress (both written straight into `controls`).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const hero = root.closest<HTMLElement>("[data-hero]");
    const c = controls.current;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      c.setPointer(
        clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        clamp(-(((e.clientY - rect.top) / rect.height) * 2 - 1), -1, 1),
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // With reduced motion the hero stays put: no fading or drifting while scrolling.
        const p = reduced ? 0 : clamp(window.scrollY / ((hero?.offsetHeight ?? root.offsetHeight) * 0.85), 0, 1);
        c.setScroll(p);
        hero?.style.setProperty("--hero-p", p.toFixed(3)); // HeroContent fades/moves with this
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      c.setPointer(0, 0);
      hero?.style.removeProperty("--hero-p");
    };
  }, [reduced]);

  // Pause rendering completely while the hero is off-screen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const show3D = webgl && !failed;

  return (
    <div
      ref={rootRef}
      className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-[#05070D] shadow-[0_30px_70px_-30px_rgba(5,7,13,0.65)] ring-1 ring-black/10 sm:h-[480px] lg:h-[600px]"
    >
      {/* Dark gradient + soft atmospheric glows behind the products */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#0c2147_0%,#070d1c_52%,#05070D_100%)]" />
      <div aria-hidden className="absolute -left-10 top-6 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
      <div aria-hidden className="absolute -right-8 bottom-10 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      {show3D ? (
        <SceneErrorBoundary onError={() => setFailed(true)}>
          <ElectronicsScene
            controls={controls}
            active={visible}
            reducedMotion={reduced}
            mobile={mobile}
            onReady={() => setReady(true)}
          />
        </SceneErrorBoundary>
      ) : (
        <StaticFallback />
      )}

      <SceneLoader visible={show3D && !ready} />
      <BuyNowButton controls={controls} />
    </div>
  );
}
