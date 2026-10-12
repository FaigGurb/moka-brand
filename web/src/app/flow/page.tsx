import { FlowShell } from "@/components/pages/FlowShell";
import { FlowPage } from "@/components/pages/FlowPage";
import { FLOW } from "@/i18n/flow";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", FLOW.az.meta.title, FLOW.az.meta.description, "flow/");

export default function Page() {
  return (
    <FlowShell locale="az">
      <FlowPage />
    </FlowShell>
  );
}
