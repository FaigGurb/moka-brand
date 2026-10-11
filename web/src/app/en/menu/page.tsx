import { PageShell } from "@/components/pages/PageShell";
import { MenuPage } from "@/components/pages/MenuPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", DICTS.en.menu.meta.title, DICTS.en.menu.meta.description, "menu/");

export default function Page() {
  return (
    <PageShell locale="en" sub="menu/">
      <MenuPage />
    </PageShell>
  );
}
