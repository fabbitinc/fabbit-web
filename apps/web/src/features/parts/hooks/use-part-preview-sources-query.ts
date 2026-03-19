import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartPreviewSourcesQuery(partId: string, revisionId: string, enabled = true) {
  return useQuery({
    ...partsQueries.previewSources(partId, revisionId),
    enabled,
  });
}
