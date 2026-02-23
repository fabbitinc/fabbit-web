import type {
  ColumnMappingEntry,
  RelationMappingEntry,
} from "@/features/mapping/types/mapping.types";

/**
 * RelationMappingEntry의 깊은 복사 (중첩 Record 포함)
 */
export function cloneRelationMapping(rm: RelationMappingEntry): RelationMappingEntry {
  return {
    ...rm,
    node_columns: { ...rm.node_columns },
    rel_columns: { ...rm.rel_columns },
    rel_column_types: { ...rm.rel_column_types },
  };
}

/**
 * 관계 매핑의 유효성 검증
 * - node_columns의 source_column이 columnMappings에 존재하는지
 * - rel_columns의 source_column이 원본 헤더에 존재하는지
 */
export function isRelationValid(
  relation: RelationMappingEntry,
  columnMappings: ColumnMappingEntry[],
  mappingHeaders: string[],
): boolean {
  // node_columns: { target_property: source_column } 형태
  // source_column이 columnMappings에 매핑된 컬럼이어야 함
  const isNodeColumnsValid = Object.values(relation.node_columns).every((sourceColumn) =>
    columnMappings.some((cm) => cm.source_column === sourceColumn),
  );

  // rel_columns: { source_column: rel_property } 형태
  // source_column이 원본 헤더에 존재해야 함
  const isRelColumnsValid = Object.keys(relation.rel_columns).every((sourceColumn) =>
    mappingHeaders.includes(sourceColumn),
  );

  return isNodeColumnsValid && isRelColumnsValid;
}
