// GET /api/v1/projects/{project_id}/labels
export interface LabelDto {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  createdBy: string | null;
}

export interface LabelListResponse {
  total: number;
  items: LabelDto[];
}

// POST /api/v1/projects/{project_id}/labels
export interface CreateLabelRequest {
  name: string;
  description?: string | null;
  color: string;
}

// PATCH /api/v1/projects/{project_id}/labels/{label_id}
export interface UpdateLabelRequest {
  name?: string | null;
  description?: string | null;
  color?: string | null;
}
