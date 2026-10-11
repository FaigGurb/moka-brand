import { PageShell } from "@/components/pages/PageShell";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", DICTS.az.privacy.meta.title, DICTS.az.privacy.meta.description, "privacy/");

export default function Page() {
  return (
    <PageShell locale="az" sub="privacy/">
      <PrivacyPage />
    </PageShell>
  );
}
