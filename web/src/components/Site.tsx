import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { Concept } from "@/components/sections/Concept";
import { Bar } from "@/components/sections/Bar";
import { BeanStory } from "@/components/sections/BeanStory";
import { BrewGuide } from "@/components/sections/BrewGuide";
import { Roast } from "@/components/sections/Roast";
import { Tiers } from "@/components/sections/Tiers";
import { Partners } from "@/components/sections/Partners";
import { Store } from "@/components/sections/Store";
import { FinalCta } from "@/components/sections/Experience";
import { SystemTeaser } from "@/components/sections/SystemTeaser";
import { ScrollRefresh } from "@/components/ScrollRefresh";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/fx/Preloader";
import { Cursor } from "@/components/fx/Cursor";
import { DayAmbient } from "@/components/fx/DayAmbient";
import { ScrollLine } from "@/components/fx/ScrollLine";
import { BackToTop } from "@/components/fx/BackToTop";
import { HeadingReveal } from "@/components/fx/HeadingReveal";
import { ToneBand } from "@/components/fx/ToneShift";
import { LocaleProvider } from "@/i18n/context";
import { DICTS, type Locale } from "@/i18n/dict";

/** The whole one-page site in a given language. */
export function Site({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale}>
      <a
        href="#proses"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-espresso"
      >
        {DICTS[locale].skip}
      </a>
      <Nav />
      <main lang={locale}>
        {/* the coffee film runs under the hero, its chapters and the roast, brewing and packaging sections */}
        <ToneBand tone="ink">
          <BeanStory lead={<Hero />} roast={<Roast />} brew={<BrewGuide />} packs={<Tiers />} />
        </ToneBand>
        <ToneBand tone="ink">
          <Bar />
        </ToneBand>
        <ToneBand tone="paper">
          <Concept />
          <Partners />
        </ToneBand>
        <ToneBand tone="ink">
          <Store />
          <SystemTeaser />
          <FinalCta />
        </ToneBand>
      </main>
      <Footer />
      <ScrollRefresh />
      <SmoothScroll />
      <ScrollLine />
      <BackToTop label={DICTS[locale].final.top} />
      <HeadingReveal />
      <Cursor />
      <DayAmbient />
      <div className="grain" aria-hidden="true" />
      <Preloader />
    </LocaleProvider>
  );
}
