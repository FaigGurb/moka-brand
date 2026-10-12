"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/context";
import { PARTNER_PAGE } from "@/i18n/partners";
import { CONTACT, LOCATIONS, PARTNERS } from "@/lib/site";
import { PartnerLogo, plateTone } from "@/components/partners/PartnerLogo";

/**
 * /partners/: the five brands MOKA distributes, one section each (logo plate, what the brand is, where it
 * comes from, what it offers, what runs in MOKA's own bar), then a B2B contact block. The home section
 * links each plate here by anchor (#pitti, #mazzer …). Sections reveal once on scroll; static for reduced motion.
 */
export function PartnersPage() {
  const { t, locale } = useI18n();
  const c = PARTNER_PAGE[locale];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".pp-reveal", root.current!).forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 24,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          });
        });
        gsap.fromTo(".pp-line", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power1.inOut", delay: 0.3 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* hero */}
      <section className="day-glow overflow-hidden bg-espresso pt-32 text-paper md:pt-40">
        <div className="mx-auto max-w-[1320px] px-5 pb-16 md:px-10 md:pb-24">
          <p className="pp-reveal eyebrow text-seher">{c.hero.eyebrow}</p>
          <h1 className="pp-reveal mt-5 max-w-[16ch] text-[clamp(40px,7vw,96px)] leading-[0.98] font-medium tracking-[-0.015em]">{c.hero.title}</h1>
          <p className="pp-reveal mt-8 max-w-[56ch] text-[18px] leading-relaxed text-muted-dark">{c.hero.text}</p>

          <nav aria-label={c.hero.jump} className="pp-reveal mt-14">
            <span aria-hidden="true" className="pp-line block h-[3px] origin-left bg-glow shadow-[0_0_18px_rgba(255,226,166,0.55)]" />
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PARTNERS.map((b, i) => (
                <li key={b.id}>
                  <a
                    href={`#${b.id}`}
                    className={`group/plate grid aspect-[16/9] place-items-center overflow-hidden transition-[transform,box-shadow] duration-300 outline-none hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--color-glow)] focus-visible:shadow-[0_0_0_3px_var(--color-glow)] motion-reduce:transition-none ${plateTone(b.id)}`}
                  >
                    <PartnerLogo id={b.id} name={b.name} pending={t.partners.pending} />
                  </a>
                  <span className="mt-2 block text-[11px] font-bold tracking-[0.18em] text-muted-dark uppercase">
                    {String(i + 1).padStart(2, "0")} · {c.brands[i].step}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* one section per brand */}
      {PARTNERS.map((b, i) => {
        const x = c.brands[i];
        return (
          <section
            key={b.id}
            id={b.id}
            aria-labelledby={`pp-${b.id}`}
            className={`scroll-mt-20 text-paper ${i % 2 ? "bg-espresso-2" : "bg-espresso"}`}
          >
            <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
              <div className="pp-reveal">
                <div className={`grid aspect-[4/3] place-items-center overflow-hidden ${plateTone(b.id)}`}>
                  <PartnerLogo id={b.id} name={b.name} pending={t.partners.pending} />
                </div>
              </div>
              <div className="pp-reveal flex flex-col gap-6">
                <p className="flex items-center gap-3 text-[12px] font-bold tracking-[0.2em] text-seher uppercase">
                  <span aria-hidden="true" className="block h-[3px] w-8 bg-glow" />
                  {String(i + 1).padStart(2, "0")} · {x.step}
                </p>
                <div>
                  <h2 id={`pp-${b.id}`} className="text-[clamp(34px,4.4vw,56px)] leading-none font-medium">
                    {b.name}
                  </h2>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(20px,2vw,26px)] leading-snug text-paper/80">{x.tagline}</p>
                </div>
                <p className="max-w-[60ch] text-[16px] leading-relaxed text-paper/80">{x.about}</p>
                <dl className="grid gap-4 border-y border-paper/12 py-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.18em] text-muted-dark uppercase">{c.labels.origin}</dt>
                    <dd className="mt-1 text-[15px]">{x.origin}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold tracking-[0.18em] text-muted-dark uppercase">{c.labels.range}</dt>
                    <dd className="mt-1 text-[15px]">{x.range}</dd>
                  </div>
                </dl>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] text-glow uppercase">{c.labels.bar}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {x.bar.map((line) => (
                      <li key={line} className="flex gap-3 text-[15px] leading-snug">
                        <span aria-hidden="true" className="mt-[9px] block h-[3px] w-4 shrink-0 bg-glow" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-paper/40 px-5 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase transition-colors hover:border-glow hover:text-glow"
                  >
                    {c.labels.site} · {b.host} <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href={`tel:${CONTACT.tel}`}
                    className="bg-paper px-5 py-3.5 text-[13px] font-bold tracking-[0.14em] text-espresso uppercase transition-colors hover:bg-glow"
                  >
                    {c.labels.ask}
                    <span className="sr-only">: {b.name}, {CONTACT.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* B2B contact */}
      <section aria-labelledby="pp-b2b" className="bg-paper text-espresso">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-2 lg:gap-16">
          <div className="pp-reveal flex flex-col gap-5">
            <p className="eyebrow text-axsam-ink">{c.b2b.eyebrow}</p>
            <h2 id="pp-b2b" className="text-[clamp(32px,4.4vw,56px)] leading-[1.02] font-medium">{c.b2b.title}</h2>
            <p className="max-w-[52ch] text-[17px] leading-relaxed text-muted">{c.b2b.text}</p>
            <p className="flex items-start gap-3 text-[14px] leading-relaxed text-muted">
              <span aria-hidden="true" className="mt-[7px] block h-[3px] w-6 shrink-0 bg-axsam" />
              {t.partners.trust}
            </p>
          </div>
          <div className="pp-reveal flex flex-col gap-4">
            {LOCATIONS.map((loc, i) => {
              const pl = t.contact.places[i];
              return (
                <a
                  key={loc.id}
                  href={`tel:${loc.tel}`}
                  className="flex items-center justify-between gap-4 border border-espresso/15 bg-white/60 px-6 py-5 transition-colors hover:border-espresso"
                >
                  <span className="flex flex-col gap-1">
                    <b className="font-[family-name:var(--font-display)] text-xl font-medium">MOKA · {pl.name}</b>
                    <span className="text-[14px] text-muted">{pl.address}</span>
                  </span>
                  <span className="shrink-0 text-[15px] font-bold tabular-nums">{loc.phone}</span>
                </a>
              );
            })}
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start bg-espresso px-6 py-4 text-[13px] font-bold tracking-[0.14em] text-paper uppercase transition-colors hover:bg-axsam-ink"
            >
              {c.b2b.instagram} · {CONTACT.handle}
            </a>
          </div>
          <p className="text-xs text-muted lg:col-span-2">{c.note}</p>
        </div>
      </section>
    </div>
  );
}
