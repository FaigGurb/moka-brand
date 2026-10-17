import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollLine } from "@/components/fx/ScrollLine";
import { Cursor } from "@/components/fx/Cursor";
import { DayAmbient } from "@/components/fx/DayAmbient";
import { LocaleProvider } from "@/i18n/context";
import { DICTS, type Locale } from "@/i18n/dict";

/** Frame for secondary pages (menu, privacy): same nav, footer and smooth scroll as the home page. */
export function PageShell({ locale, sub, children }: { locale: Locale; sub: string; children: ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-espresso"
      >
        {DICTS[locale].skip}
      </a>
      <Nav sub={sub} />
      {/* the brand book documents the espresso token; the other pages use MOKA's neutral black */}
      <main id="main" lang={locale} className={sub.startsWith("brand") ? undefined : "tone-ink"}>
        {children}
      </main>
      <Footer />
      <SmoothScroll />
      <ScrollLine />
      <Cursor />
      <DayAmbient />
      <div className="grain" aria-hidden="true" />
    </LocaleProvider>
  );
}
