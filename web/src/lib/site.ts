// Links to the static pages that live beside the Next.js export (AR demo, game, previous site).
import type { Locale } from "@/i18n/dict";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const HOME_OF = (l: Locale) => (l === "az" ? `${base}/` : `${base}/${l}/`);

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
    menu: `${HOME_OF(locale)}menu/`,
    privacy: `${HOME_OF(locale)}privacy/`,
    brand: `${HOME_OF(locale)}brand/`,
    partners: `${HOME_OF(locale)}partners/`,
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

export const NAV_IDS = ["#qovurma", "#demleme", "#paket", "#konsepsiya", "#reng", "#terefdas", "#tetbiq", "#tecrube"] as const;

/** Public contact data (Google Business profile, checked October 2026). Address text lives in the dictionary. */
export const CONTACT = {
  phone: "+994 51 244 13 01",
  tel: "+994512441301",
  instagram: "https://www.instagram.com/mokacoffeebaku/",
  handle: "@mokacoffeebaku",
  map: "https://www.google.com/maps/search/?api=1&query=Moka%20Roastery%20%26%20Eatery%20Baku&query_place_id=ChIJL6Brz9F9MEARotxfDuTLpRQ",
  geo: [40.36972, 49.83465] as const,
};

/**
 * The two cafés, in the order MOKA lists them on Instagram. Addresses, phones and hours come from
 * MOKA's own posts and its Google Business profiles (checked October 2026); the copy (address,
 * landmark, hours) lives in `dict.ts` under `contact.places` in the same order.
 */
export const LOCATIONS = [
  { id: "nizami", phone: CONTACT.phone, tel: CONTACT.tel, map: CONTACT.map },
  { id: "parkview", phone: "+994 51 244 13 02", tel: "+994512441302", map: "https://maps.app.goo.gl/CGsgys3P2HSYjH9k8" },
] as const;

/**
 * Italian brands MOKA distributes officially in Azerbaijan, in the order of a cup's path
 * (bean → grind → espresso → syrup → showcase). Facts come from each brand's own site.
 */
export const PARTNERS = [
  { id: "pitti", name: "Pitti Caffè", url: "https://www.pitticaffe.com/", host: "pitticaffe.com" },
  { id: "mazzer", name: "Mazzer", url: "https://www.mazzer.com/", host: "mazzer.com" },
  { id: "elektra", name: "Elektra", url: "https://elektracoffee.com/", host: "elektracoffee.com" },
  { id: "odk", name: "ODK", url: "https://orsadrinks.com/en/", host: "orsadrinks.com" },
  { id: "isa", name: "ISA", url: "https://www.isaitaly.com/en/", host: "isaitaly.com" },
] as const;
