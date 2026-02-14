import { useMemo } from "react";
import { useMappingStore } from "@/stores/onboarding";
import { SAMPLE_DATA_MAX_COUNT } from "@/features/onboarding/constants/mappingConfig";

/**
 * 매핑 상태에서 파생되는 모든 계산 값
 * - 관계 타입/속성 옵션
 * - 관계 엔드포인트 옵션
 * - 활성/미매핑/승인 통계
 * - 샘플 데이터 헬퍼
 */
export function useMappingDerivedState() {
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const extendedMappings = useMappingStore((s) => s.extendedMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const mappingSampleRows = useMappingStore((s) => s.mappingSampleRows);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);

  // 관계 타입 옵션
  const relationTypeOptions = useMemo(
    () =>
      editableConstraints?.allowed_rel_types ||
      [...new Set(relationMappings.map((rm) => rm.rel_type))],
    [editableConstraints?.allowed_rel_types, relationMappings],
  );

  // 관계 타입별 속성 옵션
  const relationPropertyByType = useMemo(
    () =>
      editableConstraints?.allowed_rel_properties_by_type ||
      relationMappings.reduce<Record<string, string[]>>((acc, rm) => {
        const props = Object.values(rm.properties);
        if (!acc[rm.rel_type]) acc[rm.rel_type] = [];
        props.forEach((prop) => {
          if (!acc[rm.rel_type].includes(prop)) acc[rm.rel_type].push(prop);
        });
        return acc;
      }, {}),
    [editableConstraints?.allowed_rel_properties_by_type, relationMappings],
  );

  // 관계 타입별 엔드포인트 옵션
  const relationEndpointOptionsByType = useMemo(() => {
    const catalogByType = new Map(
      (editableConstraints?.relation_catalog || []).map((item) => [item.rel_type, item]),
    );
    const mergeKeysByLabel = editableConstraints?.merge_keys_by_label || {};

    return relationTypeOptions.reduce<
      Record<string, { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string; fromMergeKey?: string; toMergeKey?: string }>
    >((acc, relType) => {
      const catalog = catalogByType.get(relType);
      const fallback = relationMappings.find((rm) => rm.rel_type === relType);

      const fromLabel = catalog?.from_label || fallback?.from_label || "";
      const toLabel = catalog?.to_label || fallback?.to_label || "";
      const fromMergeKey = fromLabel ? mergeKeysByLabel[fromLabel]?.[0] : undefined;
      const toMergeKey = toLabel ? mergeKeysByLabel[toLabel]?.[0] : undefined;

      const fromColumns = [
        ...new Set(
          columnMappings
            .filter(
              (cm) =>
                cm.approved &&
                (!fromLabel || cm.target_label === fromLabel) &&
                (!fromMergeKey || cm.target_property === fromMergeKey),
            )
            .map((cm) => cm.source_column),
        ),
      ];

      const toColumns = [
        ...new Set(
          columnMappings
            .filter(
              (cm) =>
                cm.approved &&
                (!toLabel || cm.target_label === toLabel) &&
                (!toMergeKey || cm.target_property === toMergeKey),
            )
            .map((cm) => cm.source_column),
        ),
      ];

      acc[relType] = { fromColumns, toColumns, fromLabel, toLabel, fromMergeKey, toMergeKey };
      return acc;
    }, {});
  }, [editableConstraints, relationMappings, relationTypeOptions, columnMappings]);

  // 선택 가능한 관계 타입 (from/to 엔드포인트가 모두 있는 경우만)
  const selectableRelationTypeOptions = relationTypeOptions.filter((relType) => {
    const endpoint = relationEndpointOptionsByType[relType];
    return Boolean(endpoint && endpoint.fromColumns.length > 0 && endpoint.toColumns.length > 0);
  });

  // 활성 관계 매핑 (dismissed 제외)
  const activeRelationMappings = relationMappings.filter((rm) => !rm.dismissed);

  // 미매핑 원본 컬럼
  const unmappedColumns = useMemo(() => {
    const columnMappedCols = new Set([
      ...columnMappings.map((cm) => cm.source_column),
      ...extendedMappings.map((ep) => ep.source_column),
      ...relationMappings
        .filter((rm) => !rm.dismissed)
        .flatMap((rm) => Object.keys(rm.properties)),
    ]);
    return mappingHeaders.filter((h) => !columnMappedCols.has(h));
  }, [columnMappings, extendedMappings, relationMappings, mappingHeaders]);

  // 승인 통계
  const approvedColumnCount = columnMappings.filter((cm) => cm.approved).length;
  const approvedRelationCount = activeRelationMappings.filter((rm) => rm.approved).length;
  const approvedExtendedCount = extendedMappings.filter((ep) => ep.approved).length;
  const totalMappings = columnMappings.length + activeRelationMappings.length + extendedMappings.length;
  const totalApproved = approvedColumnCount + approvedRelationCount + approvedExtendedCount;
  const excludedCount = unmappedColumns.length;

  // 매핑이 하나라도 있는지
  const hasMappings = totalMappings > 0;

  // 샘플 데이터 추출 헬퍼
  const getSampleData = (column: string) => {
    const unique = [
      ...new Set(
        mappingSampleRows
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
          .map((value) => String(value)),
      ),
    ];
    return unique.slice(0, SAMPLE_DATA_MAX_COUNT);
  };

  return {
    // 관계 옵션
    relationTypeOptions,
    relationPropertyByType,
    relationEndpointOptionsByType,
    selectableRelationTypeOptions,
    // 파생 데이터
    activeRelationMappings,
    unmappedColumns,
    // 통계
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    // 헬퍼
    getSampleData,
  };
}
