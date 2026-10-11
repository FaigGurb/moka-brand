import { PageShell } from "@/components/pages/PageShell";
import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", DICTS.en.privacy.meta.title, DICTS.en.privacy.meta.description, "privacy/");

export default function Page() {
  return (
    <PageShell locale="en" sub="privacy/">
      <PrivacyPage />
    </PageShell>
  );
}
