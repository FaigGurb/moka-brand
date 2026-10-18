"use client";

import { useEffect, useState } from "react";
import { jumpTo } from "@/lib/lenis";

/** A small "back to top" button once the visitor is a few screens down a long page (bottom left). */
export function BackToTop({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    // hidden again at the foot of the page, where the footer has its own links (and the final "back to top")
    const check = () =>
      setOn(window.scrollY > window.innerHeight * 3 && window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 600);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <a
      href="#top"
      onClick={(e) => jumpTo("#top", 0) && e.preventDefault()}
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
      className={`fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-4 z-30 border border-paper/35 bg-black/70 px-4 py-2.5 font-[family-name:var(--font-display)] text-[15px] text-paper transition-opacity duration-300 hover:border-paper md:left-5 md:bottom-6 ${
        on ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span aria-hidden="true">↑</span> {label}
    </a>
  );
}
