"use client";

import { LOCATIONS } from "@/lib/site";
import { useI18n } from "@/i18n/context";

/**
 * The two cafés as a guest needs them: name, hours, and two plain buttons (call, open the map).
 * Used in the phone menu and the footer, so "where is it and is it open" is one tap away.
 */
export function Cafes({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const btn =
    "inline-flex min-h-[44px] flex-1 basis-[9rem] items-center justify-center gap-2 whitespace-nowrap px-4 text-[15px] font-medium font-[family-name:var(--font-display)] transition-colors";
  return (
    <div className={`grid gap-3 ${className}`}>
      {LOCATIONS.map((loc, i) => {
        const pl = t.contact.places[i];
        return (
          <div key={loc.id} className="flex flex-col gap-3 border border-paper/15 p-4">
            <div className="flex flex-col gap-1">
              <b className="font-[family-name:var(--font-display)] text-[19px] font-medium text-paper">MOKA · {pl.name}</b>
              <span className="text-[15px] text-paper/80">{pl.hours}</span>
              <span className="text-[14px] text-muted-dark">{pl.address}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${loc.tel}`} className={`${btn} bg-paper text-black hover:bg-glow`} aria-label={`${t.contact.call}: MOKA ${pl.name}, ${loc.phone}`}>
                {t.contact.call}
              </a>
              <a href={loc.map} target="_blank" rel="noopener noreferrer" className={`${btn} border border-paper/40 text-paper hover:border-paper`}>
                {t.contact.map} <span aria-hidden="true">↗</span>
              </a>
            </div>
            <span className="text-[13px] tabular-nums text-muted-dark">{loc.phone}</span>
          </div>
        );
      })}
    </div>
  );
}
