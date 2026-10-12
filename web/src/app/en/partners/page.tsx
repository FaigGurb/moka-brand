import { PageShell } from "@/components/pages/PageShell";
import { PartnersPage } from "@/components/pages/PartnersPage";
import { PARTNER_PAGE } from "@/i18n/partners";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", PARTNER_PAGE.en.meta.title, PARTNER_PAGE.en.meta.description, "partners/");

export default function Page() {
  return (
    <PageShell locale="en" sub="partners/">
      <PartnersPage />
    </PageShell>
  );
}
