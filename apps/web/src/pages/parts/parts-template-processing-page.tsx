import { useLocation, useParams } from "react-router-dom";
import { PartsTemplateProcessingScreen } from "@/features/part-template-mapping";
import { toPartRouteId } from "@/features/parts/lib/part-route";

interface TemplatePageLocationState {
  fileName?: string;
}

export function PartsTemplateProcessingPage() {
  const { partNumber, revisionCode } = useParams<{
    partNumber: string;
    revisionCode: string;
  }>();
  const location = useLocation();
  const state = (location.state as TemplatePageLocationState | null) ?? null;
  const partId = partNumber && revisionCode
    ? toPartRouteId({ partNumber, revisionCode })
    : undefined;

  return <PartsTemplateProcessingScreen partId={partId} fileName={state?.fileName} />;
}
