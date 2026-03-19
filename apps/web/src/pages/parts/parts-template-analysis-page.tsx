import { useParams } from "react-router-dom";
import { PartsTemplateAnalysisScreen } from "@/features/part-template-mapping";

export function PartsTemplateAnalysisPage() {
  const { partId, revisionId } = useParams<{
    partId: string;
    revisionId: string;
  }>();

  return <PartsTemplateAnalysisScreen partId={partId} revisionId={revisionId} />;
}
