"use client";

import { useEffect, useState } from "react";
import { Lockup } from "./Logo";
import { bakuHour, daySlot, type DaySlot } from "@/lib/day";
import { CONTACT, LOCATIONS, PARTNERS, links } from "@/lib/site";
import { useI18n } from "@/i18n/context";

export function Footer() {
  const { locale, t } = useI18n();
  const L = links(locale);
  const [day, setDay] = useState<DaySlot | null>(null);
  useEffect(() => setDay(daySlot(bakuHour())), []);
  return (
    <footer className="day-glow overflow-hidden border-t border-paper/10 bg-espresso text-muted-dark">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 md:grid-cols-2 md:px-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Lockup className="h-9 w-auto self-start text-paper" />
          <p className="max-w-[44ch] text-sm leading-relaxed">{t.footer.disclaimer}</p>
          <p className="text-sm leading-relaxed">
            {t.contact.partners}:{" "}
            {PARTNERS.map((b, i) => (
              <span key={b.id}>
                {i > 0 && " · "}
                <a className="text-paper/85 hover:text-paper" href={b.url} target="_blank" rel="noopener noreferrer">
                  {b.name}
                </a>
              </span>
            ))}
          </p>
          {day && (
            <p className="flex items-center gap-2 text-sm">
              <span className="block h-3 w-3 rounded-full" style={{ background: day.hex }} aria-hidden="true" />
              {t.footer.dayNow} <b className="text-paper">{day.name}</b>
            </p>
          )}
        </div>
        <nav aria-label={t.footer.links} className="flex flex-col gap-3 text-sm">
          <a className="hover:text-paper" href={L.menu}>{t.footer.menu}</a>
          <a className="hover:text-paper" href={L.brand}>{t.footer.brand}</a>
          <a className="hover:text-paper" href={L.partners}>{t.footer.partners}</a>
          <a className="hover:text-paper" href={L.ar}>{t.footer.ar}</a>
          <a className="hover:text-paper" href={L.arCard}>{t.footer.card}</a>
          <a className="hover:text-paper" href={L.game}>{t.footer.game}</a>
          <a className="hover:text-paper" href={L.club}>{t.footer.club}</a>
          <a className="hover:text-paper" href={L.v1}>{t.footer.v1}</a>
        </nav>
        <address className="flex flex-col gap-3 text-sm not-italic">
          <b className="eyebrow text-seher">{t.contact.title}</b>
          {LOCATIONS.map((loc, i) => {
            const pl = t.contact.places[i];
            return (
              <div key={loc.id} className="flex flex-col gap-1">
                <b className="font-bold text-paper">MOKA · {pl.name}</b>
                <a className="text-paper/90 hover:text-glow" href={loc.map} target="_blank" rel="noopener noreferrer">
                  {pl.address} <span aria-hidden="true">↗</span>
                </a>
                <span>{pl.hours}</span>
                <a className="tabular-nums text-paper/90 hover:text-glow" href={`tel:${loc.tel}`}>
                  {loc.phone}
                </a>
              </div>
            );
          })}
          <a className="hover:text-paper" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
            {CONTACT.handle}
          </a>
        </address>
        <div className="flex flex-col gap-3 text-sm">
          <span>{t.footer.credit}</span>
          <a className="hover:text-paper" href={L.repo} target="_blank" rel="noopener">{t.footer.repo}</a>
          <a className="hover:text-paper" href={L.privacy}>{t.footer.privacy}</a>
        </div>
      </div>
    </footer>
  );
}
