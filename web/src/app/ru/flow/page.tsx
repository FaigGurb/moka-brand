import { FlowShell } from "@/components/pages/FlowShell";
import { FlowPage } from "@/components/pages/FlowPage";
import { FLOW } from "@/i18n/flow";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("ru", FLOW.ru.meta.title, FLOW.ru.meta.description, "flow/");

export default function Page() {
  return (
    <FlowShell locale="ru">
      <FlowPage />
    </FlowShell>
  );
}
