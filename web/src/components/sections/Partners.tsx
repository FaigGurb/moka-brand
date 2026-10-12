"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { CONTACT, PARTNERS } from "@/lib/site";

/**
 * The five Italian brands MOKA distributes, set on the signature line in the order of a cup's path.
 * The line draws itself with the scroll and lights each station as it reaches it. Names are typeset
 * in the brand font (no third-party logos); each links to the brand's official site.
 */
export function Partners() {
  const { t } = useI18n();
  const p = t.partners;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stations = gsap.utils.toArray<HTMLElement>(".p-st", el);
        stations.forEach((s) => s.classList.remove("is-on"));
        const tween = gsap.fromTo(
          ".p-line",
          { "--p": 0 },
          {
            "--p": 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".p-track",
              start: "top 78%",
              end: "bottom 72%",
              scrub: 1,
              onUpdate: (st) => {
                const n = stations.length;
                stations.forEach((s, i) => s.classList.toggle("is-on", st.progress >= (i + 0.15) / n || st.progress > 0.98));
              },
            },
          },
        );
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          stations.forEach((s) => s.classList.add("is-on"));
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="terefdas" ref={root} className="day-glow overflow-hidden bg-espresso text-paper">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-seher">{p.eyebrow}</p>
            <h2 className="text-[clamp(34px,4.6vw,60px)] leading-[1.03] font-medium tracking-[-0.01em]">{p.title}</h2>
          </div>
          <p className="max-w-[48ch] text-[17px] leading-relaxed text-muted-dark">{p.text}</p>
        </div>

        <ol className="p-track relative mt-16 grid gap-10 pl-10 md:mt-24 md:grid-cols-5 md:gap-6 md:pt-12 md:pl-0">
          {/* the signature line: vertical on phones, horizontal from md */}
          <li aria-hidden="true" className="pointer-events-none absolute top-2 bottom-2 left-[7px] w-[3px] bg-paper/12 md:top-[6px] md:right-0 md:bottom-auto md:left-0 md:h-[3px] md:w-auto">
            <span className="p-line absolute inset-0 block origin-top scale-y-[var(--p,1)] bg-glow shadow-[0_0_18px_rgba(255,226,166,0.55)] md:origin-left md:scale-x-[var(--p,1)] md:scale-y-100" />
          </li>
          {PARTNERS.map((b, i) => {
            const it = p.items[i];
            return (
              <li key={b.id} className="p-st is-on group relative flex flex-col gap-2">
                <span
                  aria-hidden="true"
                  className="absolute top-1 -left-10 block h-[17px] w-[17px] rounded-full border-[3px] border-paper/30 bg-espresso transition-colors duration-500 group-[.is-on]:border-glow group-[.is-on]:bg-glow md:-top-12 md:left-0"
                />
                <span className="text-[12px] font-bold tracking-[0.2em] text-muted-dark uppercase">
                  {String(i + 1).padStart(2, "0")} · {it.step}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-[clamp(30px,2.6vw,40px)] leading-none font-medium text-paper/45 transition-colors duration-500 group-[.is-on]:text-paper">
                  {b.name}
                </h3>
                <p className="text-[15px] leading-snug text-paper/85">{it.role}</p>
                <p className="text-[13px] text-muted-dark">{it.fact}</p>
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 self-start border-b border-paper/25 pb-0.5 text-[13px] font-bold text-paper/90 transition-colors hover:border-glow hover:text-glow"
                >
                  {b.host}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only">
                    {" "}
                    — {p.site}: {b.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <div className="mt-20 flex flex-col gap-5 border-t border-paper/12 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch] font-[family-name:var(--font-display)] text-[clamp(20px,2vw,26px)] leading-snug">{p.b2b}</p>
          <a
            href={`tel:${CONTACT.tel}`}
            className="inline-flex items-center gap-3 self-start bg-paper px-6 py-4 text-[13px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow md:self-auto"
          >
            {p.call} · <span className="tabular-nums">{CONTACT.phone}</span>
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-dark">{p.note}</p>
      </div>
    </section>
  );
}
