import type { MetadataRoute } from "next";
import { BASE, SITE_ORIGIN } from "@/lib/meta";

export const dynamic = "force-static";

const PAGES = ["", "system/", "menu/", "brand/", "partners/", "privacy/"];
const STATIC = ["ar/", "ar/card/", "ar/table/", "ar/selfie/", "game/", "game/line/", "game/rain/", "game/memory/", "club/"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${SITE_ORIGIN}${BASE}/${p}`;
  const pages = PAGES.flatMap((p) => [
    {
      url: url(p),
      alternates: { languages: { az: url(p), en: url(`en/${p}`), ru: url(`ru/${p}`) } },
    },
  ]);
  return [...pages, ...STATIC.map((p) => ({ url: url(p) }))];
}
