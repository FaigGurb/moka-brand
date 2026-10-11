import { PageShell } from "@/components/pages/PageShell";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", DICTS.ru.privacy.meta.title, DICTS.ru.privacy.meta.description, "privacy/");

export default function Page() {
  return (
    <PageShell locale="ru" sub="privacy/">
      <PrivacyPage />
    </PageShell>
  );
}
