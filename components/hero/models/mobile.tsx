import { RoundedBox } from "@react-three/drei";
import { mat } from "./materials";

const HALF_PI = Math.PI / 2;

export function Phone() {
  return (
    <group>
      {/* Titanium frame */}
      <RoundedBox args={[0.48, 1, 0.056]} radius={0.075} smoothness={6} material={mat.titanium} />
      {/* Front glass + display + dynamic-island pill */}
      <mesh position={[0, 0, 0.0285]} material={mat.glass}>
        <planeGeometry args={[0.452, 0.972]} />
      </mesh>
      <mesh position={[0, 0, 0.0288]} material={mat.screen}>
        <planeGeometry args={[0.43, 0.95]} />
      </mesh>
      <RoundedBox args={[0.12, 0.034, 0.002]} radius={0.017} smoothness={4} position={[0, 0.43, 0.0296]} material={mat.glass} />

      {/* Rear camera plateau with three lenses */}
      <group position={[-0.1, 0.34, -0.03]}>
        <RoundedBox args={[0.24, 0.24, 0.016]} radius={0.05} smoothness={5} material={mat.titanium} />
        {(
          [
            [-0.052, 0.052],
            [0.052, 0.052],
            [0, -0.05],
          ] as const
        ).map(([x, y]) => (
          <group key={`${x}-${y}`} position={[x, y, -0.012]} rotation={[HALF_PI, 0, 0]}>
            <mesh material={mat.aluminium}>
              <cylinderGeometry args={[0.046, 0.046, 0.014, 28]} />
            </mesh>
            <mesh position={[0, -0.0075, 0]} material={mat.glass}>
              <cylinderGeometry args={[0.032, 0.032, 0.003, 28]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Side buttons */}
      <mesh position={[0.243, 0.22, 0]} material={mat.titanium}>
        <boxGeometry args={[0.012, 0.13, 0.026]} />
      </mesh>
    </group>
  );
}

export function Watch() {
  return (
    <group scale={0.8}>
      {/* Silicone strap, curving away behind the case */}
      <RoundedBox args={[0.34, 0.6, 0.034]} radius={0.016} smoothness={3} position={[0, 0.5, -0.045]} rotation={[-0.32, 0, 0]} material={mat.silicone} />
      <RoundedBox args={[0.34, 0.6, 0.034]} radius={0.016} smoothness={3} position={[0, -0.5, -0.045]} rotation={[0.32, 0, 0]} material={mat.silicone} />

      {/* Aluminium case, glass, display and digital crown */}
      <RoundedBox args={[0.44, 0.52, 0.1]} radius={0.115} smoothness={8} material={mat.aluminium} />
      <mesh position={[0, 0, 0.051]} material={mat.glass}>
        <planeGeometry args={[0.4, 0.48]} />
      </mesh>
      <mesh position={[0, 0, 0.0514]} material={mat.screen}>
        <planeGeometry args={[0.36, 0.44]} />
      </mesh>
      <mesh position={[0.235, 0.09, 0]} rotation={[0, 0, HALF_PI]} material={mat.aluminium}>
        <cylinderGeometry args={[0.034, 0.034, 0.05, 20]} />
      </mesh>
      <mesh position={[0.226, -0.08, 0]} material={mat.aluminium}>
        <boxGeometry args={[0.016, 0.1, 0.03]} />
      </mesh>
    </group>
  );
}

export function Earbuds() {
  const bud = (side: 1 | -1) => (
    <group position={[side * 0.27, 0.27, 0.04]} rotation={[0.2, 0, side * -0.35]}>
      <mesh material={mat.plasticWhite} scale={[1, 1.05, 0.95]}>
        <sphereGeometry args={[0.1, 32, 24]} />
      </mesh>
      <mesh position={[0, -0.16, -0.01]} material={mat.plasticWhite}>
        <capsuleGeometry args={[0.032, 0.2, 8, 16]} />
      </mesh>
      <mesh position={[0, -0.018, 0.092]} material={mat.glass}>
        <circleGeometry args={[0.022, 16]} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Charging case with its lid seam */}
      <RoundedBox args={[0.58, 0.26, 0.3]} radius={0.115} smoothness={8} position={[0, -0.08, 0]} material={mat.plasticWhite} />
      <mesh position={[0, -0.005, 0]} material={mat.glass}>
        <boxGeometry args={[0.583, 0.006, 0.303]} />
      </mesh>
      <mesh position={[0, -0.12, 0.151]} material={mat.glass}>
        <circleGeometry args={[0.014, 16]} />
      </mesh>
      {bud(1)}
      {bud(-1)}
    </group>
  );
}
