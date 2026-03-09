import { useQuery } from "@tanstack/react-query";
import { dashboardQueries } from "@/features/dashboard/api/dashboard.queries";

export function useDashboardQuery() {
  return useQuery(dashboardQueries.stats());
}
