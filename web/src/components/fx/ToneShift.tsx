"use client";

import { useEffect, type ReactNode } from "react";

/** MOKA's official greyscale: true black and the white of the cup. */
const TONES = { ink: [0, 0, 0], paper: [241, 240, 237] } as const;
export type Tone = keyof typeof TONES;

/**
 * A page band in one tone. "paper" inverts the colour tokens inside it (globals.css `.tone-paper`), so
 * a section written for a dark ground reads black on white without its own changes. The band's own
 * background is left to ToneShift, which blends the page colour from band to band.
 */
export function ToneBand({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div data-tone={tone} className={tone === "paper" ? "tone-paper" : "tone-ink"}>
      {children}
    </div>
  );
}

/**
 * The page colour follows the scroll: as the next band rises from the lower part of the screen to
 * its upper third, the background slides from one tone to the other (--page-bg on <html>).
 */
export function ToneShift() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const bands = () => Array.from(document.querySelectorAll<HTMLElement>("[data-tone]"));
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const list = bands();
      if (!list.length) return;
      // the band under the upper part of the screen, blended into the next one as it rises
      let rgb: number[] = [...TONES.ink]; // the film above is black
      for (let i = 0; i < list.length; i++) {
        const r = list[i].getBoundingClientRect();
        const c = TONES[list[i].dataset.tone as Tone];
        if (r.top > vh * 0.85) break;
        const t = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
        const e = t * t * (3 - 2 * t);
        rgb = rgb.map((v, k) => v + (c[k] - v) * e);
      }
      root.style.setProperty("--page-bg", `rgb(${rgb.map((v) => Math.round(v)).join(" ")})`);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      root.style.removeProperty("--page-bg");
    };
  }, []);
  return null;
}
