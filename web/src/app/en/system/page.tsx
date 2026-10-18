import { PageShell } from "@/components/pages/PageShell";
import { SystemPage } from "@/components/pages/SystemPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", DICTS.en.system.meta.title, DICTS.en.system.meta.description, "system/");

export default function Page() {
  return (
    <PageShell locale="en" sub="system/">
      <SystemPage />
    </PageShell>
  );
}
