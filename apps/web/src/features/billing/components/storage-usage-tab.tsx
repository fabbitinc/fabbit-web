import { useMemo } from "react";
import { StorageUsagePanel } from "@fabbit/components";
import { Loader2 } from "lucide-react";
import { useStorageUsageQuery } from "@/features/billing/hooks/use-storage-usage-query";
import { generateStorageCategoryTrend } from "@/features/billing/mock-data/usage-mock";

export function StorageUsageTab() {
  const storageTrend = useMemo(() => generateStorageCategoryTrend(365), []);
  const storageUsageQuery = useStorageUsageQuery();

  if (storageUsageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!storageUsageQuery.data) {
    return null;
  }

  return <StorageUsagePanel trend={storageTrend} usage={storageUsageQuery.data} />;
}
