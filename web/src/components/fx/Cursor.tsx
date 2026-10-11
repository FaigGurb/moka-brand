"use client";

import { useEffect, useRef } from "react";

/**
 * A soft follower ring for mouse users. It grows over links and buttons and shows a short
 * label over elements with data-cursor="…". The native cursor stays visible.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ring.current!;
    let x = -100, y = -100, tx = -100, ty = -100, scale = 1, ts = 1, raf = 0, shown = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
      const t = (e.target as Element | null)?.closest?.("[data-cursor], a, button, label, [role=tab]") as HTMLElement | null;
      const text = t?.dataset?.cursor ?? "";
      ts = t ? (text ? 2.6 : 1.7) : 1;
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
      el.classList.toggle("has-label", !!text);
    };
    const leave = () => {
      shown = false;
      el.style.opacity = "0";
    };
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      scale += (ts - scale) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={ring} className="cursor-ring" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
