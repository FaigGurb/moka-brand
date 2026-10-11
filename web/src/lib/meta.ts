import type { Metadata } from "next";
import type { Locale } from "@/i18n/dict";

/**
 * Site-wide publishing switches.
 * - NEXT_PUBLIC_SITE_URL: origin of the live site (custom domain later).
 * - NEXT_PUBLIC_CONCEPT: while "true" (default) pages ask search engines not to index them,
 *   so the concept never competes with MOKA's real presence. Set to "false" once approved.
 */
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://faiggurb.github.io";
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const CONCEPT = process.env.NEXT_PUBLIC_CONCEPT !== "false";

const OG_LOCALE: Record<Locale, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU" };
const prefix = (l: Locale) => (l === "az" ? "" : `/${l}`);

/** Metadata for a page that exists in all three languages; `sub` is e.g. "menu/". */
export function pageMeta(locale: Locale, title: string, description: string, sub = ""): Metadata {
  const path = (l: Locale) => `${BASE}${prefix(l)}/${sub}`;
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description,
    alternates: {
      canonical: path(locale),
      languages: { az: path("az"), en: path("en"), ru: path("ru"), "x-default": path("az") },
    },
    openGraph: {
      type: "website",
      url: path(locale),
      siteName: "MOKA Coffee Roastery",
      title,
      description,
      locale: OG_LOCALE[locale],
      images: [{ url: `${BASE}/og-${locale}.png`, width: 1200, height: 630, alt: "MOKA — 4 / 4 / 1" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/og-${locale}.png`] },
    robots: CONCEPT ? { index: false, follow: false } : { index: true, follow: true },
    manifest: `${BASE}/manifest.webmanifest`,
  };
}
