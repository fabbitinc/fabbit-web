import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";
import type { RichTextDocument } from "@/lib/rich-text";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export interface CreateChangeRequestDto
  extends Omit<ApiRequestBody<"/api/v1/changes", "post">, "body"> {
  body?: RichTextDocument;
}
export type ChangeRequestResponseDto = ResponseOf<"/api/v1/changes", "post">;

export type ChangeRequestDetailResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}", "get">;
export interface UpdateChangeRequestDto
  extends Omit<ApiRequestBody<"/api/v1/changes/{issueNumber}", "patch">, "body"> {
  body?: RichTextDocument | null;
}

export type SyncChangeRequestIssuesRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/issues", "put">;
export type SyncChangeRequestIssuesResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/issues", "put">;

export type SyncChangeRequestAssigneesRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/assignees", "put">;
export type SyncChangeRequestAssigneesResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/assignees", "put">;

export type SyncChangeRequestReviewersRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/reviewers", "put">;
export type SyncChangeRequestReviewersResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/reviewers", "put">;

export type SyncChangeRequestLabelsRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/labels", "put">;
export type SyncChangeRequestLabelsResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/labels", "put">;

export type SyncChangeRequestPartsRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/parts", "put">;
export type SyncChangeRequestPartsResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/parts", "put">;

export type ChangeRequestTimelineResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/timeline", "get">;

export interface CreateChangeRequestCommentRequestDto
  extends Omit<ApiRequestBody<"/api/v1/changes/{issueNumber}/comments", "post">, "body"> {
  body: RichTextDocument;
}
export type CreateChangeRequestCommentResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/comments", "post">;

export interface UpdateChangeRequestCommentRequestDto
  extends Omit<ApiRequestBody<"/api/v1/changes/{issueNumber}/comments/{commentId}", "patch">, "body"> {
  body: RichTextDocument;
}
export type UpdateChangeRequestCommentResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/comments/{commentId}", "patch">;

export type AddChangeRequestFilesRequestDto = ApiRequestBody<"/api/v1/changes/{issueNumber}/files", "post">;
export type AddChangeRequestFilesResponseDto = ResponseOf<"/api/v1/changes/{issueNumber}/files", "post">;
