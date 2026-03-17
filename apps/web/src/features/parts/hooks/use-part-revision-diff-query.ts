import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartRevisionDiffQuery(
  partNumber: string,
  revisionCode: string | null,
  baseRevisionCode: string | null,
  enabled = true,
) {
  return useQuery({
    ...partsQueries.revisionDiff(
      partNumber,
      revisionCode ?? "",
      baseRevisionCode ?? "",
    ),
    enabled:
      enabled &&
      partNumber.length > 0 &&
      revisionCode != null &&
      baseRevisionCode != null &&
      revisionCode !== baseRevisionCode,
  });
}
