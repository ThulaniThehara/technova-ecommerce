import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useRef } from "react";
import { MathUtils } from "three";
import type { SceneControls } from "./controls";
import { SCENE_CONFIG } from "./hero.config";
import ProductOrbit from "./ProductOrbit";
import ShoppingCart3D from "./ShoppingCart3D";

const { damp } = MathUtils;

/** A barely-there camera drift plus a tiny pointer parallax: alive, not distracting. */
function CameraRig({ controls }: { controls: RefObject<SceneControls> }) {
  useFrame((state, delta) => {
    const c = controls.current;
    if (!c) return;
    const { camera, clock } = state;
    const d = SCENE_CONFIG.cameraDrift;
    const t = c.reducedMotion ? 0 : clock.elapsedTime * d.speed;
    const dt = Math.min(delta, 0.05);
    const lambda = c.reducedMotion ? 1000 : 3;

    camera.position.x = damp(camera.position.x, Math.sin(t) * d.x + c.pointer.x * SCENE_CONFIG.parallax.camera, lambda, dt);
    camera.position.y = damp(camera.position.y, SCENE_CONFIG.camera.position[1] + Math.cos(t * 0.8) * d.y - c.pointer.y * 0.1, lambda, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Tells the DOM overlay (loader) when the first frame has actually been drawn. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/** Lets DOM events (hover, click) request a render while the loop is paused for reduced motion. */
function InvalidateBridge({ controls }: { controls: RefObject<SceneControls> }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => controls.current?.registerRenderRequest(invalidate), [controls, invalidate]);
  return null;
}

type Props = {
  controls: RefObject<SceneControls>;
  /** False while the hero is off-screen: the render loop pauses so it costs nothing. */
  active: boolean;
  reducedMotion: boolean;
  mobile: boolean;
  onReady: () => void;
};

export default function ElectronicsScene({ controls, active, reducedMotion, mobile, onReady }: Props) {
  const { camera, background, fogNear, fogFar, dpr } = SCENE_CONFIG;

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
      dpr={mobile ? dpr.mobile : dpr.desktop}
      camera={{ position: camera.position, fov: camera.fov, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.15;
      }}
    >
      {/* Distant products fade towards the background: less contrast, reads as depth */}
      <fog attach="fog" args={[background, fogNear, fogFar]} />

      {/* Cinematic studio lighting: soft key, cool rim, blue fill. Reflections come from the Environment below. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-6, 3, -4]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[0, 0.5, 3]} intensity={14} distance={9} color="#1668f0" />

      {/* Generated in code (no external HDR download): gives metal and glass something to reflect */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 5, 5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#38bdf8" position={[-6, 1, -3]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#8b5cf6" position={[6, -1, -4]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#ffffff" position={[0, 1, -6]} scale={5} />
      </Environment>

      <Suspense fallback={null}>
        <ShoppingCart3D controls={controls} />
        <ProductOrbit controls={controls} mobile={mobile} />
      </Suspense>

      {/* Soft contact shadow under the scene; cheaper on phones */}
      <ContactShadows position={[0, -2.5, 0]} opacity={0.35} scale={14} blur={2.6} far={4} resolution={mobile ? 256 : 512} color="#000000" />

      <CameraRig controls={controls} />
      <InvalidateBridge controls={controls} />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}
