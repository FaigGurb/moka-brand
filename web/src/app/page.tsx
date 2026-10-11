import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", DICTS.az.meta.title, DICTS.az.meta.description);

export default function Page() {
  return <Site locale="az" />;
}
