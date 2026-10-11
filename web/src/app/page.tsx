import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { Concept } from "@/components/sections/Concept";
import { DayPalette } from "@/components/sections/DayPalette";
import { Roast } from "@/components/sections/Roast";
import { Tiers } from "@/components/sections/Tiers";
import { Store } from "@/components/sections/Store";
import { Experience, FinalCta } from "@/components/sections/Experience";
import { ScrollRefresh } from "@/components/ScrollRefresh";

export default function Home() {
  return (
    <>
      <a
        href="#konsepsiya"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-espresso"
      >
        Məzmuna keç
      </a>
      <Nav />
      <main>
        <Hero />
        <Concept />
        <DayPalette />
        <Roast />
        <Tiers />
        <Store />
        <Experience />
        <FinalCta />
      </main>
      <Footer />
      <ScrollRefresh />
    </>
  );
}
