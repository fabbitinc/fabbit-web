import { useParams } from "react-router-dom";
import { PartsTemplateAnalysisScreen } from "@/features/part-template-mapping";
import { toPartRouteId } from "@/features/parts/lib/part-route";

export function PartsTemplateAnalysisPage() {
  const { partNumber, revisionCode } = useParams<{
    partNumber: string;
    revisionCode: string;
  }>();
  const partId = partNumber && revisionCode
    ? toPartRouteId({ partNumber, revisionCode })
    : undefined;

  return <PartsTemplateAnalysisScreen partId={partId} />;
}
