import { PageShell } from "@/components/pages/PageShell";
import { BrandPage } from "@/components/pages/BrandPage";
import { BRAND } from "@/i18n/brand";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", BRAND.az.meta.title, BRAND.az.meta.description, "brand/");

export default function Page() {
  return (
    <PageShell locale="az" sub="brand/">
      <BrandPage />
    </PageShell>
  );
}
