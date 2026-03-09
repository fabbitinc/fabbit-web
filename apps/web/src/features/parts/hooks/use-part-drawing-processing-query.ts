import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartDrawingProcessingQuery(
  drawingId: string | null,
  enabled = true,
) {
  return useQuery({
    ...partsQueries.drawingProcessing(drawingId ?? "__empty__"),
    enabled: Boolean(drawingId) && enabled,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (!status) {
        return 1_000;
      }

      return status === "COMPLETED" || status === "FAILED" ? false : 1_000;
    },
    refetchIntervalInBackground: true,
  });
}
