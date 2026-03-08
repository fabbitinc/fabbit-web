import { PartBomTab as PartBomTabView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartBomQuery } from "@/features/parts/hooks/use-part-bom-query";

interface PartBomTabProps {
  partId: string;
}

export function PartBomTab({ partId }: PartBomTabProps) {
  const navigate = useNavigate();
  const bomQuery = usePartBomQuery(partId);

  return (
    <PartBomTabView
      childrenItems={bomQuery.data?.children ?? []}
      parentItems={bomQuery.data?.parents ?? []}
      isLoading={bomQuery.isLoading}
      onExploreDirectionChange={(direction) => {
        if (direction === "forward") {
          navigate(`/parts/${partId}/bom`);
          return;
        }

        navigate(`/parts/${partId}/bom?direction=reverse`);
      }}
      onPartClick={(nextPartId) => navigate(`/parts/${nextPartId}`)}
    />
  );
}
