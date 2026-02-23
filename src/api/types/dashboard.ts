// --- Dashboard API 타입 ---

export interface PartStats {
  total: number;
  added_this_week: number;
}

export interface BomStats {
  total: number;
}

export interface LastSynthesis {
  job_id: string;
  status: string;
  completed_at: string | null;
  nodes_created: number;
  relationships_created: number;
}

export interface DashboardStatsResponse {
  parts: PartStats;
  bom_links: BomStats;
  last_synthesis: LastSynthesis | null;
}
