import { PartBomTab as PartBomTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartBomQuery } from "@/features/parts/hooks/use-part-bom-query";
import { buildPartBomPath } from "@/features/parts/lib/part-route";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";

interface PartBomTabProps {
  partId: string;
  revisionId: string;
}

export function PartBomTab({ partId, revisionId }: PartBomTabProps) {
  const navigate = useNavigate();
  const bomQuery = usePartBomQuery(partId, revisionId);
  const isBomTabLoading = !bomQuery.isFetched && bomQuery.fetchStatus === "fetching";
  const showLoadingIndicator = useDelayedVisibilityLogic(
    isBomTabLoading,
  );

  return (
    <PartBomTabView
      childrenItems={bomQuery.data?.children ?? []}
      parentItems={bomQuery.data?.parents ?? []}
      isLoading={isBomTabLoading}
      showLoadingIndicator={showLoadingIndicator}
      onExploreDirectionChange={(direction) => {
        if (direction === "forward") {
          navigate(buildPartBomPath(partId, revisionId));
          return;
        }

        navigate(`${buildPartBomPath(partId, revisionId)}?direction=reverse`);
      }}
    />
  );
}
