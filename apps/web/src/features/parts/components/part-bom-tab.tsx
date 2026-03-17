import { PartBomTab as PartBomTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartBomQuery } from "@/features/parts/hooks/use-part-bom-query";
import { buildPartBomPath, buildPartDetailPath } from "@/features/parts/lib/part-route";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";

interface PartBomTabProps {
  partId: string;
}

export function PartBomTab({ partId }: PartBomTabProps) {
  const navigate = useNavigate();
  const bomQuery = usePartBomQuery(partId);
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
          navigate(buildPartBomPath(partId));
          return;
        }

        navigate(`${buildPartBomPath(partId)}?direction=reverse`);
      }}
      onPartClick={(nextPartId) => navigate(buildPartDetailPath(nextPartId))}
    />
  );
}
