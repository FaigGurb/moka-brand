// Links to the static pages that live beside the Next.js export (AR demo, game, previous site).
import type { Locale } from "@/i18n/dict";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function links(locale: Locale) {
  const q = locale === "az" ? "" : `?lang=${locale}`;
  return {
    ar: `${base}/ar/${q}`,
    arScan: `${base}/ar/card/${q}`,
    arTable: `${base}/ar/table/${q}`,
    arSelfie: `${base}/ar/selfie/${q}`,
    arCard: `${base}/ar/target.png`,
    game: `${base}/game/${q}`,
    gameLine: `${base}/game/line/${q}`,
    gameRain: `${base}/game/rain/${q}`,
    gameMemory: `${base}/game/memory/${q}`,
    club: `${base}/club/${q}`,
    v1: `${base}/v1/`,
    repo: "https://github.com/FaigGurb/moka-brand",
  };
}

/** Home page of each language. */
export const HOME: Record<Locale, string> = {
  az: `${base}/`,
  en: `${base}/en/`,
  ru: `${base}/ru/`,
};

export const NAV_IDS = ["#konsepsiya", "#reng", "#qovurma", "#demleme", "#paket", "#kafe", "#tetbiq", "#tecrube"] as const;
