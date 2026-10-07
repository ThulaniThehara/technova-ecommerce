# 3D models for the home-page hero

The hero shows built-in placeholder models until you drop real `.glb` files in this folder.
**No code change is needed**: add the file with the exact name below, reload, and it is used.
If a file is missing, that product simply keeps its placeholder.

| File | Product | Target size* |
| --- | --- | --- |
| `cart.glb` | Shopping cart (centre of the scene) | 2.5 |
| `laptop.glb` | Laptop | 2.1 |
| `phone.glb` | Smartphone | 1.25 |
| `tablet.glb` | Tablet | 1.55 |
| `headphones.glb` | Over-ear headphones | 1.35 |
| `earbuds.glb` | Wireless earbuds (+ case) | 0.95 |
| `mouse.glb` | Computer mouse | 0.95 |
| `watch.glb` | Smartwatch | 1.0 |
| `keyboard.glb` | Keyboard | 1.8 |
| `controller.glb` | Gaming controller | 1.15 |
| `speaker.glb` | Portable speaker | 1.15 |

\*Models are **auto-centred and auto-scaled** so their largest dimension matches the target size,
so it does not matter what units they were exported in. Change the sizes, orbit radius, speed,
rotation, depth and animation delay of every product in `components/hero/hero.config.ts`.

## Getting good models

- Export as **GLB** (binary glTF 2.0) with **PBR materials** (base colour, metallic, roughness).
- Keep each file small: aim for **under 1-2 MB** and **under ~50k triangles**. Compress textures
  (WebP/KTX2 or JPEG at 1024px) and, if you can, apply **Draco** compression
  (`npx gltf-transform optimize in.glb out.glb --compress draco`).
- Orient models upright, facing +Z (towards the viewer), with the origin near the centre.
- Where to find them: Sketchfab (filter **Downloadable**), Poly Pizza, or Kenney. **Check each
  model's licence** (CC0 / CC-BY is fine for a portfolio; CC-BY needs a credit) and never use
  models you are not allowed to redistribute.
