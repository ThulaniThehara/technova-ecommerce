import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";

/**
 * Shared materials and procedural textures for the placeholder product models.
 * Created once (module-level) and reused by every model, so 10 products don't mean 100 materials.
 * This module is only ever imported by the client-only 3D scene, so using `document` is safe.
 */

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!, width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A lit-up display: deep navy to brand blue to cyan, with a soft glow and abstract UI blocks.
const screenTexture = canvasTexture(512, 512, (ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#0a1a3d");
  bg.addColorStop(0.55, "#1456d6");
  bg.addColorStop(1, "#22d3ee");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.72, h * 0.25, 10, w * 0.72, h * 0.25, w * 0.6);
  glow.addColorStop(0, "rgba(255,255,255,0.35)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  for (const [x, y, bw, bh] of [
    [48, 56, 150, 22],
    [48, 96, 230, 14],
    [48, 128, 190, 14],
    [48, 340, 190, 100],
    [262, 340, 202, 100],
  ]) {
    roundRect(ctx, x, y, bw, bh, 10);
    ctx.fill();
  }
});

// Keyboard top-down: dark chassis with rows of rounded keycaps and a long space bar.
const keysTexture = canvasTexture(1024, 400, (ctx, w, h) => {
  ctx.fillStyle = "#10151f";
  ctx.fillRect(0, 0, w, h);
  const rows = [14, 14, 13, 12, 10];
  const gap = 8;
  const rowH = (h - gap * (rows.length + 1)) / rows.length;
  rows.forEach((count, row) => {
    const y = gap + row * (rowH + gap);
    const isLast = row === rows.length - 1;
    const unit = (w - gap * (count + 1)) / count;
    for (let i = 0; i < count; i++) {
      const space = isLast && i === 4;
      const kw = space ? unit * 4.6 : unit;
      const x = gap + i * (unit + gap) + (isLast && i > 4 ? unit * 3.6 : 0);
      if (x + kw > w) continue;
      const g = ctx.createLinearGradient(0, y, 0, y + rowH);
      g.addColorStop(0, "#3a4252");
      g.addColorStop(1, "#242a36");
      ctx.fillStyle = g;
      roundRect(ctx, x, y, kw, rowH, 9);
      ctx.fill();
    }
  });
});

// Soft radial glow used behind the cart (additive blending makes it light, not paint).
const glowTexture = canvasTexture(256, 256, (ctx, w, h) => {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, "rgba(56,189,248,0.85)");
  g.addColorStop(0.35, "rgba(37,99,235,0.35)");
  g.addColorStop(1, "rgba(5,7,13,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
});

export const mat = {
  /** Brushed aluminium: laptops, tablets, watch, speaker caps. */
  aluminium: new MeshStandardMaterial({ color: "#c3c8d1", metalness: 1, roughness: 0.28 }),
  /** Dark graphite titanium: phone frame. */
  titanium: new MeshStandardMaterial({ color: "#5d6068", metalness: 1, roughness: 0.32 }),
  /** Black glass: bezels, camera glass. Clearcoat gives the wet reflection. */
  glass: new MeshPhysicalMaterial({ color: "#05070b", metalness: 0.2, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
  /** Glossy white plastic: earbuds, controller. */
  plasticWhite: new MeshPhysicalMaterial({ color: "#f1f3f6", metalness: 0, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  /** Matte black plastic: headphones, mouse. */
  plasticBlack: new MeshStandardMaterial({ color: "#14171d", metalness: 0.1, roughness: 0.62 }),
  /** Glossy dark plastic. */
  plasticGloss: new MeshPhysicalMaterial({ color: "#161a22", metalness: 0.1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 }),
  /** Soft-touch rubber / silicone: watch band, ear cushions, wheels. */
  rubber: new MeshStandardMaterial({ color: "#1e2430", metalness: 0, roughness: 0.9 }),
  /** Brand-blue silicone. */
  silicone: new MeshStandardMaterial({ color: "#1668f0", metalness: 0, roughness: 0.55 }),
  /** Speaker mesh fabric. */
  fabric: new MeshStandardMaterial({ color: "#1a2230", metalness: 0, roughness: 1 }),
  /** Chrome wire for the cart, with a faint cyan emissive so it glows softly in the dark. */
  chrome: new MeshStandardMaterial({ color: "#dfe6f1", metalness: 1, roughness: 0.16, emissive: new Color("#38bdf8"), emissiveIntensity: 0.12 }),
  /** Cart accent (wheel hubs, handle grip). */
  accent: new MeshStandardMaterial({ color: "#1668f0", metalness: 0.4, roughness: 0.35, emissive: new Color("#1668f0"), emissiveIntensity: 0.35 }),
  /** Lit display. Basic material = unaffected by scene lighting, so screens always glow. */
  screen: new MeshBasicMaterial({ map: screenTexture, toneMapped: false }),
  keys: new MeshBasicMaterial({ map: keysTexture, toneMapped: false }),
  glow: new MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  }),
};
