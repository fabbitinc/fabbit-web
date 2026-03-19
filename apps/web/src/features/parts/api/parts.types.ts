import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";
import type { CreatePartDraftRequest } from "@/api/generated/orval/model/createPartDraftRequest";
import type { GetDiffParams } from "@/api/generated/orval/model/getDiffParams";
import type { ListInProgressPartsStatusesItem } from "@/api/generated/orval/model/listInProgressPartsStatusesItem";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

type ReleasedPartsQueryDto = NonNullable<ApiParameters<"/api/v1/parts", "get">["query"]>;

export interface ListPartsQueryDto extends Omit<ReleasedPartsQueryDto, "next_cursor" | "prev_cursor" | "limit"> {
  source?: "master" | "workbench";
  statuses?: ListInProgressPartsStatusesItem[];
  mine_only?: boolean;
  next_cursor?: ReleasedPartsQueryDto["next_cursor"];
  prev_cursor?: ReleasedPartsQueryDto["prev_cursor"];
  limit?: ReleasedPartsQueryDto["limit"];
}
export type CreatePartRequestDto = ApiRequestBody<"/api/v1/parts", "post">;
export type ExportPartsQueryDto = NonNullable<ApiParameters<"/api/v1/parts/export", "get">["query"]>;
export type PartListResponseDto = ResponseOf<"/api/v1/parts", "get">;
export type PartInProgressListResponseDto = ResponseOf<"/api/v1/parts/in-progress", "get">;
export type PartFilterOptionsResponseDto = ResponseOf<"/api/v1/parts/filter-options", "get">;
export type PartDetailResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}", "get">;
export type PartBomResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/bom", "get">;
export type PartBomTreeQueryDto =
  NonNullable<ApiParameters<"/api/v1/parts/{partId}/revisions/{revisionId}/bom/tree", "get">["query"]>;
export type PartBomTreeResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/bom/tree", "get">;
export type ExportPartBomTreeQueryDto =
  NonNullable<ApiParameters<"/api/v1/parts/{partId}/revisions/{revisionId}/bom/tree/export", "get">["query"]>;
export type PartSuppliersResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/suppliers", "get">;
export type PartFilesResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/files", "get">;
export type AttachPartFilesRequestDto = ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}/files", "post">;
export type AttachPartFilesResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/files", "post">;
export type PartPreviewSourcesResponseDto =
  ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/preview/sources", "get">;
export type UploadPartPreviewFileRequestDto =
  ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}/preview/files", "post">;
export type PartProjectsResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/projects", "get">;
export type RegisterPartDrawingRequestDto = ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}/drawings", "post">;
export type RegisterPartDrawingResponseDto =
  ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/drawings", "post">;
export type DrawingProcessingResponseDto =
  ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/preview/processing", "get">;
export type PartRevisionChangeReasonRequestDto =
  ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}/release", "post">;
export type UpdatePartDraftRequestDto =
  ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}", "patch">;
export type CreatePartDraftRequestDto = CreatePartDraftRequest;
export type UpdatePartPreviewRequestDto =
  ApiRequestBody<"/api/v1/parts/{partId}/revisions/{revisionId}/preview", "patch">;
export type ListProjectsQueryDto = NonNullable<ApiParameters<"/api/v1/projects", "get">["query"]>;
export type ProjectListResponseDto = ResponseOf<"/api/v1/projects", "get">;
export type LinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/parts", "post">;
export type LinkProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{projectId}/parts", "post">;

export type PartRevisionHistoryResponseDto = ResponseOf<"/api/v1/parts/{partId}/history", "get">;
export type PartRevisionDiffResponseDto = ResponseOf<"/api/v1/parts/{partId}/revisions/{revisionId}/diff", "get">;
export type PartRevisionDiffQueryDto = GetDiffParams;

export type PartListStatusDto = ListInProgressPartsStatusesItem;
