import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";
import type { RichTextDocument } from "@/lib/rich-text";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export interface CreateEngineeringChangeDto
  extends Omit<ApiRequestBody<"/api/v1/engineering-changes", "post">, "body"> {
  body?: RichTextDocument;
}

export type EngineeringChangeResponseDto = ResponseOf<"/api/v1/engineering-changes", "post">;
export type EngineeringChangeDetailResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}",
  "get"
>;

export interface UpdateEngineeringChangeDto
  extends Omit<ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeId}", "patch">, "body"> {
  body?: RichTextDocument | null;
}

export type SyncAffectedItemsRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeId}/affected-items",
  "put"
>;

export type SyncEngineeringChangeIssuesRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeId}/issues",
  "put"
>;
export type SyncEngineeringChangeIssuesResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/issues",
  "put"
>;

export type ReplaceEngineeringChangeStepsRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeId}/steps",
  "put"
>;
export type ReplaceEngineeringChangeStepsResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/steps",
  "put"
>;

export type EngineeringChangeTimelineResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/timeline",
  "get"
>;

export interface CreateEngineeringChangeCommentRequestDto
  extends Omit<
    ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeId}/comments", "post">,
    "body"
  > {
  body: RichTextDocument;
}
export type CreateEngineeringChangeCommentResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/comments",
  "post"
>;

export interface UpdateEngineeringChangeCommentRequestDto
  extends Omit<
    ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeId}/comments/{commentId}", "patch">,
    "body"
  > {
  body: RichTextDocument;
}
export type UpdateEngineeringChangeCommentResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/comments/{commentId}",
  "patch"
>;

export type AddEngineeringChangeFilesRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeId}/files",
  "post"
>;
export type AddEngineeringChangeFilesResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeId}/files",
  "post"
>;
