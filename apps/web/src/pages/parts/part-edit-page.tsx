import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PartEditScreen } from "@/features/parts/components/part-edit-screen";
import {
  buildPartDetailPath,
  toPartDraftRouteId,
  toPartRevisionDraftRouteId,
} from "@/features/parts/lib/part-route";

export function PartEditPage() {
  const navigate = useNavigate();
  const { partNumber, revisionCode, draftKey } = useParams<{
    partNumber: string;
    revisionCode?: string;
    draftKey?: string;
  }>();

  const partId = !partNumber || !draftKey
    ? null
    : revisionCode
      ? toPartRevisionDraftRouteId({ partNumber, revisionCode, draftKey })
      : toPartDraftRouteId({ partNumber, draftKey });

  if (!partId) {
    return <Navigate replace to="/parts" />;
  }

  return (
    <PartEditScreen
      partId={partId}
      onBack={() => navigate(buildPartDetailPath(partId))}
      onSaved={(part) => navigate(buildPartDetailPath(part.routeId), { replace: true })}
    />
  );
}
