"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * One cinematic entrance for every section title outside the film: the line rises out of a mask
 * and its eyebrow settles from wide tracking, once, as the section comes in. Titles that their own
 * section already animates (or that sit in a pinned scene) are left alone. Off for reduced motion.
 */
export function HeadingReveal() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const skip = ".a-rise, .p-reveal, .d-pin, [data-film-stop]";
      const heads = Array.from(document.querySelectorAll<HTMLElement>("main section h2")).filter((h) => !h.closest(skip));
      heads.forEach((h) => {
        const brow = h.parentElement?.querySelector<HTMLElement>(".eyebrow") ?? null;
        const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: "top 88%", once: true } });
        tl.fromTo(
          h,
          { clipPath: "inset(0 0 100% 0)", y: 36 },
          { clipPath: "inset(0 0 -12% 0)", y: 0, duration: 1.15, ease: "power3.out", clearProps: "clipPath,transform" },
        );
        if (brow && brow !== h) {
          const ls = getComputedStyle(brow).letterSpacing;
          tl.fromTo(brow, { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: ls, duration: 1.2, ease: "power2.out", clearProps: "opacity,letterSpacing" }, 0);
        }
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}
