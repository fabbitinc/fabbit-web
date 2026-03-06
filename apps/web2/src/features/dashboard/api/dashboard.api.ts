import { getDashboardStatsApiV1DashboardStatsGet } from "@/api/generated/orval/dashboard/dashboard";
import type { DashboardStatsResponseDto } from "@/features/dashboard/api/dashboard.types";
import type { DashboardStatsModel } from "@/features/dashboard/types/dashboard-model";

export async function fetchDashboardStats() {
  const response = await getDashboardStatsApiV1DashboardStatsGet();
  return toDashboardStatsModel(response);
}

function toDashboardStatsModel(response: DashboardStatsResponseDto): DashboardStatsModel {
  return {
    parts: {
      total: response.parts.total,
      addedThisWeek: response.parts.added_this_week,
    },
    bomLinks: {
      total: response.bom_links.total,
    },
    lastSynthesis: response.last_synthesis
      ? {
          jobId: response.last_synthesis.job_id,
          status: response.last_synthesis.status,
          completedAt: response.last_synthesis.completed_at,
          nodesCreated: response.last_synthesis.nodes_created,
          relationshipsCreated: response.last_synthesis.relationships_created,
        }
      : null,
  };
}
