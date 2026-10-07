/**
 * Shown while the 3D code and models load, instead of a blank rectangle: a soft pulsing glow
 * with a shimmering placeholder, in the same colours as the finished scene.
 */
export default function SceneLoader({ visible }: { visible: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading 3D showcase"
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex h-56 w-56 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.35),rgba(22,104,240,0.15)_45%,transparent_70%)] blur-xl" />
        <span className="absolute h-28 w-28 animate-ping rounded-full border border-cyan-300/30 [animation-duration:2.4s]" />
        <span className="relative h-16 w-16 animate-pulse rounded-2xl border border-white/10 bg-white/5 backdrop-blur" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
