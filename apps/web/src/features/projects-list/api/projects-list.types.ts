import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<Path extends keyof import("@/api/generated/schema").paths, Method extends "get" | "post"> =
  Exclude<ApiSuccessResponse<Path, Method>, never>;

export type ListProjectsQueryDto = NonNullable<ApiParameters<"/api/v1/projects", "get">["query"]>;
export type CreateProjectRequestDto = ApiRequestBody<"/api/v1/projects", "post">;
export type ProjectListResponseDto = ResponseOf<"/api/v1/projects", "get">;
export type ProjectDetailResponseDto = ResponseOf<"/api/v1/projects", "post">;
