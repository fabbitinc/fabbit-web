import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type CreateChangeRequestDto = ApiRequestBody<"/api/v1/changes", "post">;
export type ChangeRequestResponseDto = ResponseOf<"/api/v1/changes", "post">;

export type ChangeRequestDetailResponseDto = ResponseOf<"/api/v1/changes/{issue_number}", "get">;
export type UpdateChangeRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}", "patch">;

export type SyncChangeRequestIssuesRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/issues", "put">;
export type SyncChangeRequestIssuesResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/issues", "put">;

export type SyncChangeRequestAssigneesRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/assignees", "put">;
export type SyncChangeRequestAssigneesResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/assignees", "put">;

export type SyncChangeRequestReviewersRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/reviewers", "put">;
export type SyncChangeRequestReviewersResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/reviewers", "put">;

export type SyncChangeRequestLabelsRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/labels", "put">;
export type SyncChangeRequestLabelsResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/labels", "put">;

export type SyncChangeRequestPartsRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/parts", "put">;
export type SyncChangeRequestPartsResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/parts", "put">;

export type ChangeRequestTimelineResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/timeline", "get">;

export type CreateChangeRequestCommentRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/comments", "post">;
export type CreateChangeRequestCommentResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/comments", "post">;

export type UpdateChangeRequestCommentRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/comments/{comment_id}", "patch">;
export type UpdateChangeRequestCommentResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/comments/{comment_id}", "patch">;

export type AddChangeRequestFilesRequestDto = ApiRequestBody<"/api/v1/changes/{issue_number}/files", "post">;
export type AddChangeRequestFilesResponseDto = ResponseOf<"/api/v1/changes/{issue_number}/files", "post">;
