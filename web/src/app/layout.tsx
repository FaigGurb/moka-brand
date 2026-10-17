import type { Metadata, Viewport } from "next";
// Self-hosted fonts (no request to Google): League Spartan + Mulish cover the whole Azerbaijani
// alphabet and ₼; Montserrat only supplies Cyrillic for Russian headings (unicode-range keeps
// its Latin files from downloading).
import "@fontsource-variable/league-spartan/wght.css";
import "@fontsource-variable/mulish/wght.css";
import "@fontsource-variable/montserrat/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOKA Roastery & Eatery",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
