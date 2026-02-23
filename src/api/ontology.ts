import { apiClient } from "./client";
import type {
  OntologySchemaResponse,
  NodeSearchResponse,
} from "./types/ontology";

/**
 * 온톨로지 스키마 조회 (인증 불필요)
 * GET /api/v1/ontology/schema
 */
export async function getOntologySchema(): Promise<OntologySchemaResponse> {
  const response = await apiClient.get<OntologySchemaResponse>(
    "/api/v1/ontology/schema",
  );
  return response.data;
}

/**
 * 노드 라벨별 merge key 검색 (root_context 자동완성용)
 * GET /api/v1/ontology/nodes/search
 */
export async function searchNodes(
  label: string,
  search: string,
  limit = 10,
): Promise<NodeSearchResponse> {
  const response = await apiClient.get<NodeSearchResponse>(
    "/api/v1/ontology/nodes/search",
    { params: { label, search, limit } },
  );
  return response.data;
}
