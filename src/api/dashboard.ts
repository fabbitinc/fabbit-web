import { apiClient } from "./client";
import type { DashboardStatsResponse } from "./types/dashboard";

/** 대시보드 통계 조회 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  const response = await apiClient.get<DashboardStatsResponse>(
    "/api/v1/dashboard/stats",
  );
  return response.data;
}
