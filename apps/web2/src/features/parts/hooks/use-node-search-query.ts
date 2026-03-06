import { useQuery } from "@tanstack/react-query";
import { partsUploadQueries } from "@/features/parts/api/parts-upload.queries";
import type { NodeSearchQueryDto } from "@/features/parts/api/parts-upload.types";

export function useNodeSearchQuery(query: NodeSearchQueryDto, enabled: boolean) {
  return useQuery({
    ...partsUploadQueries.nodeSearch(query),
    enabled,
  });
}
