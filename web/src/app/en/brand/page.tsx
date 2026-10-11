import { PageShell } from "@/components/pages/PageShell";
import { BrandPage } from "@/components/pages/BrandPage";
import { BRAND } from "@/i18n/brand";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", BRAND.en.meta.title, BRAND.en.meta.description, "brand/");

export default function Page() {
  return (
    <PageShell locale="en" sub="brand/">
      <BrandPage />
    </PageShell>
  );
}
