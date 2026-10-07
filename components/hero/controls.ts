/**
 * State shared between the DOM (pointer, scroll, the BUY NOW button) and the 3D scene.
 *
 * It is a plain class held in a ref, not React state, on purpose: pointer and scroll events fire
 * dozens of times a second, and routing them through React state would re-render the tree on
 * every event. The scene reads these fields once per frame inside useFrame instead, and the DOM
 * changes them only through the methods below.
 */
export class SceneControls {
  /** Normalised pointer position in -1..1 (x right, y up), relative to the hero panel. */
  pointer = { x: 0, y: 0 };
  /** 0 at the top of the page, 1 when the hero has scrolled fully out of view. */
  scroll = 0;
  /** 1 while BUY NOW is hovered/focused, else 0 (the scene eases towards it). */
  hover = 0;
  /** performance.now() of the last BUY NOW click, or 0. Drives the short "pull-in" animation. */
  pullStartedAt = 0;
  /** prefers-reduced-motion: freeze the orbit, keep only small hover effects. */
  reducedMotion = false;
  /** Phone-sized screen: smaller orbit and fewer products. */
  mobile = false;

  private renderRequest: (() => void) | null = null;

  setFlags(reducedMotion: boolean, mobile: boolean) {
    this.reducedMotion = reducedMotion;
    this.mobile = mobile;
    this.requestRender();
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.requestRender();
  }

  setScroll(progress: number) {
    this.scroll = progress;
    this.requestRender();
  }

  setHover(value: 0 | 1) {
    this.hover = value;
    this.requestRender();
  }

  /** Starts the "pull-in" animation. */
  triggerPull() {
    this.pullStartedAt = performance.now();
    this.requestRender();
  }

  /**
   * The scene registers its `invalidate` here so DOM events can wake the render loop when it is
   * paused (reduced motion renders on demand). Returns an unregister function.
   */
  registerRenderRequest(fn: () => void) {
    this.renderRequest = fn;
    return () => {
      if (this.renderRequest === fn) this.renderRequest = null;
    };
  }

  requestRender() {
    this.renderRequest?.();
  }
}

export const createControls = () => new SceneControls();
