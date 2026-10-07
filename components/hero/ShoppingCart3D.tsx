import { useFrame } from "@react-three/fiber";
import { type RefObject, useRef } from "react";
import { type Group, MathUtils } from "three";
import type { SceneControls } from "./controls";
import { CART_CONFIG, SCENE_CONFIG } from "./hero.config";
import { CART_NATURAL_SIZE, CartPlaceholder } from "./models/Cart";
import { mat } from "./models/materials";
import { pullEnvelope } from "./motion";
import ProductModel from "./ProductModel";

const { damp } = MathUtils;

// Defined at module level so React sees one stable component type (an inline arrow would remount).
const CartModel = () => <CartPlaceholder showItems={CART_CONFIG.showItems} />;

/**
 * The hero's focal point. It stays put in the centre: it floats a little, "breathes", leans
 * slightly towards the mouse, and reacts to BUY NOW (moves forward on hover, pulses on click).
 * It never spins.
 */
export default function ShoppingCart3D({ controls }: { controls: RefObject<SceneControls> }) {
  const group = useRef<Group>(null);
  const hover = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    const c = controls.current;
    if (!g || !c) return;

    const reduced = c.reducedMotion;
    const t = reduced ? SCENE_CONFIG.staticTime : state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const lambda = reduced ? 1000 : 5;

    hover.current = damp(hover.current, c.hover, reduced ? 1000 : 4, dt);
    const pull = reduced ? 0 : pullEnvelope(c.pullStartedAt, performance.now(), SCENE_CONFIG.click.durationMs);

    // Float + forward on hover
    const floatY = reduced ? 0 : Math.sin(t * 0.7) * CART_CONFIG.floatAmp;
    g.position.y = damp(g.position.y, floatY - c.scroll * 0.3, lambda, dt);
    g.position.z = damp(g.position.z, hover.current * SCENE_CONFIG.hover.cartForward + pull * 0.35, lambda, dt);

    // Lean towards the pointer (small), never a continuous spin
    g.rotation.y = damp(g.rotation.y, CART_CONFIG.baseRotationY + c.pointer.x * 0.28, lambda, dt);
    g.rotation.x = damp(g.rotation.x, -c.pointer.y * 0.12, lambda, dt);

    // Breathing + hover/click emphasis + shrink as the hero scrolls away
    const breathe = reduced ? 0 : Math.sin(t * 0.9) * CART_CONFIG.breathe;
    const target = (1 + breathe + hover.current * SCENE_CONFIG.hover.cartScale + pull * 0.06) * (1 - c.scroll * 0.22);
    g.scale.setScalar(damp(g.scale.x, target, lambda, dt));
  });

  return (
    <group>
      {/* Soft light bloom behind the cart so it reads as the centre of the scene */}
      <mesh position={[0, 0, -1.4]} scale={[9, 9, 1]} material={mat.glow} renderOrder={-1}>
        <planeGeometry />
      </mesh>

      <group ref={group}>
        <ProductModel
          model={CART_CONFIG.model}
          size={CART_CONFIG.size}
          placeholderSize={CART_NATURAL_SIZE}
          Placeholder={CartModel}
        />
      </group>
    </group>
  );
}
