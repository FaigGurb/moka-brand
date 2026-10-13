"use client";

import { useEffect, useRef } from "react";
import { perfTier } from "@/lib/perf";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CELL = 160;

/**
 * Roasted beans falling in slow motion through the hero light. The beans are cut from the hero
 * photo itself (public/cinema/beans-sprites.webp: sharp row + defocused row), so they match its
 * lighting; depth sets size, speed, focus and brightness. Runs only while the hero is on screen.
 */
export function BeanRain({ from = 0.42, className = "" }: { from?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const lite = perfTier() === "low";
    const img = new Image();
    img.src = `${BASE}/cinema/beans-sprites.webp`;
    let ready = false;
    img.decode().then(() => (ready = true), () => {});

    let w = 1;
    let h = 1;
    let k = 1;
    const size = () => {
      k = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.75);
      w = c.width = Math.max(1, Math.round(c.clientWidth * k));
      h = c.height = Math.max(1, Math.round(c.clientHeight * k));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    const narrow = () => c.clientWidth < 768;
    const N = lite ? 12 : 22;
    type Bean = { x: number; y: number; z: number; rot: number; vr: number; cell: number; sway: number };
    const spawn = (b: Partial<Bean>, top: boolean): Bean => {
      const z = Math.pow(Math.random(), 1.6); // most beans far, a few close to the lens
      const lo = narrow() ? 0.05 : from;
      return {
        x: lo + Math.random() * (1.05 - lo),
        y: top ? -0.15 - Math.random() * 0.2 : Math.random() * 1.1 - 0.1,
        z,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * (0.6 + z),
        cell: (Math.random() * 3) | 0,
        sway: Math.random() * 6.28,
        ...b,
      };
    };
    const beans = Array.from({ length: N }, () => spawn({}, false)).sort((a, b) => a.z - b.z);

    let raf = 0;
    let last = 0;
    let on = false;
    const frame = (now: number) => {
      raf = on ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      g.clearRect(0, 0, w, h);
      if (!ready) return;
      const unit = Math.min(w, h * 1.6);
      for (let i = 0; i < beans.length; i++) {
        const b = beans[i];
        // slow motion: far beans drift, near ones pass faster
        b.y += (0.035 + b.z * 0.12) * dt;
        b.rot += b.vr * dt;
        const sx = Math.sin(now / 1400 + b.sway) * 0.004;
        const s = unit * (0.035 + b.z * 0.11);
        if (b.y * h - s > h) {
          beans[i] = spawn({ z: b.z }, true);
          continue;
        }
        // beans close to the lens use the defocused row of the sheet
        const near = b.z > 0.72;
        g.globalAlpha = 0.45 + b.z * 0.55;
        g.save();
        g.translate((b.x + sx) * w, b.y * h);
        g.rotate(b.rot);
        g.drawImage(img, b.cell * CELL, near ? CELL : 0, CELL, CELL, -s / 2, -s / 2, s, s);
        g.restore();
      }
      g.globalAlpha = 1;
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting && !document.hidden;
      last = 0;
      if (on && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(c);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [from]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full motion-reduce:hidden ${className}`} />;
}
