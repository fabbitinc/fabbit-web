import { useMemo } from "react";
import { useMappingStore } from "@/stores/onboarding";
import { SAMPLE_DATA_MAX_COUNT } from "@/features/onboarding/constants/mappingConfig";
import type { RelationTargetInfo } from "@/features/onboarding/types/onboarding.types";
import type { KanbanColumnId } from "@/features/onboarding/hooks/useMappingKanban";

const REL_TYPE_TO_COLUMN: Record<string, KanbanColumnId> = {
  CONSISTS_OF: "parent_part",
  SUPPLIED_BY: "Supplier",
  DEFINED_BY: "Drawing",
  HAS_ITEM: "Project",
};

type BlockingIssueReason = "unselected_property" | "merge_key_missing";

interface BlockingIssue {
  columnId: KanbanColumnId;
  reason: BlockingIssueReason;
}

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
  const ontologySchema = useMappingStore((s) => s.ontologySchema);
  const targetPropertyOptions = useMappingStore((s) => s.targetPropertyOptions);

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

  const mergeKeysByLabel = useMemo(() => {
    const nodeLabels = ontologySchema?.node_labels || [];
    return nodeLabels.reduce<Record<string, string[]>>((acc, label) => {
      const keyByFlag = label.properties
        .filter((prop) => prop.is_merge_key)
        .map((prop) => prop.name);
      acc[label.label] = label.merge_keys.length > 0 ? label.merge_keys : keyByFlag;
      return acc;
    }, {});
  }, [ontologySchema]);

  const targetPropertiesByLabel = useMemo(() => {
    const map = new Map<string, string[]>();
    targetPropertyOptions.forEach((opt) => {
      if (!map.has(opt.label)) map.set(opt.label, []);
      const props = map.get(opt.label)!;
      if (!props.includes(opt.property)) props.push(opt.property);
    });
    return map;
  }, [targetPropertyOptions]);

  // 관계 타입 옵션: ontology schema에서 추출
  const relationTypeOptions = useMemo(
    () => {
      const relationTypes = ontologySchema?.relationship_types || [];
      if (relationTypes.length > 0) {
        return [...new Set(relationTypes.map((item) => item.rel_type))];
      }
      return [...new Set(relationMappings.map((rm) => rm.rel_type))];
    },
    [ontologySchema, relationMappings],
  );

  // 관계 타입별 속성 옵션: ontology relationship_types에서 파생
  const relationPropertyByType = useMemo(
    () => {
      const relationTypes = ontologySchema?.relationship_types || [];
      if (relationTypes.length > 0) {
        return relationTypes.reduce<Record<string, string[]>>((acc, item) => {
          if (!acc[item.rel_type]) acc[item.rel_type] = [];
          item.properties.forEach((prop) => {
            if (!acc[item.rel_type].includes(prop.name)) {
              acc[item.rel_type].push(prop.name);
            }
          });
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
    [ontologySchema, relationMappings],
  );

  // 관계 타입별 상대방 노드 정보
  const relationTargetInfoByType = useMemo(() => {
    const relationTypes = ontologySchema?.relationship_types || [];
    const relationByType = new Map(
      relationTypes.map((item) => [item.rel_type, item]),
    );

    return relationTypeOptions.reduce<Record<string, RelationTargetInfo>>((acc, relType) => {
      const relationType = relationByType.get(relType);
      const fallback = relationMappings.find((rm) => rm.rel_type === relType);

      const targetLabel = relationType?.to_label || fallback?.target_label || "";
      const targetMergeKeys = targetLabel ? (mergeKeysByLabel[targetLabel] || []) : [];
      const targetProperties = targetLabel
        ? (targetPropertiesByLabel.get(targetLabel) || [])
        : [];

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

      acc[relType] = { targetLabel, targetMergeKeys, targetColumnOptions, targetProperties };
      return acc;
    }, {});
  }, [ontologySchema, relationMappings, relationTypeOptions, baseMappings, mappingHeaders, mergeKeysByLabel, targetPropertiesByLabel]);

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
  const unselectedPartMappings = baseMappings.filter((cm) => !cm.target_property);
  const hasUnselectedPartMappings = unselectedPartMappings.length > 0;
  const unselectedPartMappingsCount = unselectedPartMappings.length;

  const unselectedRelationMappings = activeRelationMappings.flatMap((rm) =>
    Object.values(rm.rel_columns).filter((prop) => !String(prop || "").trim()),
  );
  const hasUnselectedRelationMappings = unselectedRelationMappings.length > 0;
  const unselectedRelationMappingsCount = unselectedRelationMappings.length;
  const hasUnselectedMappings = hasUnselectedPartMappings || hasUnselectedRelationMappings;

  const relationMergeKeyIssueByType = activeRelationMappings.reduce<Record<string, number>>(
    (acc, rm) => {
      const mergeKeys = relationTargetInfoByType[rm.rel_type]?.targetMergeKeys || [];
      if (mergeKeys.length === 0) return acc;

      const hasBasicProperty = Object.keys(rm.node_columns).length > 0;
      if (!hasBasicProperty) return acc;

      const hasMergeKey = mergeKeys.some((mergeKey) => Boolean(rm.node_columns[mergeKey]));
      if (!hasMergeKey) {
        acc[rm.rel_type] = (acc[rm.rel_type] || 0) + 1;
      }
      return acc;
    },
    {},
  );
  const hasRelationMergeKeyIssues = Object.keys(relationMergeKeyIssueByType).length > 0;
  const relationMergeKeyIssueCount = Object.values(relationMergeKeyIssueByType).reduce(
    (sum, count) => sum + count,
    0,
  );

  const partMergeKeys = mergeKeysByLabel.Part || [];
  const partMissingMergeKeys = partMergeKeys.filter(
    (mergeKey) =>
      !baseMappings.some(
        (cm) => !cm.is_extended && cm.target_property && cm.target_property === mergeKey,
      ),
  );
  const hasRequiredPartMergeKeys =
    partMergeKeys.length === 0 || partMissingMergeKeys.length === 0;

  const blockingIssues = useMemo<BlockingIssue[]>(() => {
    const issues: BlockingIssue[] = [];

    unselectedPartMappings.forEach(() => {
      issues.push({ columnId: "Part", reason: "unselected_property" });
    });

    activeRelationMappings.forEach((rm) => {
      const columnId = REL_TYPE_TO_COLUMN[rm.rel_type] || "unmapped";

      Object.values(rm.rel_columns)
        .filter((prop) => !String(prop || "").trim())
        .forEach(() => {
          issues.push({ columnId, reason: "unselected_property" });
        });
    });

    partMissingMergeKeys.forEach(() => {
      issues.push({ columnId: "Part", reason: "merge_key_missing" });
    });

    Object.entries(relationMergeKeyIssueByType).forEach(([relType, count]) => {
      const columnId = REL_TYPE_TO_COLUMN[relType] || "unmapped";
      for (let i = 0; i < count; i += 1) {
        issues.push({ columnId, reason: "merge_key_missing" });
      }
    });

    return issues;
  }, [activeRelationMappings, partMissingMergeKeys, relationMergeKeyIssueByType, unselectedPartMappings]);

  const blockingIssueCount = blockingIssues.length;

  const issueCountByColumn = useMemo(() => {
    return blockingIssues.reduce<Partial<Record<KanbanColumnId, number>>>((acc, issue) => {
      acc[issue.columnId] = (acc[issue.columnId] || 0) + 1;
      return acc;
    }, {});
  }, [blockingIssues]);

  const issueSummaryByColumn = useMemo(() => {
    const byColumn = new Map<KanbanColumnId, Set<string>>();
    for (const issue of blockingIssues) {
      if (!byColumn.has(issue.columnId)) byColumn.set(issue.columnId, new Set());
      const messages = byColumn.get(issue.columnId)!;
      if (issue.reason === "unselected_property") {
        messages.add("속성을 선택하지 않은 카드가 있어요.");
      }
      if (issue.reason === "merge_key_missing") {
        messages.add("매칭키가 지정되지 않았어요.");
      }
    }

    const summary: Partial<Record<KanbanColumnId, string>> = {};
    for (const [columnId, messages] of byColumn.entries()) {
      summary[columnId] = Array.from(messages).join(" · ");
    }
    return summary;
  }, [blockingIssues]);

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
    mergeKeysByLabel,
    // 파생 데이터
    activeRelationMappings,
    unmappedColumns,
    // 통계
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    hasUnselectedPartMappings,
    unselectedPartMappingsCount,
    hasUnselectedRelationMappings,
    unselectedRelationMappingsCount,
    hasUnselectedMappings,
    hasRequiredPartMergeKeys,
    partMissingMergeKeys,
    relationMergeKeyIssueByType,
    hasRelationMergeKeyIssues,
    relationMergeKeyIssueCount,
    blockingIssues,
    issueCountByColumn,
    issueSummaryByColumn,
    blockingIssueCount,
    // 헬퍼
    getSampleData,
  };
}
