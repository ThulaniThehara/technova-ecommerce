import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import { type Group, MathUtils } from "three";
import { type ProductConfig, SCENE_CONFIG } from "./hero.config";
import type { SceneControls } from "./controls";
import { cartAvoidance, easeOutCubic, orbitPoint, pullEnvelope } from "./motion";
import ProductModel from "./ProductModel";
import { PLACEHOLDERS } from "./models/registry";

const { damp, clamp } = MathUtils;

/** How far (radians, about 50 degrees) a product swings left/right of its resting yaw. */
const YAW_SWING = 0.9;

/**
 * One product drifting along its own orbit. All numbers come from its ProductConfig.
 * Every frame it computes where it SHOULD be, then eases towards that point (damp), so nothing
 * ever jumps, even when the pointer, scroll or the BUY NOW button changes the target.
 */
export default function FloatingProduct({ config, controls }: { config: ProductConfig; controls: RefObject<SceneControls> }) {
  const ref = useRef<Group>(null);
  const hover = useRef(0);
  const placed = useRef(false);

  useFrame((state, delta) => {
    const group = ref.current;
    const c = controls.current;
    if (!group || !c) return;

    const reduced = c.reducedMotion;
    const t = reduced ? SCENE_CONFIG.staticTime : state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05); // a stalled tab must not cause a huge leap on return
    const lambda = reduced ? 1000 : 6; // reduced motion: snap, there is no animation loop to ease with

    hover.current = damp(hover.current, c.hover, reduced ? 1000 : 4, dt);
    const pull = reduced ? 0 : pullEnvelope(c.pullStartedAt, performance.now(), SCENE_CONFIG.click.durationMs);

    // 1. Where the orbit says we are
    const p = orbitPoint(config.orbit, t, c.mobile ? SCENE_CONFIG.mobileRadius : 1);
    p.y += cartAvoidance(p, config.orbit.height >= 0 ? 1 : -1, c.mobile ? 0.8 : 1);

    // 2. Scroll / hover push products outward, a click pulls them towards the cart
    const outward =
      1 + c.scroll * SCENE_CONFIG.scrollOutward + hover.current * SCENE_CONFIG.hover.outward - pull * SCENE_CONFIG.click.pull;
    p.x *= outward;
    p.z *= outward;
    p.y *= 1 + c.scroll * 0.25 - pull * 0.2;

    // 3. Mouse parallax: nearer products (larger z) travel further than distant ones
    const nearness = clamp((p.z + 4) / 8, 0.1, 1.2);
    p.x += -c.pointer.x * SCENE_CONFIG.parallax.x * nearness;
    p.y += -c.pointer.y * SCENE_CONFIG.parallax.y * nearness;

    // 4. Ease towards the target. The very first frame snaps so products don't fly in from the origin.
    if (!placed.current) {
      group.position.set(p.x, p.y, p.z);
      placed.current = true;
    } else {
      group.position.x = damp(group.position.x, p.x, lambda, dt);
      group.position.y = damp(group.position.y, p.y, lambda, dt);
      group.position.z = damp(group.position.z, p.z, lambda, dt);
    }

    // 5. A slow swing to either side and a gentle rocking. Swinging (rather than spinning
    //    round and round) keeps each device mostly facing the viewer, so it never shows up as a
    //    thin edge-on sliver, and the loop stays seamless because it is a pure sine of time.
    const r = config.rotation;
    const phase = config.orbit.phase;
    group.rotation.set(
      r.base[0] + Math.sin(t * 0.21 + phase) * r.sway,
      r.base[1] + Math.sin(t * r.spinY * 3 + phase) * YAW_SWING,
      r.base[2] + Math.sin(t * 0.17 + phase * 1.3) * r.sway * 0.6,
    );

    // 6. Staggered entrance: each product eases in after its own delay
    const appear = reduced ? 1 : easeOutCubic((state.clock.elapsedTime - config.delay) / 1.4);
    group.scale.setScalar(Math.max(appear * config.scale, 0.0001));
  });

  return (
    <group ref={ref} scale={0.0001}>
      <ProductModel model={config.model} size={config.size} Placeholder={PLACEHOLDERS[config.kind]} />
    </group>
  );
}
