import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", DICTS.ru.meta.title, DICTS.ru.meta.description);

export default function Page() {
  return <Site locale="ru" />;
}
