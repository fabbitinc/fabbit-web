import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartRevisionDiffQuery(
  partId: string,
  revisionId: string | null,
  baseRevisionId: string | null,
  enabled = true,
) {
  return useQuery({
    ...partsQueries.revisionDiff(
      partId,
      revisionId ?? "",
      baseRevisionId ?? "",
    ),
    enabled:
      enabled &&
      partId.length > 0 &&
      revisionId != null &&
      baseRevisionId != null &&
      revisionId !== baseRevisionId,
  });
}
