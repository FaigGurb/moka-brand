import { PageShell } from "@/components/pages/PageShell";
import { MenuPage } from "@/components/pages/MenuPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", DICTS.az.menu.meta.title, DICTS.az.menu.meta.description, "menu/");

export default function Page() {
  return (
    <PageShell locale="az" sub="menu/">
      <MenuPage />
    </PageShell>
  );
}
