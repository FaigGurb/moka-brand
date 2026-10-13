"use client";

import { CinemaStage, type Scene } from "../cinema/CinemaStage";
import { STILLS } from "@/lib/cinema";
import { useI18n } from "@/i18n/context";

/**
 * "From bean to cup" as a cinema stage: photoreal chapters (bean, roast, grind, brew, the line on
 * MOKA's cup) dissolve into each other as the page scrolls, backwards when scrolling up.
 */
export function BeanStory() {
  const { t } = useI18n();
  const b = t.beans;
  const shots: Scene["shots"][] = [
    [{ still: STILLS.beanGreen, focus: "48% 50%" }],
    [{ still: STILLS.beanLight, focus: "70% 50%" }],
    [{ still: STILLS.hero, focus: "72% 50%" }],
    [{ still: STILLS.hero, focus: "60% 50%" }],
    [{ still: STILLS.cup, focus: "50% 50%" }],
  ];
  const steps = [...b.steps, b.final];
  const scenes: Scene[] = steps.map((s, i) => ({
    shots: shots[i],
    kicker: String(i + 1).padStart(2, "0"),
    title: s.title,
    text: s.text,
  }));

  return (
    <CinemaStage
      id="proses"
      labelledBy="proses-title"
      eyebrow={b.eyebrow}
      heading={<h2 id="proses-title">{b.title}</h2>}
      scenes={scenes}
    />
  );
}
