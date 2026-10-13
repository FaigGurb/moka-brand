"use client";

import { useEffect, useRef } from "react";
import { perfTier } from "@/lib/perf";
import { createFx, type FxSpec } from "./fx";

/**
 * One effect over a region of a photo. The parent frame has the photo's own aspect ratio, so the
 * region (fractions of the image) lines up with the picture at any crop. Draws only while on
 * screen and while `isActive()` says its shot is showing; nothing for reduced motion.
 */
export function FxCanvas({ spec, isActive }: { spec: FxSpec; isActive?: () => boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(isActive);
  activeRef.current = isActive;

  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const lite = perfTier() === "low";
    const fx = createFx(spec, lite);
    let w = 1;
    let h = 1;
    const size = () => {
      const k = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
      w = c.width = Math.max(1, Math.round(c.clientWidth * k));
      h = c.height = Math.max(1, Math.round(c.clientHeight * k));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    let raf = 0;
    let last = 0;
    let shown = true;
    let visible = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      const on = activeRef.current ? activeRef.current() : true;
      if (!on) {
        if (shown) {
          g.clearRect(0, 0, w, h);
          shown = false;
        }
        return;
      }
      shown = true;
      fx.step(g, w, h, dt, (now - t0) / 1000);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = 0;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(c);
    return () => {
      visible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [spec]);

  const [x, y, rw, rh] = spec.region;
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute motion-reduce:hidden"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${rw * 100}%`, height: `${rh * 100}%` }}
    />
  );
}
