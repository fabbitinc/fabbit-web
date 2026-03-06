import type { ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "put" | "patch" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type MappingPreviewRequestDto = ApiRequestBody<"/api/v1/mappings/preview", "post">;
export type MappingPreviewResponseDto = ResponseOf<"/api/v1/mappings/preview", "post">;
export type MappingConfirmRequestDto = ApiRequestBody<"/api/v1/mappings/confirm", "post">;
export type MappingResponseDto = ResponseOf<"/api/v1/mappings/confirm", "post">;
export type MappingListResponseDto = ResponseOf<"/api/v1/mappings", "get">;
export type MappingUpdateRequestDto = ApiRequestBody<"/api/v1/mappings/{mapping_id}", "put">;
export type MappingValidateRequestDto = ApiRequestBody<"/api/v1/mappings/validate", "post">;
export type MappingValidateResponseDto = ResponseOf<"/api/v1/mappings/validate", "post">;
export type OntologySchemaResponseDto = ResponseOf<"/api/v1/ontology/schema", "get">;
