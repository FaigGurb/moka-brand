"use client";

import { useEffect, useRef } from "react";
import { perfTier } from "@/lib/perf";

/**
 * Warm dust drifting through the studio light: a small 2D canvas over a photo, so the still breathes.
 * Runs only while on screen (30 fps, fewer motes on phones); nothing for reduced motion.
 */
export function Dust({ className = "", density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const lite = perfTier() === "low";
    const n = Math.round((lite ? 26 : 60) * density);
    let w = 0;
    let h = 0;
    const motes = Array.from({ length: n }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      vx: (Math.random() - 0.3) * 0.006,
      vy: -0.004 - Math.random() * 0.01,
      a: 0.15 + Math.random() * 0.5,
      ph: Math.random() * 6.28,
    }));
    const size = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5);
      w = c.width = Math.max(1, Math.round(c.clientWidth * k));
      h = c.height = Math.max(1, Math.round(c.clientHeight * k));
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    let raf = 0;
    let last = 0;
    let on = false;
    const frame = (now: number) => {
      raf = on ? requestAnimationFrame(frame) : 0;
      if (now - last < 33) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      g.clearRect(0, 0, w, h);
      const k = Math.min(window.devicePixelRatio || 1, 1.5);
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        if (m.y < -0.02) {
          m.y = 1.02;
          m.x = Math.random();
        }
        if (m.x > 1.02) m.x = -0.02;
        const tw = 0.6 + 0.4 * Math.sin(now / 900 + m.ph);
        // brighter towards the right, where the key light is
        const light = 0.35 + 0.65 * m.x;
        g.globalAlpha = m.a * tw * light;
        g.fillStyle = "#ffd9a0";
        g.beginPath();
        g.arc(m.x * w, m.y * h, m.r * k, 0, Math.PI * 2);
        g.fill();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting && !document.hidden;
      if (on && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(c);
    return () => {
      on = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
