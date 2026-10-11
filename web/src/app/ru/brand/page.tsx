import { PageShell } from "@/components/pages/PageShell";
import { BrandPage } from "@/components/pages/BrandPage";
import { BRAND } from "@/i18n/brand";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", BRAND.ru.meta.title, BRAND.ru.meta.description, "brand/");

export default function Page() {
  return (
    <PageShell locale="ru" sub="brand/">
      <BrandPage />
    </PageShell>
  );
}
