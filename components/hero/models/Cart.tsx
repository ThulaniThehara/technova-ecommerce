import { RoundedBox } from "@react-three/drei";
import { type Material, Quaternion, Vector3 } from "three";
import { useMemo } from "react";
import { mat } from "./materials";

type V3 = [number, number, number];

/** A cylinder between two points: the building block of the wire cart. */
function Bar({ a, b, r = 0.013, material = mat.chrome }: { a: V3; b: V3; r?: number; material?: Material }) {
  const { position, quaternion, length } = useMemo(() => {
    const from = new Vector3(...a);
    const to = new Vector3(...b);
    const dir = to.clone().sub(from);
    const length = dir.length();
    return {
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize()),
      length,
    };
  }, [a, b]);

  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[r, r, length, 10]} />
    </mesh>
  );
}

const lerp3 = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// The basket is wider at the top than the bottom, like a real trolley.
const TOP: V3[] = [
  [-0.78, 0.5, -0.5],
  [0.78, 0.5, -0.5],
  [0.78, 0.5, 0.5],
  [-0.78, 0.5, 0.5],
];
const BOTTOM: V3[] = [
  [-0.58, -0.05, -0.38],
  [0.58, -0.05, -0.38],
  [0.58, -0.05, 0.38],
  [-0.58, -0.05, 0.38],
];

/** Natural largest dimension of this model, used by ProductModel to scale it to its configured size. */
export const CART_NATURAL_SIZE = 1.8;

export function CartPlaceholder({ showItems = true }: { showItems?: boolean }) {
  // Everything is computed once: rings and slats around the basket walls.
  const bars = useMemo(() => {
    const list: { a: V3; b: V3; r?: number }[] = [];
    const ring = (s: number) => {
      const pts = TOP.map((t, i) => lerp3(BOTTOM[i], t, s));
      pts.forEach((p, i) => list.push({ a: p, b: pts[(i + 1) % 4] }));
    };
    [0, 0.34, 0.67, 1].forEach(ring);
    // corner posts
    TOP.forEach((t, i) => list.push({ a: BOTTOM[i], b: t }));
    // wall slats
    for (let i = 0; i < 4; i++) {
      for (const s of [0.25, 0.5, 0.75]) {
        list.push({ a: lerp3(BOTTOM[i], BOTTOM[(i + 1) % 4], s), b: lerp3(TOP[i], TOP[(i + 1) % 4], s) });
      }
    }
    // floor grid
    for (const x of [-0.36, -0.12, 0.12, 0.36]) list.push({ a: [x, -0.05, -0.38], b: [x, -0.05, 0.38] });
    list.push({ a: [-0.58, -0.05, 0], b: [0.58, -0.05, 0] });
    // undercarriage rails and wheel struts
    for (const z of [-0.36, 0.36]) {
      list.push({ a: [-0.55, -0.05, z], b: [-0.45, -0.28, z] });
      list.push({ a: [0.55, -0.05, z], b: [0.55, -0.28, z] });
      list.push({ a: [-0.45, -0.28, z], b: [0.55, -0.28, z], r: 0.016 });
      list.push({ a: [0.55, -0.28, z], b: [0.55, -0.4, z] });
      list.push({ a: [-0.45, -0.28, z], b: [-0.45, -0.4, z] });
    }
    // push-handle uprights
    list.push({ a: TOP[0], b: [-1.02, 0.98, -0.5], r: 0.016 });
    list.push({ a: TOP[3], b: [-1.02, 0.98, 0.5], r: 0.016 });
    return list;
  }, []);

  return (
    <group>
      {bars.map((bar, i) => (
        <Bar key={i} {...bar} />
      ))}

      {/* Rubber hand grip */}
      <Bar a={[-1.02, 0.98, -0.5]} b={[-1.02, 0.98, 0.5]} r={0.034} material={mat.accent} />

      {/* Four wheels with glowing hubs */}
      {(
        [
          [0.55, -0.4, -0.36],
          [0.55, -0.4, 0.36],
          [-0.45, -0.4, -0.36],
          [-0.45, -0.4, 0.36],
        ] as V3[]
      ).map((p, i) => (
        <group key={i} position={p}>
          <mesh material={mat.rubber}>
            <torusGeometry args={[0.085, 0.034, 14, 28]} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={mat.accent}>
            <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
          </mesh>
        </group>
      ))}

      {/* Products "already added": a parcel and a phone leaning on the side */}
      {showItems && (
        <>
          <RoundedBox args={[0.42, 0.34, 0.36]} radius={0.04} smoothness={4} position={[0.18, 0.2, 0.02]} rotation={[0, 0.35, 0]} material={mat.accent} />
          <group position={[-0.32, 0.32, 0.08]} rotation={[0, 0.2, -0.28]}>
            <RoundedBox args={[0.22, 0.46, 0.03]} radius={0.03} smoothness={4} material={mat.titanium} />
            <mesh position={[0, 0, 0.0155]} material={mat.screen}>
              <planeGeometry args={[0.19, 0.42]} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}
