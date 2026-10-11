"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "../Logo";
import { gsap } from "@/lib/gsap";

/**
 * First-visit intro: the signature line draws across, then the screen opens along it —
 * the top half of the wordmark lifts away, the bottom half drops. Once per browser session.
 * Rendered on the server so the page never flashes underneath; CSS hides it after 3.2s even without JS.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("moka-intro") === "1";
      sessionStorage.setItem("moka-intro", "1");
    } catch {}
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGone(true);
      return;
    }
    document.documentElement.classList.add("is-loading");
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        document.documentElement.classList.remove("is-loading");
        setGone(true);
      },
    });
    tl.fromTo(".pl-mark", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" })
      .fromTo(".pl-line", { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, 0.15)
      .to(".pl-top", { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, 0.95)
      .to(".pl-bottom", { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, 0.95)
      .to(".pl-line", { opacity: 0, duration: 0.3 }, 1.1);
    return () => {
      tl.kill();
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  if (gone) return null;
  // Each panel shows half of the same wordmark, cut exactly at the signature line.
  const mark = (
    <div className="pl-mark absolute top-1/2 left-1/2 w-[min(70vw,560px)] -translate-x-1/2 -translate-y-1/2 text-paper">
      <Logo className="w-full" title="MOKA" />
    </div>
  );
  return (
    <div ref={root} className="preloader pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div className="pl-top absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-espresso">
        <div className="absolute inset-x-0 top-0 h-[100svh]">{mark}</div>
      </div>
      <div className="pl-bottom absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-espresso">
        <div className="absolute inset-x-0 bottom-0 h-[100svh]">{mark}</div>
      </div>
      <div className="pl-line absolute top-1/2 left-0 h-[3px] w-full origin-left -translate-y-1/2 bg-glow shadow-[0_0_24px_#ffe2a6]" />
    </div>
  );
}
