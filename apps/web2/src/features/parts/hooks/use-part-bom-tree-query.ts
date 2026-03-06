import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";
import type { PartBomDirection } from "@/features/parts/types/parts-model";

export function usePartBomTreeQuery(partId: string, direction: PartBomDirection, enabled = true) {
  return useQuery({
    ...partsQueries.bomTree(partId, { direction }),
    enabled,
  });
}
