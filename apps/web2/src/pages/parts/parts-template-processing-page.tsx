import { useLocation, useParams } from "react-router-dom";
import { PartsTemplateProcessingScreen } from "@/features/part-template-mapping";

interface TemplatePageLocationState {
  fileName?: string;
}

export function PartsTemplateProcessingPage() {
  const { partId } = useParams<{ partId: string }>();
  const location = useLocation();
  const state = (location.state as TemplatePageLocationState | null) ?? null;

  return <PartsTemplateProcessingScreen partId={partId} fileName={state?.fileName} />;
}
