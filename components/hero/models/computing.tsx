import { RoundedBox } from "@react-three/drei";
import { mat } from "./materials";

/*
 * Placeholder models. Each is built to fit in roughly a 1-unit box, because the scene scales
 * every product to its configured `size`. They are stand-ins for real GLB files
 * (see hero.config.ts): swap the file into /public/models and these are no longer used.
 */

const HALF_PI = Math.PI / 2;

export function Laptop() {
  return (
    <group>
      {/* Aluminium base with a recessed keyboard deck and a trackpad */}
      <RoundedBox args={[1, 0.04, 0.68]} radius={0.016} smoothness={4} material={mat.aluminium} />
      <mesh position={[0, 0.0212, -0.1]} rotation={[-HALF_PI, 0, 0]} material={mat.keys}>
        <planeGeometry args={[0.86, 0.3]} />
      </mesh>
      <mesh position={[0, 0.0212, 0.2]} rotation={[-HALF_PI, 0, 0]}>
        <planeGeometry args={[0.32, 0.19]} />
        <meshStandardMaterial color="#aab0bb" metalness={1} roughness={0.18} />
      </mesh>

      {/* Lid, hinged at the back edge and opened a little past vertical */}
      <group position={[0, 0.022, -0.335]} rotation={[-0.3, 0, 0]}>
        <RoundedBox args={[1, 0.66, 0.026]} radius={0.014} smoothness={4} position={[0, 0.33, 0]} material={mat.aluminium} />
        <mesh position={[0, 0.33, 0.0136]} material={mat.glass}>
          <planeGeometry args={[0.97, 0.63]} />
        </mesh>
        <mesh position={[0, 0.332, 0.0139]} material={mat.screen}>
          <planeGeometry args={[0.93, 0.585]} />
        </mesh>
      </group>
    </group>
  );
}

export function Tablet() {
  return (
    <group>
      <RoundedBox args={[1, 0.72, 0.04]} radius={0.05} smoothness={6} material={mat.aluminium} />
      <mesh position={[0, 0, 0.0206]} material={mat.glass}>
        <planeGeometry args={[0.96, 0.68]} />
      </mesh>
      <mesh position={[0, 0, 0.0209]} material={mat.screen}>
        <planeGeometry args={[0.9, 0.62]} />
      </mesh>
      {/* Front camera dot */}
      <mesh position={[0, 0.327, 0.0211]} rotation={[HALF_PI, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.002, 16]} />
        <meshStandardMaterial color="#222a38" />
      </mesh>
    </group>
  );
}

export function Keyboard() {
  return (
    <group>
      <RoundedBox args={[1, 0.035, 0.36]} radius={0.016} smoothness={4} material={mat.aluminium} />
      <mesh position={[0, 0.0182, 0]} rotation={[-HALF_PI, 0, 0]} material={mat.keys}>
        <planeGeometry args={[0.96, 0.32]} />
      </mesh>
    </group>
  );
}
