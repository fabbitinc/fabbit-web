import { useQuery } from "@tanstack/react-query";
import { partsUploadQueries } from "@/features/parts/api/parts-upload.queries";

export function usePartsUploadBatchQuery(batchId: string | null) {
  return useQuery({
    ...partsUploadQueries.batchStatus(batchId ?? "__empty__"),
    enabled: Boolean(batchId),
    refetchInterval: (query) => {
      const batchStatus = query.state.data;

      if (!batchStatus) {
        return 1_000;
      }

      return batchStatus.pendingCount === 0 && batchStatus.processingCount === 0 ? false : 1_000;
    },
    refetchIntervalInBackground: true,
  });
}
