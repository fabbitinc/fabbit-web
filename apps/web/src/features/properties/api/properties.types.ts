import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post" | "patch" | "put" | "delete",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type ListPropertyMetaQueryDto = NonNullable<ApiParameters<"/api/v1/properties/meta", "get">["query"]>;
export type PropertyMetaListResponseDto = ResponseOf<"/api/v1/properties/meta", "get">;
export type PropertyMetaResponseDto = NonNullable<PropertyMetaListResponseDto["items"]>[number];
export type CreatePropertyDefinitionRequestDto = ApiRequestBody<"/api/v1/properties/definitions", "post">;
export type CreatePropertyDefinitionResponseDto = ResponseOf<"/api/v1/properties/definitions", "post">;
export type UpdatePropertyDefinitionRequestDto =
  ApiRequestBody<"/api/v1/properties/definitions/{propertyDefinitionId}", "patch">;
export type UpdatePropertyDefinitionResponseDto =
  ResponseOf<"/api/v1/properties/definitions/{propertyDefinitionId}", "patch">;
export type UpsertSystemPropertyOverrideRequestDto =
  ApiRequestBody<"/api/v1/properties/system-overrides/{ownerType}/{propertyKey}", "patch">;
export type UpsertSystemPropertyOverrideResponseDto =
  ResponseOf<"/api/v1/properties/system-overrides/{ownerType}/{propertyKey}", "patch">;

