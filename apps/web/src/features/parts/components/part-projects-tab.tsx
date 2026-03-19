import { PartProjectsTab as PartProjectsTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartProjectsQuery } from "@/features/parts/hooks/use-part-projects-query";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";

interface PartProjectsTabProps {
  partId: string;
  revisionId: string;
}

export function PartProjectsTab({ partId, revisionId }: PartProjectsTabProps) {
  const navigate = useNavigate();
  const projectsQuery = usePartProjectsQuery(partId, revisionId);
  const isProjectsTabLoading =
    !projectsQuery.isFetched && projectsQuery.fetchStatus === "fetching";
  const showLoadingIndicator = useDelayedVisibilityLogic(
    isProjectsTabLoading,
  );

  return (
    <PartProjectsTabView
      isLoading={isProjectsTabLoading}
      showLoadingIndicator={showLoadingIndicator}
      projects={projectsQuery.data ?? []}
      onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
}
