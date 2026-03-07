import {
  createProject as createProjectApiV1ProjectsPost,
  listProjects as listProjectsApiV1ProjectsGet,
} from "@/api/generated/orval/projects/projects";
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
  const response = await listProjectsApiV1ProjectsGet(query);

  return {
    total: response.total,
    offset: response.offset,
    limit: response.limit,
    items: response.items.map(toProjectListItemModel),
  };
}

export async function createProject(request: CreateProjectRequestDto): Promise<ProjectListItemModel> {
  const response = await createProjectApiV1ProjectsPost(request);
  return toProjectListItemModel(response);
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
