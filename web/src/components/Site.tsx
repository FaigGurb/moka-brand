import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { Concept } from "@/components/sections/Concept";
import { BeanStory } from "@/components/sections/BeanStory";
import { BrewGuide } from "@/components/sections/BrewGuide";
import { Apps } from "@/components/sections/Apps";
import { DayPalette } from "@/components/sections/DayPalette";
import { Roast } from "@/components/sections/Roast";
import { Tiers } from "@/components/sections/Tiers";
import { Partners } from "@/components/sections/Partners";
import { Store } from "@/components/sections/Store";
import { Experience, FinalCta } from "@/components/sections/Experience";
import { ScrollRefresh } from "@/components/ScrollRefresh";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { DayAmbient } from "@/components/fx/DayAmbient";
import { ScrollLine } from "@/components/fx/ScrollLine";
import { Marquee } from "@/components/fx/Marquee";
import { LocaleProvider } from "@/i18n/context";
import { DICTS, type Locale } from "@/i18n/dict";

/** The whole one-page site in a given language. */
export function Site({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#konsepsiya"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-espresso"
      >
        {DICTS[locale].skip}
      </a>
      <Nav />
      <main lang={locale}>
        <Hero />
        <Concept />
        <BeanStory />
        <DayPalette />
        <Roast />
        <BrewGuide />
        <Partners />
        <Tiers />
        <Store />
        <Marquee />
        <Apps />
        <Experience />
        <FinalCta />
      </main>
      <Footer />
      <ScrollRefresh />
      <SmoothScroll />
      <ScrollLine />
      <Cursor />
      <DayAmbient />
      <div className="grain" aria-hidden="true" />
      <Preloader />
    </LocaleProvider>
  );
}
