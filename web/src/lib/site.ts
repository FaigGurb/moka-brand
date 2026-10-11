// Links to the static pages that live beside the Next.js export (AR demo, game, previous site).
import type { Locale } from "@/i18n/dict";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function links(locale: Locale) {
  const q = locale === "az" ? "" : `?lang=${locale}`;
  return {
    ar: `${base}/ar/${q}`,
    arCard: `${base}/ar/target.png`,
    game: `${base}/game/${q}`,
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

export const NAV_IDS = ["#konsepsiya", "#reng", "#qovurma", "#paket", "#kafe", "#tecrube"] as const;
