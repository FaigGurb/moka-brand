import { PageShell } from "@/components/pages/PageShell";
import { SystemPage } from "@/components/pages/SystemPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", DICTS.ru.system.meta.title, DICTS.ru.system.meta.description, "system/");

export default function Page() {
  return (
    <PageShell locale="ru" sub="system/">
      <SystemPage />
    </PageShell>
  );
}
