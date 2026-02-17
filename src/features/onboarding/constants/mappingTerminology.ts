export const MAPPING_TERMS = {
  sourceColumn: "원본 컬럼",
  targetLabel: "라벨",
  targetProperty: "속성",
  baseMapping: "기본 매핑",
  relationMapping: "관계 매핑",
  extendedMapping: "확장 매핑",
  relationProperty: "관계 속성",
  relationNodeColumn: "상대방 노드 컬럼",
} as const;

export function getDismissedReasonLabel(reason?: string | null): string | null {
  if (!reason) return null;
  if (reason === "missing_node_column")
    return `${MAPPING_TERMS.relationNodeColumn}이 없습니다`;
  if (reason === "missing_rel_column")
    return `${MAPPING_TERMS.relationProperty}에 필요한 ${MAPPING_TERMS.sourceColumn}이 없습니다`;
  if (reason === "missing_required_rel_property") {
    return `${MAPPING_TERMS.relationProperty}에 필요한 ${MAPPING_TERMS.sourceColumn}이 없습니다`;
  }
  if (reason === "missing_source_column")
    return `참조한 ${MAPPING_TERMS.sourceColumn}이 없습니다`;
  if (reason === "invalid_ext_property_name")
    return "확장 속성 이름 형식이 올바르지 않습니다";
  return reason;
}
