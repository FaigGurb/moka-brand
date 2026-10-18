import { PageShell } from "@/components/pages/PageShell";
import { SystemPage } from "@/components/pages/SystemPage";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", DICTS.az.system.meta.title, DICTS.az.system.meta.description, "system/");

export default function Page() {
  return (
    <PageShell locale="az" sub="system/">
      <SystemPage />
    </PageShell>
  );
}
