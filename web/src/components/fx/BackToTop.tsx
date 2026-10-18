"use client";

import { useEffect, useState } from "react";
import { jumpTo } from "@/lib/lenis";

/**
 * A small round "back to top" button, bottom left. It shows only while the visitor scrolls up, a few
 * screens down a long page (that is when they look for the way back), so it never sits over the
 * headings they are reading on the way down; hidden again at the foot of the page, which has its own.
 */
export function BackToTop({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const check = () => {
      const y = window.scrollY;
      const up = y < last - 2;
      const down = y > last + 2;
      last = y;
      const deep = y > window.innerHeight * 3 && y + window.innerHeight < document.documentElement.scrollHeight - 600;
      if (!deep || down) setOn(false);
      else if (up) setOn(true);
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <a
      href="#top"
      onClick={(e) => jumpTo("#top", 0) && e.preventDefault()}
      aria-label={label}
      title={label}
      aria-hidden={!on}
      tabIndex={on ? 0 : -1}
      className={`fixed bottom-[calc(16px+env(safe-area-inset-bottom,0px))] left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-paper/35 bg-black/75 text-[20px] text-paper transition-[opacity,transform] duration-300 hover:border-paper md:bottom-6 md:left-5 ${
        on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span aria-hidden="true">↑</span>
    </a>
  );
}
