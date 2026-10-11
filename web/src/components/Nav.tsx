"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LINKS, NAV } from "@/lib/site";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const els = NAV.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-espresso/92 backdrop-blur-md" : "bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav aria-label="Əsas menyu" className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-5 md:px-10">
        <a href="#top" className="text-paper" aria-label="MOKA — yuxarı qayıt">
          <Logo className="h-[18px] w-auto" />
        </a>
        <span className="hidden border border-paper/40 px-2 py-1 text-[10px] font-bold tracking-[0.16em] text-paper/80 uppercase sm:inline">
          Konsept · test işi
        </span>
        <ul className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                aria-current={active === n.href ? "true" : undefined}
                className="relative py-2 text-[13px] font-bold tracking-[0.06em] text-paper/75 transition-colors hover:text-paper aria-[current]:text-paper"
              >
                {n.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-[2px] bg-glow transition-all duration-500 ease-[var(--ease-brand)] ${
                    active === n.href ? "w-full" : "w-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
        <a
          href={LINKS.ar}
          className="ml-auto hidden bg-paper px-4 py-2.5 text-[12px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow lg:ml-0 lg:inline-block"
        >
          AR demo
        </a>
        <button
          type="button"
          className="ml-auto flex h-11 w-11 items-center justify-center text-paper lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
          </span>
        </button>
      </nav>
      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100svh-4rem)] overflow-y-auto bg-espresso px-5 pb-10 lg:hidden"
      >
        <ul className="flex flex-col border-t border-paper/15">
          {NAV.map((n, i) => (
            <li key={n.href} className="border-b border-paper/15">
              <a
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between py-5 font-[family-name:var(--font-display)] text-3xl text-paper"
              >
                {n.label}
                <span className="text-xs font-bold tracking-[0.2em] text-muted-dark">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3">
          <a href={LINKS.ar} className="bg-paper px-5 py-4 text-center text-sm font-bold tracking-[0.14em] text-espresso uppercase">AR demonu aç</a>
          <a href={LINKS.game} className="border border-paper/40 px-5 py-4 text-center text-sm font-bold tracking-[0.14em] text-paper uppercase">Xətti tut — oyna</a>
        </div>
      </div>
    </header>
  );
}
