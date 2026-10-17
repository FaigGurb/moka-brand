"use client";

import type { ReactNode } from "react";
import { FilmJourney, type FilmStop } from "../cinema/FilmJourney";
import { STILLS } from "@/lib/cinema";
import { CLIPS } from "@/lib/clips";
import { useI18n } from "@/i18n/context";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ESPRESSO = "var(--color-espresso)";

/**
 * "From bean to cup" as one continuous film under the first part of the page (FilmJourney): the hero
 * lifts off it, then green bean → roast → crack → grind → pour → Chemex → MOKA's cup, each a section
 * of its own, with the roast, brewing and packaging sections scrolling over the held frames between.
 * The film is six Kling start→end-frame transitions between these stills (docs/tools/film/chain.sh).
 * The cup's K is never drawn by the generator: the film ends on a blank cup and the vector K
 * (cut from the cup still, public/cinema/cup-k.webp) fades onto it.
 */
export function BeanStory({ lead, roast, brew, packs }: { lead: ReactNode; roast: ReactNode; brew: ReactNode; packs: ReactNode }) {
  const { t } = useI18n();
  const b = t.beans;
  const [bean, roasting, grinding, brewing] = b.steps;
  const cap = (i: number, s: { title: string; text: string; tags?: string[] }) => ({ kicker: String(i).padStart(2, "0"), title: s.title, text: s.text, tags: s.tags });
  const stops: FilmStop[] = [
    { shot: { still: STILLS.beanGreen, focus: "48% 50%" }, caption: cap(1, bean) },
    { shot: { still: STILLS.beanDark, focus: "48% 50%" }, caption: cap(2, roasting) },
    { shot: { still: STILLS.beanCrack, focus: "50% 50%" }, after: roast, tone: ESPRESSO },
    { shot: { still: STILLS.grind, focus: "50% 60%" }, caption: cap(3, grinding) },
    { shot: { still: STILLS.pour, focus: "44% 60%" }, caption: cap(4, brewing) },
    { shot: { still: STILLS.chemex, focus: "48% 55%" }, after: brew, tone: ESPRESSO },
    { shot: { still: STILLS.cup, focus: "50% 50%" }, caption: cap(5, b.final), after: packs, tone: "#000" },
  ];

  return (
    <FilmJourney
      lead={lead}
      id="proses"
      eyebrow={b.eyebrow}
      heading={<h2 id="proses-title">{b.title}</h2>}
      stops={stops}
      film={CLIPS.journey}
      mark={{ src: `${BASE}/cinema/cup-k.webp`, region: [0.448, 0.5324, 0.0867, 0.1445] }}
    />
  );
}
