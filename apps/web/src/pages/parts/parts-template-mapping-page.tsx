import { useLocation, useParams } from "react-router-dom";
import { PartsTemplateMappingScreen } from "@/features/part-template-mapping";

interface TemplatePageLocationState {
  fileName?: string;
}

export function PartsTemplateMappingPage() {
  const { partId } = useParams<{ partId: string }>();
  const location = useLocation();
  const state = (location.state as TemplatePageLocationState | null) ?? null;

  return <PartsTemplateMappingScreen partId={partId} fileName={state?.fileName} />;
}
