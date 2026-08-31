import { WorkflowPanel } from "@/components/techpack/panels/workflow-panel";
import { getWorkflow } from "@/lib/data/libraries";

export default async function Section() {
  const content = await getWorkflow("sampling");
  return <WorkflowPanel section="sampling" content={content} />;
}
