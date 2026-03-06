import type { ApiSuccessResponse } from "@/api/types";

export type DashboardStatsResponseDto = Exclude<
  ApiSuccessResponse<"/api/v1/dashboard/stats", "get">,
  never
>;
