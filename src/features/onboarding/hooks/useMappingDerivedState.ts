import { useMemo } from "react";
import { useMappingStore } from "@/stores/onboarding";
import { SAMPLE_DATA_MAX_COUNT } from "@/features/onboarding/constants/mappingConfig";
import type { RelationTargetInfo } from "@/features/onboarding/types/onboarding.types";

/**
 * 매핑 상태에서 파생되는 모든 계산 값
 * - 기본/확장 매핑 분리 (is_extended 기준)
 * - 관계 타입/속성 옵션
 * - 관계 상대방 노드 정보
 * - 활성/미매핑/승인 통계
 * - 샘플 데이터 헬퍼
 */
export function useMappingDerivedState() {
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const mappingSampleRows = useMappingStore((s) => s.mappingSampleRows);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);

  // 기본 매핑 (is_extended가 아닌 것)
  const baseMappings = useMemo(
    () => columnMappings.filter((cm) => !cm.is_extended),
    [columnMappings],
  );

  // 확장 매핑 (is_extended인 것)
  const extendedMappings = useMemo(
    () => columnMappings.filter((cm) => cm.is_extended),
    [columnMappings],
  );

  // 관계 타입 옵션: relation_catalog에서 추출
  const relationTypeOptions = useMemo(
    () => {
      const catalog = editableConstraints?.relation_catalog || [];
      if (catalog.length > 0) {
        return [...new Set(catalog.map((item) => item.rel_type))];
      }
      return [...new Set(relationMappings.map((rm) => rm.rel_type))];
    },
    [editableConstraints?.relation_catalog, relationMappings],
  );

  // 관계 타입별 속성 옵션: relation_property_catalog에서 파생
  const relationPropertyByType = useMemo(
    () => {
      const catalog = editableConstraints?.relation_property_catalog || [];
      if (catalog.length > 0) {
        return catalog.reduce<Record<string, string[]>>((acc, item) => {
          if (!acc[item.rel_type]) acc[item.rel_type] = [];
          if (!acc[item.rel_type].includes(item.property)) {
            acc[item.rel_type].push(item.property);
          }
          return acc;
        }, {});
      }
      // 폴백: 기존 관계 매핑에서 추출
      return relationMappings.reduce<Record<string, string[]>>((acc, rm) => {
        const props = Object.values(rm.rel_columns);
        if (!acc[rm.rel_type]) acc[rm.rel_type] = [];
        props.forEach((prop) => {
          if (!acc[rm.rel_type].includes(prop)) acc[rm.rel_type].push(prop);
        });
        return acc;
      }, {});
    },
    [editableConstraints?.relation_property_catalog, relationMappings],
  );

  // 관계 타입별 상대방 노드 정보
  const relationTargetInfoByType = useMemo(() => {
    const catalog = editableConstraints?.relation_catalog || [];
    const catalogByType = new Map(
      catalog.map((item) => [item.rel_type, item]),
    );
    const mergeKeysByLabel = editableConstraints?.merge_keys_by_label || {};

    return relationTypeOptions.reduce<Record<string, RelationTargetInfo>>((acc, relType) => {
      const catalogItem = catalogByType.get(relType);
      const fallback = relationMappings.find((rm) => rm.rel_type === relType);

      const targetLabel = catalogItem?.to_label || fallback?.target_label || "";
      const targetMergeKeys = targetLabel ? (mergeKeysByLabel[targetLabel] || []) : [];

      // 상대방 merge key가 baseMappings에 매핑되어 있으면 해당 컬럼, 없으면 전체 헤더
      const resolveTargetColumns = () => {
        if (targetMergeKeys.length > 0) {
          const matched = baseMappings
            .filter((cm) => cm.approved && targetMergeKeys.includes(cm.target_property))
            .map((cm) => cm.source_column);
          if (matched.length > 0) return [...new Set(matched)];
        }
        return [...mappingHeaders];
      };

      const targetColumnOptions = resolveTargetColumns();

      acc[relType] = { targetLabel, targetMergeKeys, targetColumnOptions };
      return acc;
    }, {});
  }, [editableConstraints, relationMappings, relationTypeOptions, baseMappings, mappingHeaders]);

  // 선택 가능한 관계 타입 (상대방 노드 컬럼 옵션이 있는 경우만)
  const selectableRelationTypeOptions = relationTypeOptions.filter((relType) => {
    const info = relationTargetInfoByType[relType];
    return Boolean(info && info.targetColumnOptions.length > 0);
  });

  // 활성 관계 매핑 (dismissed 제외)
  const activeRelationMappings = relationMappings.filter((rm) => !rm.dismissed);

  // 미매핑 원본 컬럼
  const unmappedColumns = useMemo(() => {
    const columnMappedCols = new Set([
      ...columnMappings.map((cm) => cm.source_column),
      ...relationMappings
        .filter((rm) => !rm.dismissed)
        .flatMap((rm) => Object.values(rm.node_columns)),
      ...relationMappings
        .filter((rm) => !rm.dismissed)
        .flatMap((rm) => Object.keys(rm.rel_columns)),
    ]);
    return mappingHeaders.filter((h) => !columnMappedCols.has(h));
  }, [columnMappings, relationMappings, mappingHeaders]);

  // 승인 통계
  const approvedBaseCount = baseMappings.filter((cm) => cm.approved).length;
  const approvedRelationCount = activeRelationMappings.filter((rm) => rm.approved).length;
  const approvedExtendedCount = extendedMappings.filter((cm) => cm.approved).length;
  const totalMappings = baseMappings.length + activeRelationMappings.length + extendedMappings.length;
  const totalApproved = approvedBaseCount + approvedRelationCount + approvedExtendedCount;
  const excludedCount = unmappedColumns.length;

  // 매핑이 하나라도 있는지
  const hasMappings = totalMappings > 0;
  const hasUnselectedPartMappings = baseMappings.some((cm) => !cm.target_property);

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
    // 기본/확장 분리
    baseMappings,
    extendedMappings,
    // 관계 옵션
    relationTypeOptions,
    relationPropertyByType,
    relationTargetInfoByType,
    selectableRelationTypeOptions,
    // 파생 데이터
    activeRelationMappings,
    unmappedColumns,
    // 통계
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    hasUnselectedPartMappings,
    // 헬퍼
    getSampleData,
  };
}
