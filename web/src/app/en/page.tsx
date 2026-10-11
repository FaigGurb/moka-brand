import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("en", DICTS.en.meta.title, DICTS.en.meta.description);

export default function Page() {
  return <Site locale="en" />;
}
