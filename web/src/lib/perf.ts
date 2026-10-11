"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Rough device class. Phones and tablets, low-core or low-memory machines and "save data"
 * get the light path: lower resolution, simpler materials, fewer particles, no page-wide layers.
 */
export function perfTier(): "high" | "low" {
  if (typeof window === "undefined") return "high";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  if (touch || cores <= 4 || mem <= 4 || nav.connection?.saveData) return "low";
  return "high";
}

export function usePerfTier() {
  const [tier, setTier] = useState<"high" | "low">("high");
  useEffect(() => setTier(perfTier()), []);
  return tier;
}

/** True while the element is within `margin` of the viewport (3D canvases pause outside it). */
export function useInView(ref: RefObject<Element | null>, margin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => setInView(e.isIntersecting)), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}

/** Becomes true once the browser is idle (or after `timeout` ms) — used to defer heavy chunks. */
export function useIdle(timeout = 1200) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setIdle(true), 300);
    return () => window.clearTimeout(id);
  }, [timeout]);
  return idle;
}
