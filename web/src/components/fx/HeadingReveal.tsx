"use client";

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

/**
 * One cinematic entrance for every section title outside the film: the title's words rise one after
 * another out of a mask (tilted back, settling upright), the eyebrow settles from wide tracking, and
 * the paragraph right after the title follows a beat later. Once per title, as the section comes in.
 * Titles that their own section already animates (or that sit in a sticky scene) are left alone.
 * Off for reduced motion. The split keeps the text in the DOM, so screen readers read it as before.
 */
export function HeadingReveal() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const skip = ".a-rise, .p-reveal, .d-pin, .c-pin, [data-film-stop]";
      const heads = Array.from(document.querySelectorAll<HTMLElement>("main section h2")).filter((h) => !h.closest(skip));
      const undo: (() => void)[] = [];
      heads.forEach((h) => {
        const brow = h.parentElement?.querySelector<HTMLElement>(".eyebrow") ?? null;
        const lead = h.nextElementSibling instanceof HTMLParagraphElement ? h.nextElementSibling : null;
        const tl = gsap.timeline({ scrollTrigger: { trigger: h, start: "top 88%", once: true } });

        // words in masks (plain-text titles only; anything with markup inside rises as one line)
        const plain = Array.from(h.childNodes).every((n) => n.nodeType === Node.TEXT_NODE);
        if (plain && h.textContent?.trim()) {
          const text = h.textContent;
          h.textContent = "";
          const inner: HTMLElement[] = [];
          text.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              h.appendChild(document.createTextNode(part));
              return;
            }
            const mask = document.createElement("span");
            mask.className = "hr-mask";
            const w = document.createElement("span");
            w.className = "hr-word";
            w.textContent = part;
            mask.appendChild(w);
            h.appendChild(mask);
            inner.push(w);
          });
          undo.push(() => (h.textContent = text));
          tl.fromTo(
            inner,
            { yPercent: 115, rotate: 6, opacity: 0 },
            { yPercent: 0, rotate: 0, opacity: 1, duration: 1.15, ease: "expo.out", stagger: 0.07, clearProps: "transform,opacity" },
          );
        } else {
          tl.fromTo(
            h,
            { clipPath: "inset(0 0 100% 0)", y: 36 },
            { clipPath: "inset(0 0 -12% 0)", y: 0, duration: 1.15, ease: "power3.out", clearProps: "clipPath,transform" },
          );
        }
        if (brow && brow !== h) {
          const ls = getComputedStyle(brow).letterSpacing;
          tl.fromTo(brow, { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: ls, duration: 1.2, ease: "power2.out", clearProps: "opacity,letterSpacing" }, 0);
        }
        if (lead) tl.fromTo(lead, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", clearProps: "opacity,transform" }, 0.35);
      });
      return () => undo.forEach((f) => f());
    });
    return () => mm.revert();
  }, []);
  return null;
}
