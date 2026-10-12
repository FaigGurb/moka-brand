import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { DayAmbient } from "@/components/fx/DayAmbient";
import { LocaleProvider } from "@/i18n/context";
import { DICTS, type Locale } from "@/i18n/dict";

/** Frame for the light /flow/ trial page: its own floating nav (inside the page), the shared footer and smooth scroll. */
export function FlowShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-espresso focus:px-4 focus:py-2 focus:text-paper"
      >
        {DICTS[locale].skip}
      </a>
      <main id="main" lang={locale}>
        {children}
      </main>
      <Footer />
      <SmoothScroll />
      <DayAmbient />
    </LocaleProvider>
  );
}
