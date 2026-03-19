import { useLocation, useParams } from "react-router-dom";
import { PartsTemplateProcessingScreen } from "@/features/part-template-mapping";

interface TemplatePageLocationState {
  fileName?: string;
}

export function PartsTemplateProcessingPage() {
  const { partId, revisionId } = useParams<{
    partId: string;
    revisionId: string;
  }>();
  const location = useLocation();
  const state = (location.state as TemplatePageLocationState | null) ?? null;

  return <PartsTemplateProcessingScreen partId={partId} revisionId={revisionId} fileName={state?.fileName} />;
}
