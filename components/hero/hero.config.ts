/**
 * ALL animation tuning for the 3D hero lives in this file.
 * Nothing in the components hard-codes a product position, speed or size, so to change the
 * scene you edit the numbers here and the scene follows.
 *
 * Coordinate system (world units, camera looks down -Z at the origin):
 *   +x right · +y up · +z towards the viewer. The shopping cart sits at (0, 0, 0).
 */

export type ProductKind =
  | "laptop"
  | "phone"
  | "tablet"
  | "earbuds"
  | "headphones"
  | "mouse"
  | "watch"
  | "keyboard"
  | "controller"
  | "speaker";

export type OrbitConfig = {
  /** Half-width of the elliptical path (x). Bigger = wider orbit. */
  radiusX: number;
  /** Half-depth of the path (z). The depth effect comes from this: positive z is nearer the camera. */
  radiusZ: number;
  /** Angular speed in radians/second. 0.08 ≈ one lap every 78s. Keep it small: slow reads as premium. */
  speed: number;
  /** Starting angle in radians. Spread products around the circle with different phases. */
  phase: number;
  /** Base height (y) of the path. Alternate +/- so products sit in different layers and never collide. */
  height: number;
  /** How far the product bobs up and down while orbiting. */
  floatAmp: number;
  /** Speed of that bobbing, rad/s. */
  floatSpeed: number;
  /** Tilts the whole path: adds `x * slope` to y, so one side of the orbit is higher than the other. */
  slope: number;
};

export type RotationConfig = {
  /** Resting orientation in radians [x, y, z]. */
  base: [number, number, number];
  /** Speed of the slow left/right swing around Y (the product swings about 50 degrees each way).
   *  Keep it small (0.04 to 0.1): bigger values look like a spinning toy. */
  spinY: number;
  /** Gentle rocking amount in radians (x and z axes). */
  sway: number;
};

export type ProductConfig = {
  id: string;
  kind: ProductKind;
  /**
   * Path of the real model in /public, e.g. "/models/laptop.glb". If the file does not exist the
   * built-in placeholder for `kind` is rendered instead, so the scene always works. Drop the GLB
   * in place and reload: no code change needed.
   */
  model: string | null;
  /** Target size of the largest dimension in world units. GLBs are auto-fitted to this. */
  size: number;
  /** Extra multiplier on top of `size`. */
  scale: number;
  orbit: OrbitConfig;
  rotation: RotationConfig;
  /** Seconds before this product fades/scales in at page load, so they arrive one after another. */
  delay: number;
  /** Shown on phones. Phones render only the products marked true (about 5) to stay smooth. */
  mobile: boolean;
};

export const PRODUCTS: ProductConfig[] = [
  // ── Outer ring: large devices, wide slow orbits ──
  {
    id: "laptop",
    kind: "laptop",
    model: "/models/laptop.glb",
    size: 2.1,
    scale: 1,
    orbit: { radiusX: 3.5, radiusZ: 2.7, speed: 0.075, phase: 3.9, height: 1.55, floatAmp: 0.16, floatSpeed: 0.45, slope: 0.07 },
    rotation: { base: [0.12, 0.45, 0.02], spinY: 0.05, sway: 0.1 },
    delay: 0.1,
    mobile: true,
  },
  {
    id: "tablet",
    kind: "tablet",
    model: "/models/tablet.glb",
    size: 1.55,
    scale: 1,
    orbit: { radiusX: 3.1, radiusZ: 2.3, speed: 0.068, phase: 5.2, height: -0.15, floatAmp: 0.14, floatSpeed: 0.38, slope: -0.05 },
    rotation: { base: [-0.15, -0.35, 0.1], spinY: 0.07, sway: 0.12 },
    delay: 0.3,
    mobile: false,
  },
  {
    id: "keyboard",
    kind: "keyboard",
    model: "/models/keyboard.glb",
    size: 1.8,
    scale: 1,
    orbit: { radiusX: 3.4, radiusZ: 2.6, speed: 0.082, phase: 1.9, height: -1.2, floatAmp: 0.12, floatSpeed: 0.5, slope: 0.04 },
    rotation: { base: [0.55, 0.3, -0.05], spinY: 0.04, sway: 0.08 },
    delay: 0.5,
    mobile: false,
  },
  {
    id: "speaker",
    kind: "speaker",
    model: "/models/speaker.glb",
    size: 1.15,
    scale: 1,
    orbit: { radiusX: 3.0, radiusZ: 2.6, speed: 0.072, phase: 0.6, height: 0.55, floatAmp: 0.15, floatSpeed: 0.42, slope: -0.04 },
    rotation: { base: [0.1, 0.5, 0.05], spinY: 0.06, sway: 0.1 },
    delay: 0.7,
    mobile: false,
  },

  // ── Inner ring: smaller devices, closer to the cart ──
  {
    id: "phone",
    kind: "phone",
    model: "/models/phone.glb",
    size: 1.25,
    scale: 1,
    orbit: { radiusX: 2.4, radiusZ: 2.0, speed: 0.095, phase: 5.9, height: 0.95, floatAmp: 0.18, floatSpeed: 0.52, slope: 0.05 },
    rotation: { base: [0.1, -0.5, -0.12], spinY: 0.09, sway: 0.1 },
    delay: 0.9,
    mobile: true,
  },
  {
    id: "headphones",
    kind: "headphones",
    model: "/models/headphones.glb",
    size: 1.35,
    scale: 1,
    orbit: { radiusX: 2.7, radiusZ: 2.1, speed: 0.088, phase: 2.7, height: 1.35, floatAmp: 0.13, floatSpeed: 0.4, slope: -0.06 },
    rotation: { base: [0.05, 0.4, 0], spinY: 0.05, sway: 0.07 },
    delay: 1.1,
    mobile: true,
  },
  {
    id: "earbuds",
    kind: "earbuds",
    model: "/models/earbuds.glb",
    size: 0.95,
    scale: 1,
    orbit: { radiusX: 2.0, radiusZ: 1.75, speed: 0.105, phase: 4.4, height: 1.85, floatAmp: 0.2, floatSpeed: 0.6, slope: 0.03 },
    rotation: { base: [0.3, 0.2, 0.15], spinY: 0.1, sway: 0.14 },
    delay: 1.3,
    mobile: true,
  },
  {
    id: "mouse",
    kind: "mouse",
    model: "/models/mouse.glb",
    size: 0.95,
    scale: 1,
    orbit: { radiusX: 2.5, radiusZ: 2.3, speed: 0.09, phase: 0.1, height: -1.25, floatAmp: 0.14, floatSpeed: 0.47, slope: -0.03 },
    rotation: { base: [0.2, 0.9, 0], spinY: 0.07, sway: 0.1 },
    delay: 1.5,
    mobile: false,
  },
  {
    id: "watch",
    kind: "watch",
    model: "/models/watch.glb",
    size: 1.0,
    scale: 1,
    orbit: { radiusX: 2.1, radiusZ: 1.8, speed: 0.1, phase: 3.2, height: -0.85, floatAmp: 0.17, floatSpeed: 0.55, slope: 0.05 },
    rotation: { base: [-0.1, -0.4, 0.2], spinY: 0.08, sway: 0.12 },
    delay: 1.7,
    mobile: true,
  },
  {
    id: "controller",
    kind: "controller",
    model: "/models/controller.glb",
    size: 1.15,
    scale: 1,
    orbit: { radiusX: 2.6, radiusZ: 2.2, speed: 0.085, phase: 1.2, height: -0.4, floatAmp: 0.16, floatSpeed: 0.44, slope: 0.04 },
    rotation: { base: [1.0, 0.1, 0.1], spinY: 0.06, sway: 0.1 },
    delay: 1.9,
    mobile: false,
  },
];

export const CART_CONFIG = {
  /** Path of the real cart model. Falls back to the built-in 3D cart if the file is missing. */
  model: "/models/cart.glb" as string | null,
  /** Height of the cart in world units. */
  size: 2.5,
  /** Resting rotation. The cart never spins; it only tilts a little towards the mouse. */
  baseRotationY: -0.55,
  /** Slow "breathing" scale pulse. 0.015 = ±1.5%. */
  breathe: 0.015,
  /** Gentle float. */
  floatAmp: 0.08,
  /** Show a few small products inside the cart, as if just added. */
  showItems: true,
};

export const SCENE_CONFIG = {
  background: "#05070D",
  fogNear: 10,
  fogFar: 21,
  camera: { position: [0, 0.6, 10.5] as [number, number, number], fov: 38 },
  /** Camera drift. Tiny on purpose: this is "alive", not "moving". */
  cameraDrift: { x: 0.3, y: 0.14, speed: 0.07 },
  /** How far the mouse shifts things. Near objects move more than far ones. */
  parallax: { x: 0.5, y: 0.32, camera: 0.18 },
  /** How far products drift outward as the hero scrolls out (0 = not at all). */
  scrollOutward: 0.55,
  /** How the scene reacts to the BUY NOW button. */
  hover: { outward: 0.07, cartForward: 0.5, cartScale: 0.04 },
  click: { pull: 0.3, durationMs: 900, navigateAfterMs: 650 },
  /** Product orbit radius multiplier on phones (smaller orbit so it fits). */
  mobileRadius: 0.62,
  /** Pixel-ratio caps: crisp on desktop, cheap on phones. */
  dpr: { desktop: [1, 2] as [number, number], mobile: [1, 1.5] as [number, number] },
  /** Used when prefers-reduced-motion is on: the products freeze at this time into a fixed composition. */
  staticTime: 14,
};
