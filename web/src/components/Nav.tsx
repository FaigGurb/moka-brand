"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { SoundToggle } from "./SoundToggle";
import { Cafes } from "./Cafes";
import { getLenis, jumpTo } from "@/lib/lenis";
import { CONTACT, HOME, NAV_IDS, links } from "@/lib/site";
import { useI18n } from "@/i18n/context";
import { LOCALES } from "@/i18n/dict";

function LangSwitch({ className = "", sub = "" }: { className?: string; sub?: string }) {
  const { locale, t } = useI18n();
  return (
    <div role="group" aria-label={t.nav.lang} className={`flex ${className}`}>
      {LOCALES.map((l) => (
        <a
          key={l}
          href={HOME[l] + sub}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className="flex min-h-[40px] min-w-[40px] items-center justify-center px-2 text-[12px] font-bold tracking-[0.1em] text-paper/60 uppercase transition-colors hover:text-paper aria-[current]:text-paper aria-[current]:underline aria-[current]:decoration-glow aria-[current]:decoration-2 aria-[current]:underline-offset-[6px]"
        >
          {l}
        </a>
      ))}
    </div>
  );
}

/** `sub` is set on secondary pages (e.g. "menu/"): section links then point back to the home page. */

export function Nav({ sub = "" }: { sub?: string }) {
  const { locale, t } = useI18n();
  const L = links(locale);
  const home = sub ? HOME[locale] : "";
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
    // The hero (#top) is observed too, so nothing stays highlighted after scrolling back up.
    // Every section and film chapter is watched: one that has no nav link (Bar, the film's grind/pour
    // chapters, …) clears the highlight instead of leaving the previous link lit.
    const nav = new Set<string>(NAV_IDS);
    const els = Array.from(document.querySelectorAll("#top, main section, [data-film-stop], footer"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id ? `#${e.target.id}` : "";
          setActive(nav.has(id) ? id : "");
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.style.overflow = open ? "hidden" : "";
    // Lenis drives the page scroll, so it has to stop too, or a swipe in the open menu scrolls the page behind it
    if (open) getLenis()?.stop();
    else getLenis()?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-black/95 [@media(hover:hover)]:bg-black/85 [@media(hover:hover)]:backdrop-blur-md" : "bg-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <nav aria-label={t.nav.label} className="mx-auto flex h-16 max-w-[1320px] items-center gap-5 px-5 md:px-10">
        <a href={sub ? HOME[locale] : "#top"} className="text-paper" aria-label={t.logoHome}>
          <Logo className="h-[18px] w-auto" />
        </a>
        <span className="hidden border border-paper/30 px-2.5 py-1 text-[13px] whitespace-nowrap text-paper/75 2xl:inline">
          {t.nav.badge}
        </span>
        <ul className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV_IDS.map((id, i) => (
            <li key={id}>
              <a
                href={home + id}
                aria-current={active === id ? "true" : undefined}
                className="relative py-2 text-[14px] font-semibold whitespace-nowrap text-paper/75 transition-colors hover:text-paper aria-[current]:text-paper"
              >
                {t.nav.items[i]}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-[2px] bg-glow transition-all duration-500 ease-[var(--ease-brand)] ${
                    active === id ? "w-full" : "w-0"
                  }`}
                />
              </a>
            </li>
          ))}
          <li>
            <a
              href={L.system}
              aria-current={sub === "system/" ? "page" : undefined}
              className="py-2 text-[14px] font-semibold whitespace-nowrap text-paper/75 transition-colors hover:text-paper aria-[current]:text-paper aria-[current]:underline aria-[current]:underline-offset-8"
            >
              {t.nav.system}
            </a>
          </li>
          <li>
            <a
              href={home + "#kafeler"}
              onClick={(e) => !home && jumpTo("#kafeler") && e.preventDefault()}
              className="py-2 text-[14px] font-semibold whitespace-nowrap text-paper/75 transition-colors hover:text-paper"
            >
              {t.contact.title}
            </a>
          </li>
        </ul>
        <LangSwitch className="ml-auto -mr-1 flex lg:ml-0" sub={sub} />
        <a
          href={L.menu}
          aria-current={sub === "menu/" ? "page" : undefined}
          className="hidden border border-paper/40 px-4 py-2.5 font-[family-name:var(--font-display)] text-[15px] font-medium whitespace-nowrap text-paper transition-colors hover:border-paper aria-[current]:border-glow aria-[current]:text-glow lg:inline-block"
        >
          {t.menu.nav}
        </a>
        <SoundToggle labelOn={t.nav.soundOn} labelOff={t.nav.soundOff} className="-mr-2 sm:-mr-0" />
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-paper lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? t.nav.close : t.nav.open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-[2px] w-6 bg-current transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
          </span>
        </button>
      </nav>
      <div id="mobile-menu" data-lenis-prevent hidden={!open} className="h-[calc(100svh-4rem)] overflow-y-auto bg-black px-5 pb-10 lg:hidden">
        <p className="pt-2 pb-3 text-[15px] text-muted-dark">{t.contact.title}</p>
        <Cafes />
        <a href={L.menu} className="mt-3 block border border-glow px-5 py-4 text-center font-[family-name:var(--font-display)] text-[16px] font-medium text-glow">
          {t.menu.nav}
        </a>
        <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="mt-3 block border border-paper/40 px-5 py-4 text-center font-[family-name:var(--font-display)] text-[16px] font-medium text-paper">
          Instagram · {CONTACT.handle} <span aria-hidden="true">↗</span>
        </a>
        <ul className="mt-6 flex flex-col border-t border-paper/15">
          {NAV_IDS.map((id, i) => (
            <li key={id} className="border-b border-paper/15">
              <a href={home + id} onClick={() => setOpen(false)} className="flex items-baseline py-4 font-[family-name:var(--font-display)] text-2xl text-paper sm:text-3xl">
                {t.nav.items[i]}
              </a>
            </li>
          ))}
          <li className="border-b border-paper/15">
            <a href={L.system} className="flex items-baseline py-4 font-[family-name:var(--font-display)] text-2xl text-paper sm:text-3xl">
              {t.nav.system}
            </a>
          </li>
        </ul>
        <div className="mt-6 flex flex-col gap-3">
          <a href={L.brand} className="border border-paper/40 px-5 py-4 text-center font-[family-name:var(--font-display)] text-[16px] font-medium text-paper">
            {t.footer.brand}
          </a>
          <a href={L.ar} className="bg-paper px-5 py-4 text-center font-[family-name:var(--font-display)] text-[16px] font-medium text-espresso">
            {t.nav.mobileAr}
          </a>
          <a href={L.game} className="border border-paper/40 px-5 py-4 text-center font-[family-name:var(--font-display)] text-[16px] font-medium text-paper">
            {t.nav.mobileGame}
          </a>
        </div>
      </div>
    </header>
  );
}
