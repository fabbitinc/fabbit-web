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
  "/api/v1/engineering-changes/{engineeringChangeNumber}",
  "get"
>;

export interface UpdateEngineeringChangeDto
  extends Omit<ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeNumber}", "patch">, "body"> {
  body?: RichTextDocument | null;
}

export type SyncEngineeringChangeIssuesRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/issues",
  "put"
>;
export type SyncEngineeringChangeIssuesResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/issues",
  "put"
>;

export type SyncEngineeringChangeReviewersRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/reviewers",
  "put"
>;
export type SyncEngineeringChangeReviewersResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/reviewers",
  "put"
>;

export type EngineeringChangeTimelineResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/timeline",
  "get"
>;

export interface CreateEngineeringChangeCommentRequestDto
  extends Omit<
    ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeNumber}/comments", "post">,
    "body"
  > {
  body: RichTextDocument;
}
export type CreateEngineeringChangeCommentResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/comments",
  "post"
>;

export interface UpdateEngineeringChangeCommentRequestDto
  extends Omit<
    ApiRequestBody<"/api/v1/engineering-changes/{engineeringChangeNumber}/comments/{commentId}", "patch">,
    "body"
  > {
  body: RichTextDocument;
}
export type UpdateEngineeringChangeCommentResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/comments/{commentId}",
  "patch"
>;

export type AddEngineeringChangeFilesRequestDto = ApiRequestBody<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/files",
  "post"
>;
export type AddEngineeringChangeFilesResponseDto = ResponseOf<
  "/api/v1/engineering-changes/{engineeringChangeNumber}/files",
  "post"
>;

// 현재 UI에 남아 있는 구 섹션용 placeholder 타입입니다.
// engineering change 스펙에는 assignee/label/part 동기화 엔드포인트가 없어서 화면에서 숨깁니다.
export interface SyncEngineeringChangeAssigneesRequestDto {
  user_ids?: string[];
}

export type SyncEngineeringChangeAssigneesResponseDto = void;

export interface SyncEngineeringChangeLabelsRequestDto {
  label_ids?: string[];
}

export type SyncEngineeringChangeLabelsResponseDto = void;

export interface SyncEngineeringChangePartsRequestDto {
  part_ids?: string[];
}

export type SyncEngineeringChangePartsResponseDto = void;
