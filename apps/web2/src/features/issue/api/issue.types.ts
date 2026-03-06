import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type CreateIssueRequestDto = ApiRequestBody<"/api/v1/issues", "post">;
export type IssueResponseDto = ResponseOf<"/api/v1/issues", "post">;

export type IssueDetailResponseDto = ResponseOf<"/api/v1/issues/{issue_number}", "get">;
export type UpdateIssueRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}", "patch">;

export type SyncIssueAssigneesRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/assignees", "put">;
export type SyncIssueAssigneesResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/assignees", "put">;

export type SyncIssueChangesRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/changes", "put">;
export type SyncIssueChangesResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/changes", "put">;

export type SyncIssueLabelsRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/labels", "put">;
export type SyncIssueLabelsResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/labels", "put">;

export type SyncIssuePartsRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/parts", "put">;
export type SyncIssuePartsResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/parts", "put">;

export type IssueTimelineResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/timeline", "get">;

export type CreateIssueCommentRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/comments", "post">;
export type CreateIssueCommentResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/comments", "post">;

export type UpdateIssueCommentRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/comments/{comment_id}", "patch">;
export type UpdateIssueCommentResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/comments/{comment_id}", "patch">;

export type AddIssueFilesRequestDto = ApiRequestBody<"/api/v1/issues/{issue_number}/files", "post">;
export type AddIssueFilesResponseDto = ResponseOf<"/api/v1/issues/{issue_number}/files", "post">;
