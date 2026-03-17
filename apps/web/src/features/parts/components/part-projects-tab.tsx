import { PartProjectsTab as PartProjectsTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartProjectsQuery } from "@/features/parts/hooks/use-part-projects-query";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";

interface PartProjectsTabProps {
  partId: string;
}

export function PartProjectsTab({ partId }: PartProjectsTabProps) {
  const navigate = useNavigate();
  const projectsQuery = usePartProjectsQuery(partId);
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
