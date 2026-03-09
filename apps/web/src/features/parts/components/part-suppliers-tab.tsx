import { PartSuppliersTab as PartSuppliersTabView } from "@fabbit/components";
import { usePartSuppliersQuery } from "@/features/parts/hooks/use-part-suppliers-query";

interface PartSuppliersTabProps {
  partId: string;
}

export function PartSuppliersTab({ partId }: PartSuppliersTabProps) {
  const suppliersQuery = usePartSuppliersQuery(partId);

  return (
    <PartSuppliersTabView
      isLoading={suppliersQuery.isLoading}
      suppliers={suppliersQuery.data ?? []}
    />
  );
}
