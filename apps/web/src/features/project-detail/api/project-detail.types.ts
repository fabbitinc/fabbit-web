import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type ProjectDetailResponseDto = ResponseOf<"/api/v1/projects/{projectId}", "get">;
export type UpdateProjectRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}", "patch">;
type IssueListItemResponseDto = ResponseOf<"/api/v1/issues", "get">["items"][number];
type EngineeringChangeListItemResponseDto = ResponseOf<"/api/v1/engineering-changes", "get">["items"][number];

export interface ProjectIssueListResponseDto {
  open_count?: number | null;
  closed_count?: number | null;
  total?: number | null;
  offset?: number | null;
  limit?: number | null;
  items: IssueListItemResponseDto[];
}

export interface ProjectChangeListResponseDto {
  open_count?: number | null;
  closed_count?: number | null;
  total?: number | null;
  offset?: number | null;
  limit?: number | null;
  items: EngineeringChangeListItemResponseDto[];
}

export type ProjectActivitiesQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{projectId}/histories", "get">["query"]
>;
export type ProjectActivitiesResponseDto = ResponseOf<"/api/v1/projects/{projectId}/histories", "get">;

export type ProjectMemberLookupQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{projectId}/members/lookup", "get">["query"]
>;
export type ProjectMemberLookupResponseDto = ResponseOf<"/api/v1/projects/{projectId}/members/lookup", "get">;
export type ProjectMemberListResponseDto = ResponseOf<"/api/v1/projects/{projectId}/members", "get">;
export type AddProjectMembersRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/members", "post">;
export type AddProjectMembersResponseDto = ResponseOf<"/api/v1/projects/{projectId}/members", "post">;
export type RemoveProjectMembersRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/members", "delete">;

export type ProjectPartLookupQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{projectId}/parts/lookup", "get">["query"]
>;
export type ProjectPartLookupResponseDto = ResponseOf<"/api/v1/projects/{projectId}/parts/lookup", "get">;
export type ProjectPartsQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{projectId}/parts", "get">["query"]
>;
export type ProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{projectId}/parts", "get">;
export type LinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/parts", "post">;
export type LinkProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{projectId}/parts", "post">;
export type UnlinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/parts", "delete">;
