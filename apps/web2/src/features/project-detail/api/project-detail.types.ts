import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type ProjectDetailResponseDto = ResponseOf<"/api/v1/projects/{project_id}", "get">;
export type UpdateProjectRequestDto = ApiRequestBody<"/api/v1/projects/{project_id}", "patch">;

export type ProjectActivitiesQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{project_id}/activities", "get">["query"]
>;
export type ProjectActivitiesResponseDto = ResponseOf<"/api/v1/projects/{project_id}/activities", "get">;

export type ProjectMemberLookupQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{project_id}/members/lookup", "get">["query"]
>;
export type ProjectMemberLookupResponseDto = ResponseOf<"/api/v1/projects/{project_id}/members/lookup", "get">;
export type ProjectMemberListResponseDto = ResponseOf<"/api/v1/projects/{project_id}/members", "get">;
export type AddProjectMembersRequestDto = ApiRequestBody<"/api/v1/projects/{project_id}/members", "post">;
export type AddProjectMembersResponseDto = ResponseOf<"/api/v1/projects/{project_id}/members", "post">;
export type RemoveProjectMembersRequestDto = ApiRequestBody<"/api/v1/projects/{project_id}/members", "delete">;

export type ProjectPartLookupQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{project_id}/parts/lookup", "get">["query"]
>;
export type ProjectPartLookupResponseDto = ResponseOf<"/api/v1/projects/{project_id}/parts/lookup", "get">;
export type ProjectPartsQueryDto = NonNullable<
  ApiParameters<"/api/v1/projects/{project_id}/parts", "get">["query"]
>;
export type ProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{project_id}/parts", "get">;
export type LinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{project_id}/parts", "post">;
export type LinkProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{project_id}/parts", "post">;
export type UnlinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{project_id}/parts", "delete">;
