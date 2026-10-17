"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Phones resize the viewport when the address bar hides; re-measuring then makes pinned sections jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * Scrub for scroll-driven scenes: on touch screens the scene follows the finger exactly (smoothing
 * there makes it swim behind a CSS-sticky scene and shake when the finger turns); with a wheel a
 * short catch-up keeps it soft.
 */
export const scrubFor = (smooth: number): number | true =>
  typeof window !== "undefined" && matchMedia("(hover: none), (pointer: coarse)").matches ? true : smooth;

export { gsap, ScrollTrigger, useGSAP };
