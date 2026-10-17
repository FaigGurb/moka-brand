"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { CONTACT, PARTNERS, links } from "@/lib/site";
import { PartnerLogo, plateTone } from "@/components/partners/PartnerLogo";

/**
 * The five Italian brands MOKA distributes, set on the signature line in the order of a cup's path
 * (coffee, grinding, espresso, syrup, display). Each station is a paper plate carrying the partner's
 * own logo in its own colours; the plate opens that brand on the partners page, the host link goes
 * to the official site.
 *
 * Motion (off for reduced motion, plays once): heading, then the line draws and lights each station
 * as its plate rises in. Desktop runs it as one sequence along the horizontal line; on narrower
 * screens, where the line is vertical, each station reveals when it reaches the viewport.
 * No marquee: five logos fit at full size, and a looping strip would compete with the line.
 */
export function Partners() {
  const { t, locale } = useI18n();
  const p = t.partners;
  const L = links(locale);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
        if (!ctx.conditions?.ok) return;
        const stations = gsap.utils.toArray<HTMLElement>(".p-st", el);
        const items = gsap.utils.toArray<HTMLElement>(".p-item", el);
        const n = stations.length;

        stations.forEach((s) => s.classList.remove("is-on"));
        gsap.set(".p-reveal", { autoAlpha: 0, y: 18 });
        gsap.set(items, { autoAlpha: 0, y: 22 });
        gsap.set(".p-line", { "--p": 0 });

        gsap.to(".p-reveal", {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".p-head", start: "top 82%", once: true },
        });

        if (ctx.conditions?.wide) {
          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: ".p-track", start: "top 78%", once: true },
          });
          tl.to(".p-line", { "--p": 1, duration: 1.8, ease: "power1.inOut" }, 0);
          items.forEach((it, i) => {
            const at = (i / Math.max(1, n - 1)) * 1.5 + 0.1;
            tl.add(() => stations[i].classList.add("is-on"), at);
            tl.to(it, { autoAlpha: 1, y: 0, duration: 0.7 }, at);
          });
        } else {
          stations.forEach((s, i) => {
            gsap.to(items[i], {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: s,
                start: "top 85%",
                once: true,
                onEnter: () => {
                  s.classList.add("is-on");
                  gsap.to(".p-line", { "--p": (i + 1) / n, duration: 0.9, ease: "power1.out", overwrite: true });
                },
              },
            });
          });
        }

        return () => {
          stations.forEach((s) => s.classList.add("is-on"));
          gsap.set([".p-reveal", ...items, ".p-line"], { clearProps: "all" });
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="terefdas" ref={root} className="day-glow overflow-hidden bg-espresso text-paper">
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-32">
        {/* a still, warm band of light behind the line (desktop); no blur filter, no animation */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[46%] -z-10 hidden h-[420px] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,226,166,0.09),transparent_72%)] lg:block"
        />

        <div className="p-head grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="p-reveal eyebrow text-seher">{p.eyebrow}</p>
            <h2 className="p-reveal text-[clamp(40px,6vw,96px)] leading-[0.98] font-medium tracking-[-0.025em]">{p.title}</h2>
          </div>
          <div className="p-reveal flex flex-col items-start gap-5">
            <p className="max-w-[48ch] text-[17px] leading-relaxed text-muted-dark">{p.text}</p>
            <a
              href={L.partners}
              className="inline-flex items-center gap-2 border-b border-glow/60 pb-1 text-[13px] font-semibold text-glow transition-colors hover:border-glow hover:text-paper"
            >
              {p.page} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <ol className="p-track relative mt-16 grid gap-12 pl-10 md:mt-24 lg:grid-cols-5 lg:gap-6 lg:pt-12 lg:pl-0">
          {/* the signature line: vertical below lg, horizontal from lg */}
          <li
            aria-hidden="true"
            className="pointer-events-none absolute top-2 bottom-2 left-[7px] w-[3px] bg-paper/12 lg:top-[6px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-[3px] lg:w-auto"
          >
            <span className="p-line absolute inset-0 block origin-top scale-y-[var(--p,1)] bg-glow shadow-[0_0_18px_rgba(255,226,166,0.55)] lg:origin-left lg:scale-x-[var(--p,1)] lg:scale-y-100" />
          </li>
          {PARTNERS.map((b, i) => {
            const it = p.items[i];
            return (
              <li key={b.id} className="p-st is-on group relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1 -left-10 block h-[17px] w-[17px] rounded-full border-[3px] border-paper/30 bg-espresso transition-[background-color,border-color,box-shadow] duration-500 group-[.is-on]:border-glow group-[.is-on]:bg-glow group-[.is-on]:shadow-[0_0_14px_rgba(255,226,166,0.6)] lg:-top-12 lg:left-0"
                />
                <div className="p-item grid gap-5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-center sm:gap-8 lg:flex lg:flex-col lg:items-stretch lg:gap-5">
                  <h3 className="sr-only">{b.name}</h3>
                  <a
                    href={`${L.partners}#${b.id}`}
                    className={`group/plate relative grid aspect-[16/10] w-full max-w-[320px] place-items-center overflow-hidden transition-[transform,box-shadow] duration-300 ease-out outline-none hover:-translate-y-1 hover:shadow-[0_0_0_1px_var(--color-glow),0_16px_36px_-16px_rgba(255,226,166,0.55)] focus-visible:-translate-y-1 focus-visible:shadow-[0_0_0_3px_var(--color-glow)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:max-w-none ${plateTone(b.id)}`}
                  >
                    <PartnerLogo id={b.id} name={b.name} pending={p.pending} />
                    <span className="sr-only"> — {p.more}</span>
                  </a>
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold text-muted-dark transition-colors duration-500 group-[.is-on]:text-seher">
                      {String(i + 1).padStart(2, "0")} · {it.step}
                    </span>
                    <p className="text-[15px] leading-snug text-paper/85">{it.role}</p>
                    <p className="text-[13px] text-muted-dark">{it.fact}</p>
                    {it.bar && <p className="text-[13px] font-bold text-glow/90">{it.bar}</p>}
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 self-start border-b border-paper/25 pb-0.5 text-[13px] font-bold text-paper/90 transition-colors hover:border-glow hover:text-glow"
                    >
                      {b.host}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only"> — {p.site}: {b.name}</span>
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-20 flex items-start gap-3 text-[14px] leading-relaxed text-paper/80">
          <span aria-hidden="true" className="mt-[7px] block h-[3px] w-6 shrink-0 bg-glow" />
          {p.trust}
        </p>
        <div className="mt-8 flex flex-col gap-5 border-t border-paper/12 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[52ch] font-[family-name:var(--font-display)] text-[clamp(20px,2vw,26px)] leading-snug">{p.b2b}</p>
          <a
            href={`tel:${CONTACT.tel}`}
            className="inline-flex shrink-0 items-center gap-3 self-start whitespace-nowrap bg-paper px-6 py-4 text-[13px] font-semibold text-espresso transition-colors hover:bg-glow md:self-auto"
          >
            {p.call} · <span className="tabular-nums">{CONTACT.phone}</span>
          </a>
        </div>
        <p className="mt-6 text-xs text-muted-dark">{p.note}</p>
      </div>
    </section>
  );
}
