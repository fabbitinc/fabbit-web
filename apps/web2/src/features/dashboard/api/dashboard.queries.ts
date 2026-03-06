import { queryOptions } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/features/dashboard/api/dashboard.api";

export const dashboardQueries = {
  stats: () =>
    queryOptions({
      queryKey: ["dashboard", "stats"],
      queryFn: fetchDashboardStats,
      staleTime: 60_000,
    }),
};
