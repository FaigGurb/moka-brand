import { PageShell } from "@/components/pages/PageShell";
import { MenuPage } from "@/components/pages/MenuPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", DICTS.ru.menu.meta.title, DICTS.ru.menu.meta.description, "menu/");

export default function Page() {
  return (
    <PageShell locale="ru" sub="menu/">
      <MenuPage />
    </PageShell>
  );
}
