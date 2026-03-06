import { useQuery } from "@tanstack/react-query";
import { usageQueries } from "@/features/billing/api/usage.queries";

export function useStorageUsageQuery() {
  return useQuery(usageQueries.storage());
}
