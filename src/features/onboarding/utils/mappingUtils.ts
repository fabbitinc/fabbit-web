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
  from_label: string;
  rel_type: string;
  to_label: string;
  from_columns: Record<string, string>;
  to_columns: Record<string, string>;
  properties: Record<string, string>;
}): string {
  return [
    rm.from_label,
    rm.rel_type,
    rm.to_label,
    JSON.stringify(rm.from_columns),
    JSON.stringify(rm.to_columns),
    JSON.stringify(rm.properties),
  ].join("|");
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
