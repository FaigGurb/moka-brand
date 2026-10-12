import type { MetadataRoute } from "next";
import { BASE } from "@/lib/meta";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MOKA Roastery & Eatery",
    short_name: "MOKA",
    description: "4 hərf · 4 dəmləmə · 1 xətt",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#1B1714",
    theme_color: "#1B1714",
    icons: [
      { src: `${BASE}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
