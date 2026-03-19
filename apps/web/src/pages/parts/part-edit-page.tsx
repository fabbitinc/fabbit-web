import { Navigate, useNavigate, useParams } from "react-router-dom";
import { PartEditScreen } from "@/features/parts/components/part-edit-screen";
import { buildPartDetailPath } from "@/features/parts/lib/part-route";

export function PartEditPage() {
  const navigate = useNavigate();
  const { partId, revisionId } = useParams<{
    partId: string;
    revisionId: string;
  }>();

  if (!partId || !revisionId) {
    return <Navigate replace to="/parts" />;
  }

  return (
    <PartEditScreen
      partId={partId}
      revisionId={revisionId}
      onBack={() => navigate(buildPartDetailPath(partId, revisionId))}
      onSaved={(part) => navigate(buildPartDetailPath(part.partId, part.revisionId), { replace: true })}
    />
  );
}
