import { mat } from "./materials";

const HALF_PI = Math.PI / 2;

export function Headphones() {
  return (
    <group>
      {/* Headband arc with a soft padded underside */}
      <mesh rotation={[0, 0, 0]} material={mat.plasticBlack}>
        <torusGeometry args={[0.42, 0.034, 20, 64, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[0, 0, 0]} material={mat.rubber}>
        <torusGeometry args={[0.396, 0.024, 16, 48, Math.PI * 0.55]} />
      </mesh>

      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * 0.44, -0.02, 0]}>
          {/* Metal slider joining band and cup */}
          <mesh position={[0, 0.07, 0]} material={mat.aluminium}>
            <cylinderGeometry args={[0.014, 0.014, 0.18, 14]} />
          </mesh>
          {/* Ear cup: matte shell, aluminium cap, and a soft cushion facing the head */}
          <mesh rotation={[0, 0, HALF_PI]} material={mat.plasticBlack}>
            <cylinderGeometry args={[0.2, 0.2, 0.14, 40]} />
          </mesh>
          <mesh position={[side * 0.075, 0, 0]} rotation={[0, 0, HALF_PI]} material={mat.aluminium}>
            <cylinderGeometry args={[0.15, 0.15, 0.012, 40]} />
          </mesh>
          <mesh position={[side * -0.085, 0, 0]} rotation={[0, HALF_PI, 0]} material={mat.rubber}>
            <torusGeometry args={[0.15, 0.058, 20, 48]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Speaker() {
  return (
    <group>
      {/* Fabric-wrapped barrel lying on its side */}
      <mesh rotation={[0, 0, HALF_PI]} material={mat.fabric}>
        <cylinderGeometry args={[0.22, 0.22, 0.72, 48]} />
      </mesh>
      {/* Aluminium end caps */}
      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * 0.37, 0, 0]} rotation={[0, 0, HALF_PI]}>
          <mesh material={mat.aluminium}>
            <cylinderGeometry args={[0.228, 0.228, 0.05, 48]} />
          </mesh>
          <mesh position={[0, side * 0.026, 0]} material={mat.rubber}>
            <cylinderGeometry args={[0.15, 0.15, 0.006, 40]} />
          </mesh>
        </group>
      ))}
      {/* Carry loop */}
      <mesh position={[0.4, 0.09, 0]} rotation={[0, HALF_PI, 0]} material={mat.rubber}>
        <torusGeometry args={[0.07, 0.014, 12, 28, Math.PI * 1.6]} />
      </mesh>
      {/* Control buttons on top, with a tiny status light */}
      {[-0.1, 0, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.221, 0]} material={mat.glass}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 20]} />
        </mesh>
      ))}
      <mesh position={[0.2, 0.221, 0]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" toneMapped={false} />
      </mesh>
    </group>
  );
}
