import { PageShell } from "@/components/pages/PageShell";
import { PartnersPage } from "@/components/pages/PartnersPage";
import { PARTNER_PAGE } from "@/i18n/partners";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", PARTNER_PAGE.az.meta.title, PARTNER_PAGE.az.meta.description, "partners/");

export default function Page() {
  return (
    <PageShell locale="az" sub="partners/">
      <PartnersPage />
    </PageShell>
  );
}
