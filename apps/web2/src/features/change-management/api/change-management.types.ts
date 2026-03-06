import type { ApiParameters, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type IssueListQueryDto = NonNullable<ApiParameters<"/api/v1/issues", "get">["query"]>;
export type IssueListResponseDto = ResponseOf<"/api/v1/issues", "get">;

export type ChangeRequestListQueryDto = NonNullable<ApiParameters<"/api/v1/changes", "get">["query"]>;
export type ChangeRequestListResponseDto = ResponseOf<"/api/v1/changes", "get">;
