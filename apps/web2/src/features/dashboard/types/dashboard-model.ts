export interface DashboardStatsModel {
  parts: {
    total: number;
    addedThisWeek: number;
  };
  bomLinks: {
    total: number;
  };
  lastSynthesis: {
    jobId: string;
    status: string;
    completedAt: string | null;
    nodesCreated: number;
    relationshipsCreated: number;
  } | null;
}
