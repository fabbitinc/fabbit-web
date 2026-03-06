import { useQuery } from "@tanstack/react-query";
import { partsQueries } from "@/features/parts/api/parts.queries";

export function usePartFilterOptionsQuery() {
  return useQuery(partsQueries.filterOptions());
}
