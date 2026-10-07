import { MathUtils } from "three";
import type { OrbitConfig } from "./hero.config";

export type Vec3 = { x: number; y: number; z: number };

/**
 * Position of a product on its orbit at time `t` (seconds).
 *
 * It is a pure function of t built only from sin/cos, so it is continuous for ever: there is no
 * "restart", which is what makes the loop seamless. Two extra slow harmonics bend the ellipse
 * slightly so the path looks organic instead of a perfect compass circle.
 */
export function orbitPoint(o: OrbitConfig, t: number, radiusScale = 1): Vec3 {
  const a = t * o.speed + o.phase;
  const rx = o.radiusX * radiusScale;
  const rz = o.radiusZ * radiusScale;
  const x = Math.cos(a) * rx + Math.cos(a * 2 + o.phase * 1.7) * 0.1 * rx;
  const z = Math.sin(a) * rz + Math.sin(a * 1.5 + o.phase * 0.6) * 0.12 * rz;
  const y = o.height + Math.sin(t * o.floatSpeed + o.phase) * o.floatAmp + x * o.slope;
  return { x, y, z };
}

/**
 * Vertical push that keeps products from covering the cart.
 * When a product swings in front of the cart (z > 0, x near 0) it is nudged up (if it lives in
 * the upper layers) or down (lower layers), so it passes above/below the cart instead of over it.
 * The push fades in smoothly with how far in front it is, so it never looks like a jump.
 */
export function cartAvoidance(p: Vec3, layerSide: 1 | -1, strength = 1): number {
  const inFront = MathUtils.smoothstep(p.z, -0.5, 2.2);
  const lateral = Math.exp(-(p.x * p.x) / (2 * 1.35 * 1.35));
  return layerSide * inFront * lateral * 1.35 * strength;
}

/** Rises 0 -> 1 -> 0 over the click animation. 0 when idle. */
export function pullEnvelope(startedAt: number, now: number, durationMs: number): number {
  if (!startedAt) return 0;
  const k = (now - startedAt) / durationMs;
  if (k <= 0 || k >= 1) return 0;
  return Math.sin(Math.PI * k);
}

export const easeOutCubic = (k: number) => 1 - Math.pow(1 - MathUtils.clamp(k, 0, 1), 3);
