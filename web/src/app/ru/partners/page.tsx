import { PageShell } from "@/components/pages/PageShell";
import { PartnersPage } from "@/components/pages/PartnersPage";
import { PARTNER_PAGE } from "@/i18n/partners";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", PARTNER_PAGE.ru.meta.title, PARTNER_PAGE.ru.meta.description, "partners/");

export default function Page() {
  return (
    <PageShell locale="ru" sub="partners/">
      <PartnersPage />
    </PageShell>
  );
}
