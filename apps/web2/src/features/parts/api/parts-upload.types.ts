import type { ApiParameters, ApiRequestBody, ApiSuccessResponse } from "@/api/types";

type ResponseOf<
  Path extends keyof import("@/api/generated/schema").paths,
  Method extends "get" | "post",
> = Exclude<ApiSuccessResponse<Path, Method>, never>;

export type SynthesisStartRequestDto = ApiRequestBody<"/api/v1/synthesis", "post">;
export type SynthesisBatchStartResponseDto = ResponseOf<"/api/v1/synthesis", "post">;
export type SynthesisBatchStatusResponseDto = ResponseOf<"/api/v1/synthesis/batches/{batch_id}", "get">;
export type NodeSearchQueryDto = NonNullable<ApiParameters<"/api/v1/ontology/nodes/search", "get">["query"]>;
export type NodeSearchResponseDto = ResponseOf<"/api/v1/ontology/nodes/search", "get">;
