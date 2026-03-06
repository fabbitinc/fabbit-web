import { useParams } from "react-router-dom";
import { PartsTemplateAnalysisScreen } from "@/features/part-template-mapping";

export function PartsTemplateAnalysisPage() {
  const { partId } = useParams<{ partId: string }>();

  return <PartsTemplateAnalysisScreen partId={partId} />;
}
