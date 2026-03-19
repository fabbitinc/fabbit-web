import { PartSuppliersTab as PartSuppliersTabView } from "@fabbit/components";
import { usePartSuppliersQuery } from "@/features/parts/hooks/use-part-suppliers-query";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";

interface PartSuppliersTabProps {
  partId: string;
  revisionId: string;
}

export function PartSuppliersTab({ partId, revisionId }: PartSuppliersTabProps) {
  const suppliersQuery = usePartSuppliersQuery(partId, revisionId);
  const isSuppliersTabLoading =
    !suppliersQuery.isFetched && suppliersQuery.fetchStatus === "fetching";
  const showLoadingIndicator = useDelayedVisibilityLogic(
    isSuppliersTabLoading,
  );

  return (
    <PartSuppliersTabView
      isLoading={isSuppliersTabLoading}
      showLoadingIndicator={showLoadingIndicator}
      suppliers={suppliersQuery.data ?? []}
    />
  );
}
