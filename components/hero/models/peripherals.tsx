import { RoundedBox } from "@react-three/drei";
import { mat } from "./materials";

const HALF_PI = Math.PI / 2;

export function Mouse() {
  return (
    <group>
      {/* Ergonomic shell: a flattened, elongated ellipsoid */}
      <mesh scale={[0.52, 0.34, 0.9]} material={mat.plasticGloss}>
        <sphereGeometry args={[0.5, 48, 32]} />
      </mesh>
      {/* Seam between the two main buttons */}
      <mesh position={[0, 0.1495, -0.18]} material={mat.glass}>
        <boxGeometry args={[0.006, 0.004, 0.34]} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[0, 0.148, -0.2]} rotation={[0, 0, HALF_PI]} material={mat.aluminium}>
        <cylinderGeometry args={[0.032, 0.032, 0.06, 20]} />
      </mesh>
      {/* Subtle underglow ring so it reads against the dark scene */}
      <mesh position={[0, -0.1, 0]} rotation={[HALF_PI, 0, 0]}>
        <torusGeometry args={[0.2, 0.006, 8, 48]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Controller() {
  return (
    <group>
      {/* Central body and two angled grips */}
      <RoundedBox args={[0.72, 0.2, 0.38]} radius={0.095} smoothness={6} material={mat.plasticWhite} />
      {([1, -1] as const).map((side) => (
        <RoundedBox
          key={side}
          args={[0.25, 0.34, 0.32]}
          radius={0.115}
          smoothness={6}
          position={[side * 0.34, -0.14, 0.04]}
          rotation={[0, 0, side * 0.3]}
          material={mat.plasticWhite}
        />
      ))}

      {/* Thumbsticks: left sits high, right sits low, like a real pad */}
      {(
        [
          [-0.24, -0.02],
          [0.13, 0.1],
        ] as const
      ).map(([x, z]) => (
        <group key={x} position={[x, 0.1, z]}>
          <mesh material={mat.plasticBlack}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 28]} />
          </mesh>
          <mesh position={[0, 0.026, 0]} material={mat.rubber}>
            <cylinderGeometry args={[0.052, 0.058, 0.04, 28]} />
          </mesh>
        </group>
      ))}

      {/* D-pad */}
      <group position={[-0.14, 0.102, 0.11]}>
        <mesh material={mat.plasticBlack}>
          <boxGeometry args={[0.1, 0.016, 0.03]} />
        </mesh>
        <mesh material={mat.plasticBlack}>
          <boxGeometry args={[0.03, 0.016, 0.1]} />
        </mesh>
      </group>

      {/* Face buttons in brand colours */}
      {(
        [
          [0.24, -0.1, "#22d3ee"],
          [0.3, -0.04, "#f43f5e"],
          [0.18, -0.04, "#1668f0"],
          [0.24, 0.02, "#facc15"],
        ] as const
      ).map(([x, z, color]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.102, z]}>
          <cylinderGeometry args={[0.026, 0.026, 0.014, 20]} />
          <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* Guide button */}
      <mesh position={[0, 0.1, -0.06]} material={mat.aluminium}>
        <cylinderGeometry args={[0.032, 0.032, 0.012, 24]} />
      </mesh>
    </group>
  );
}
