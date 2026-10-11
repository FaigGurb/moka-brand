import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOKA Coffee Roastery — Brend təcrübəsi",
  description:
    "MOKA Coffee Roastery üçün konsept korporativ kimlik: 4 hərf, 4 dəmləmə üsulu, 1 xətt. 3D, interaktiv qovurma xətti, AR və mini oyun.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1714",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* League Spartan + Mulish: both cover the full Azerbaijani alphabet (Ə ə Ş ş Ğ ğ İ ı …). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600&family=Mulish:wght@400;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
