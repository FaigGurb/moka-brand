import { Logo } from "./Logo";
import { LINKS } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-espresso text-muted-dark">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 md:grid-cols-[1.3fr_1fr_1fr] md:px-10">
        <div className="flex flex-col gap-4">
          <Logo className="h-6 w-auto self-start text-paper" />
          <p className="max-w-[44ch] text-sm leading-relaxed">
            Konsept / test işi. MOKA Coffee Roastery-nin rəsmi saytı deyil. Mənşə, dad notları və qiymətlər nümunədir.
          </p>
        </div>
        <nav aria-label="Əlavə keçidlər" className="flex flex-col gap-3 text-sm">
          <a className="hover:text-paper" href={LINKS.ar}>AR demo</a>
          <a className="hover:text-paper" href={LINKS.arCard}>AR kartı</a>
          <a className="hover:text-paper" href={LINKS.game}>Xətti tut — mini oyun</a>
          <a className="hover:text-paper" href={LINKS.v1}>Saytın əvvəlki versiyası</a>
        </nav>
        <div className="flex flex-col gap-3 text-sm">
          <span>@mokacoffeebaku</span>
          <span>Dizayn və kod: Faig Gurbanli</span>
          <a className="hover:text-paper" href={LINKS.repo} target="_blank" rel="noopener">Mənbə kodu — GitHub</a>
        </div>
      </div>
    </footer>
  );
}
