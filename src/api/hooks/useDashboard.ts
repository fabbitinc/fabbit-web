import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../dashboard";

export const DASHBOARD_STATS_QUERY_KEY = ["dashboardStats"] as const;

/** 대시보드 통계 조회 훅 */
export function useDashboardStats() {
  return useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: getDashboardStats,
  });
}
