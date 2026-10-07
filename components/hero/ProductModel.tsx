import { useGLTF } from "@react-three/drei";
import { type ComponentType, Suspense, useEffect, useMemo, useState } from "react";
import { Box3, Vector3 } from "three";

/**
 * One slot that shows EITHER a real GLB model OR the built-in placeholder:
 *   - model path set AND the file exists in /public  -> the GLB, auto-centred and auto-sized
 *   - otherwise                                      -> the placeholder component
 * So the scene always renders, and adding a GLB later needs no code change.
 */

// One HEAD request per URL for the whole session; a missing file is a quiet 404, not a thrown error.
const existsCache = new Map<string, Promise<boolean>>();

function modelExists(url: string): Promise<boolean> {
  let pending = existsCache.get(url);
  if (!pending) {
    pending = fetch(url, { method: "HEAD" })
      .then((res) => res.ok && !(res.headers.get("content-type") ?? "").includes("text/html"))
      .catch(() => false);
    existsCache.set(url, pending);
  }
  return pending;
}

function useModelExists(url: string | null): boolean | null {
  const [exists, setExists] = useState<boolean | null>(url ? null : false);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    modelExists(url).then((ok) => {
      if (!cancelled) setExists(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return exists;
}

function GlbModel({ url, size }: { url: string; size: number }) {
  const { scene } = useGLTF(url);

  // Clone so the same file can be used twice, centre it on its bounding box, and scale it so
  // its largest dimension equals `size`, whatever units the artist exported in.
  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new Box3().setFromObject(clone);
    const dims = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    clone.position.set(-centre.x, -centre.y, -centre.z);
    return { object: clone, scale: size / (Math.max(dims.x, dims.y, dims.z) || 1) };
  }, [scene, size]);

  return (
    <group scale={scale}>
      <primitive object={object} />
    </group>
  );
}

type Props = {
  /** Path of the GLB in /public, or null to always use the placeholder. */
  model: string | null;
  /** Largest dimension in world units. */
  size: number;
  Placeholder: ComponentType;
  /** Largest dimension of the placeholder as authored (most are 1). */
  placeholderSize?: number;
};

export default function ProductModel({ model, size, Placeholder, placeholderSize = 1 }: Props) {
  const exists = useModelExists(model);

  if (exists === null) return null; // still checking; the product is fading in anyway
  if (exists && model) {
    return (
      <Suspense fallback={null}>
        <GlbModel url={model} size={size} />
      </Suspense>
    );
  }
  return (
    <group scale={size / placeholderSize}>
      <Placeholder />
    </group>
  );
}
