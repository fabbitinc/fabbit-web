/**
 * 매핑 관련 공유 유틸리티
 */

/**
 * 원본 컬럼명을 확장 속성 이름(_ext_ 접두사)으로 변환
 * - NFKD 정규화 후 라틴 알파벳/숫자만 추출
 * - 해시 폴백으로 빈 결과 방지
 */
export function toExtendedPropertyName(sourceColumn: string): string {
  const hash = Array.from(sourceColumn).reduce(
    (acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0),
    7,
  );
  const normalizeName = sourceColumn
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `_ext_${normalizeName || `col_${hash.toString(36)}`}`;
}

/**
 * 관계 매핑의 identity key 생성 (중복 판별용)
 */
export function getRelationIdentityKey(rm: {
  rel_type: string;
  target_label: string;
  node_columns: Record<string, string>;
  rel_columns: Record<string, string>;
}): string {
  return [
    rm.rel_type,
    rm.target_label,
    JSON.stringify(rm.node_columns),
    JSON.stringify(rm.rel_columns),
  ].join("|");
}

/**
 * 관계 속성 매핑 방향을 정규화
 * - 내부 표준: { source_column: rel_property }
 * - 일부 입력이 { rel_property: source_column } 형태면 헤더 기준으로 자동 교정
 */
export function normalizeRelationColumns(
  relColumns: Record<string, string> | undefined,
  headers: string[],
): Record<string, string> {
  if (!relColumns) return {};

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(relColumns)) {
    if (headers.includes(key)) {
      normalized[key] = value;
      continue;
    }

    if (headers.includes(value)) {
      normalized[value] = key;
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

/**
 * Axios 에러에서 사용자 표시용 메시지 추출
 */
export function extractApiErrorMessage(
  err: unknown,
  fallback: string,
): string {
  const axiosErr = err as { response?: { data?: { detail?: string } } };
  return axiosErr?.response?.data?.detail || fallback;
}
