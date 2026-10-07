import type { RefObject } from "react";
import type { SceneControls } from "./controls";
import FloatingProduct from "./FloatingProduct";
import { PRODUCTS } from "./hero.config";

/**
 * Renders every product in the orbit. On phones only the products flagged `mobile` in
 * hero.config.ts are rendered (about 5), which is the main performance saving there.
 */
export default function ProductOrbit({ controls, mobile }: { controls: RefObject<SceneControls>; mobile: boolean }) {
  const products = mobile ? PRODUCTS.filter((p) => p.mobile) : PRODUCTS;
  return (
    <group>
      {products.map((config) => (
        <FloatingProduct key={config.id} config={config} controls={controls} />
      ))}
    </group>
  );
}
