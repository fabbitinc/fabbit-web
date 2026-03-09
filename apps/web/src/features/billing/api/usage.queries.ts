import { queryOptions } from "@tanstack/react-query";
import { fetchCreditUsage, fetchStorageUsage } from "@/features/billing/api/usage.api";

export const usageQueries = {
  storage: () =>
    queryOptions({
      queryKey: ["billing", "usage", "storage"],
      queryFn: fetchStorageUsage,
      staleTime: 60_000,
    }),
  credits: () =>
    queryOptions({
      queryKey: ["billing", "usage", "credits"],
      queryFn: fetchCreditUsage,
      staleTime: 60_000,
    }),
};
