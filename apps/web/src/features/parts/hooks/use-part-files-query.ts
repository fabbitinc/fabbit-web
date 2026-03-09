import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartFilesQuery(partId: string, enabled = true) {
  return useQuery({
    ...partsQueries.files(partId),
    enabled,
  });
}
