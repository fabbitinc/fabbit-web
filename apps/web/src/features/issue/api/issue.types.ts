import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";
import type { RichTextDocument } from "@/lib/rich-text";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export interface CreateIssueRequestDto
  extends Omit<ApiRequestBody<"/api/v1/issues", "post">, "body"> {
  body?: RichTextDocument;
}
export type IssueResponseDto = ResponseOf<"/api/v1/issues", "post">;

export type IssueDetailResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}", "get">;
export interface UpdateIssueRequestDto
  extends Omit<ApiRequestBody<"/api/v1/issues/{issueNumber}", "patch">, "body"> {
  body?: RichTextDocument | null;
}

export type SyncIssueAssigneesRequestDto = ApiRequestBody<"/api/v1/issues/{issueNumber}/assignees", "put">;
export type SyncIssueAssigneesResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/assignees", "put">;

export type SyncIssueChangesRequestDto = ApiRequestBody<
  "/api/v1/issues/{issueNumber}/engineering-changes",
  "put"
>;
export type SyncIssueChangesResponseDto = ResponseOf<
  "/api/v1/issues/{issueNumber}/engineering-changes",
  "put"
>;

export type SyncIssueLabelsRequestDto = ApiRequestBody<"/api/v1/issues/{issueNumber}/labels", "put">;
export type SyncIssueLabelsResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/labels", "put">;

export type SyncIssuePartsRequestDto = ApiRequestBody<"/api/v1/issues/{issueNumber}/parts", "put">;
export type SyncIssuePartsResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/parts", "put">;

export type IssueTimelineResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/timeline", "get">;

export interface CreateIssueCommentRequestDto
  extends Omit<ApiRequestBody<"/api/v1/issues/{issueNumber}/comments", "post">, "body"> {
  body: RichTextDocument;
}
export type CreateIssueCommentResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/comments", "post">;

export interface UpdateIssueCommentRequestDto
  extends Omit<ApiRequestBody<"/api/v1/issues/{issueNumber}/comments/{commentId}", "patch">, "body"> {
  body: RichTextDocument;
}
export type UpdateIssueCommentResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/comments/{commentId}", "patch">;

export type AddIssueFilesRequestDto = ApiRequestBody<"/api/v1/issues/{issueNumber}/files", "post">;
export type AddIssueFilesResponseDto = ResponseOf<"/api/v1/issues/{issueNumber}/files", "post">;
