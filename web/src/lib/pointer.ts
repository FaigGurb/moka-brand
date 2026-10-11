"use client";

/**
 * One shared pointer for every 3D scene: mouse on desktop, finger on phones (touchmove keeps
 * firing while the page scrolls, unlike pointer events). Canvases can be pointer-events: none.
 */
export const pointer = {
  x: -9999,
  y: -9999,
  /** smoothed velocity in px per second */
  vx: 0,
  vy: 0,
  /** performance.now() of the last movement */
  moved: 0,
  /** performance.now() of the last tap / click (beans burst away) */
  tapped: 0,
  touch: false,
};

let installed = false;
let lastT = 0;

function move(x: number, y: number, touch: boolean) {
  const now = performance.now();
  const dt = Math.max(8, now - lastT) / 1000;
  if (pointer.x > -9000 && now - pointer.moved < 200) {
    pointer.vx += ((x - pointer.x) / dt - pointer.vx) * 0.35;
    pointer.vy += ((y - pointer.y) / dt - pointer.vy) * 0.35;
  } else {
    pointer.vx = 0;
    pointer.vy = 0;
  }
  pointer.x = x;
  pointer.y = y;
  pointer.moved = now;
  pointer.touch = touch;
  lastT = now;
}

export function installPointer() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const opts = { passive: true } as const;
  window.addEventListener("pointermove", (e) => e.pointerType === "mouse" && move(e.clientX, e.clientY, false), opts);
  window.addEventListener("pointerdown", (e) => {
    move(e.clientX, e.clientY, e.pointerType !== "mouse");
    pointer.tapped = performance.now();
  }, opts);
  window.addEventListener("touchstart", (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY, true), opts);
  window.addEventListener("touchmove", (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY, true), opts);
  document.addEventListener("mouseleave", () => {
    pointer.x = pointer.y = -9999;
  });
}

/** Pointer in normalised device coordinates of an element (-1..1, y up), or null when idle/away. */
export function pointerNDC(el: Element, idleMs = 2500) {
  if (pointer.x < -9000 || performance.now() - pointer.moved > idleMs) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  return {
    x: ((pointer.x - r.left) / r.width) * 2 - 1,
    y: -(((pointer.y - r.top) / r.height) * 2 - 1),
    // velocity in NDC per second
    vx: (pointer.vx / r.width) * 2,
    vy: (-pointer.vy / r.height) * 2,
  };
}
