import type { ApiParameters, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type MemberLookupQueryDto = NonNullable<ApiParameters<"/api/v1/members/lookup", "get">["query"]>;
export type MemberLookupResponseDto = ResponseOf<"/api/v1/members/lookup", "get">;

export type LabelLookupQueryDto = NonNullable<ApiParameters<"/api/v1/labels/lookup", "get">["query"]>;
export type LabelLookupResponseDto = ResponseOf<"/api/v1/labels/lookup", "get">;

export type PartLookupQueryDto = NonNullable<ApiParameters<"/api/v1/parts/lookup", "get">["query"]>;
export type PartLookupResponseDto = ResponseOf<"/api/v1/parts/lookup", "get">;

export type IssueLookupQueryDto = NonNullable<ApiParameters<"/api/v1/issues/lookup", "get">["query"]>;
export type IssueLookupResponseDto = ResponseOf<"/api/v1/issues/lookup", "get">;

export type ChangeLookupQueryDto = NonNullable<
  ApiParameters<"/api/v1/engineering-changes/lookup", "get">["query"]
>;
export type ChangeLookupResponseDto = ResponseOf<"/api/v1/engineering-changes/lookup", "get">;
