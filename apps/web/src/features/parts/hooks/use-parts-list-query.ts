import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";
import type { ListPartsQueryDto } from "@/features/parts/api/parts.types";

export function usePartsListQuery(query: ListPartsQueryDto) {
  return useQuery(partsQueries.list(query));
}
