import { apiClient } from "@/api/client";
import type {
  CreateProjectRequestDto,
  ListProjectsQueryDto,
  ProjectDetailResponseDto,
  ProjectListResponseDto,
} from "@/features/projects-list/api/projects-list.types";
import type {
  ProjectListItemModel,
  ProjectListResultModel,
} from "@/features/projects-list/types/project-list-model";

export async function fetchProjectList(query: ListProjectsQueryDto): Promise<ProjectListResultModel> {
  const response = await apiClient.get<ProjectListResponseDto>("/api/v1/projects", {
    params: query,
  });

  return {
    total: response.data.total,
    offset: response.data.offset,
    limit: response.data.limit,
    items: response.data.items.map(toProjectListItemModel),
  };
}

export async function createProject(request: CreateProjectRequestDto): Promise<ProjectListItemModel> {
  const response = await apiClient.post<ProjectDetailResponseDto>("/api/v1/projects", request);
  return toProjectListItemModel(response.data);
}

function toProjectListItemModel(project: ProjectDetailResponseDto | ProjectListResponseDto["items"][number]): ProjectListItemModel {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    partCount: project.part_count,
    isArchived: project.is_archived,
    createdAt: "created_at" in project ? project.created_at : "",
    updatedAt: "updated_at" in project ? project.updated_at : "",
  };
}
