import { PartProjectsTab as PartProjectsTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartProjectsQuery } from "@/features/parts/hooks/use-part-projects-query";

interface PartProjectsTabProps {
  partId: string;
}

export function PartProjectsTab({ partId }: PartProjectsTabProps) {
  const navigate = useNavigate();
  const projectsQuery = usePartProjectsQuery(partId);

  return (
    <PartProjectsTabView
      isLoading={projectsQuery.isLoading}
      projects={projectsQuery.data ?? []}
      onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
}
