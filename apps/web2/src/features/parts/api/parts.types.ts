import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type ListPartsQueryDto = NonNullable<ApiParameters<"/api/v1/parts", "get">["query"]>;
export type ExportPartsQueryDto = NonNullable<ApiParameters<"/api/v1/parts/export", "get">["query"]>;
export type PartListResponseDto = ResponseOf<"/api/v1/parts", "get">;
export type PartFilterOptionsResponseDto = ResponseOf<"/api/v1/parts/filter-options", "get">;
export type PartDetailResponseDto = ResponseOf<"/api/v1/parts/{partId}", "get">;
export type PartBomResponseDto = ResponseOf<"/api/v1/parts/{partId}/bom", "get">;
export type PartBomTreeQueryDto = NonNullable<ApiParameters<"/api/v1/parts/{partId}/bom/tree", "get">["query"]>;
export type PartBomTreeResponseDto = ResponseOf<"/api/v1/parts/{partId}/bom/tree", "get">;
export type ExportPartBomTreeQueryDto = NonNullable<ApiParameters<"/api/v1/parts/{partId}/bom/tree/export", "get">["query"]>;
export type PartSuppliersResponseDto = ResponseOf<"/api/v1/parts/{partId}/suppliers", "get">;
export type PartFilesResponseDto = ResponseOf<"/api/v1/parts/{partId}/files", "get">;
export type AttachPartFilesRequestDto = ApiRequestBody<"/api/v1/parts/{partId}/files", "post">;
export type AttachPartFilesResponseDto = ResponseOf<"/api/v1/parts/{partId}/files", "post">;
export type PartProjectsResponseDto = ResponseOf<"/api/v1/parts/{partId}/projects", "get">;
export type PartOwnerResponseDto = ResponseOf<"/api/v1/parts/{partId}/owner", "get">;
export type UpdatePartOwnerRequestDto = ApiRequestBody<"/api/v1/parts/{partId}/owner", "patch">;
export type RegisterPartDrawingRequestDto = ApiRequestBody<"/api/v1/parts/{partId}/drawings", "post">;
export type RegisterPartDrawingResponseDto = ResponseOf<"/api/v1/parts/{partId}/drawings", "post">;
export type DrawingProcessingResponseDto = ResponseOf<"/api/v1/drawings/{drawingId}/processing", "get">;
export type ListProjectsQueryDto = NonNullable<ApiParameters<"/api/v1/projects", "get">["query"]>;
export type ProjectListResponseDto = ResponseOf<"/api/v1/projects", "get">;
export type LinkProjectPartsRequestDto = ApiRequestBody<"/api/v1/projects/{projectId}/parts", "post">;
export type LinkProjectPartsResponseDto = ResponseOf<"/api/v1/projects/{projectId}/parts", "post">;
export type TeamLookupResponseDto = ResponseOf<"/api/v1/teams/lookup", "get">;
export type TeamListResponseDto = ResponseOf<"/api/v1/teams", "get">;
export type MemberListResponseDto = ResponseOf<"/api/v1/members", "get">;
