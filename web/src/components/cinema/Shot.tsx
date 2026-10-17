"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Still } from "@/lib/cinema";

export type Shot = {
  still: Still;
  /** object-position of the crop, e.g. "62% 50%" (keeps the subject in frame on phones) */
  focus?: string;
  alt?: string;
};

/** "48% 60%" → [0.48, 0.6] */
export const focusOf = (s: Shot) => (s.focus ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100) as [number, number];

/**
 * The photo's own frame, sized like CSS `object-fit: cover` with a focal point, so effects placed in
 * image fractions sit exactly on the picture (and on the film frames, which are cropped the same way).
 */
export function CoverFrame({ still, focus, children }: { still: Still; focus?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const [fx, fy] = (focus ?? "50% 50%").split(" ").map((v) => parseFloat(v) / 100);
    const fit = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const width = Math.max(cw, ch * still.aspect);
      const height = width / still.aspect;
      setBox({ left: (cw - width) * fx, top: (ch - height) * fy, width, height });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [still, focus]);
  return (
    // hidden until measured: a full-size first paint that then shrinks counts as a layout shift
    <div ref={ref} className="absolute" style={box ?? { inset: 0, visibility: "hidden" }}>
      {children}
    </div>
  );
}
