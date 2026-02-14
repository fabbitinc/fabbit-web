import type {
  ColumnMappingEntry,
  RelationMappingEntry,
} from "@/features/onboarding/types/onboarding.types";

/**
 * RelationMappingEntry의 깊은 복사 (중첩 Record 포함)
 */
export function cloneRelationMapping(rm: RelationMappingEntry): RelationMappingEntry {
  return {
    ...rm,
    from_columns: { ...rm.from_columns },
    to_columns: { ...rm.to_columns },
    properties: { ...rm.properties },
    property_types: { ...rm.property_types },
  };
}

/**
 * 관계 매핑의 유효성 검증
 * - from/to 엔드포인트의 source_column이 columnMappings에 존재하는지
 * - properties의 source_column이 원본 헤더에 존재하는지
 */
export function isRelationValid(
  relation: RelationMappingEntry,
  columnMappings: ColumnMappingEntry[],
  mappingHeaders: string[],
): boolean {
  const isFromValid = Object.entries(relation.from_columns).every(([prop, sourceColumn]) =>
    columnMappings.some(
      (cm) =>
        cm.source_column === sourceColumn &&
        cm.target_label === relation.from_label &&
        cm.target_property === prop,
    ),
  );

  const isToValid = Object.entries(relation.to_columns).every(([prop, sourceColumn]) =>
    columnMappings.some(
      (cm) =>
        cm.source_column === sourceColumn &&
        cm.target_label === relation.to_label &&
        cm.target_property === prop,
    ),
  );

  const isPropertiesValid = Object.keys(relation.properties).every((sourceColumn) =>
    mappingHeaders.includes(sourceColumn),
  );

  return isFromValid && isToValid && isPropertiesValid;
}
