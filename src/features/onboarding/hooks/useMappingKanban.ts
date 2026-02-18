import { useMemo } from "react";
import { useMappingStore } from "@/stores/onboarding";
import { useOntologySchema } from "./useOntologySchema";
import { useMappingDerivedState } from "./useMappingDerivedState";
import { useMappingActions } from "./useMappingActions";
import { useMappingSubmit } from "./useMappingSubmit";

// 컬럼 ID
export type KanbanColumnId =
  | "Part"
  | "parent_part"
  | "Supplier"
  | "Drawing"
  | "Project"
  | "unmapped";

// 카드 데이터
export interface KanbanCardData {
  id: string;
  sourceColumn: string;
  targetProperty: string | null;
  confidence: number;
  approved: boolean;
  isExtended: boolean;
  isRelation: boolean;
  relType?: string;
  relProperty?: string;
  sampleData: string[];
}

// 컬럼 데이터
export interface KanbanColumn {
  id: KanbanColumnId;
  title: string;
  color: string;
  cards: KanbanCardData[];
}

// 컬럼↔관계 타입 매핑
const COLUMN_TO_REL_TYPE: Record<string, string> = {
  parent_part: "CONSISTS_OF",
  Supplier: "SUPPLIED_BY",
  Drawing: "DEFINED_BY",
  Project: "HAS_ITEM",
};

// 관계 타입→컬럼 매핑 (역방향)
const REL_TYPE_TO_COLUMN: Record<string, KanbanColumnId> = {
  CONSISTS_OF: "parent_part",
  SUPPLIED_BY: "Supplier",
  DEFINED_BY: "Drawing",
  HAS_ITEM: "Project",
};

// 컬럼 정의
const COLUMN_DEFS: { id: KanbanColumnId; title: string; color: string }[] = [
  { id: "Part", title: "부품 (Part)", color: "blue" },
  { id: "parent_part", title: "상위 Part", color: "indigo" },
  { id: "Supplier", title: "공급사", color: "emerald" },
  { id: "Drawing", title: "도면", color: "amber" },
  { id: "Project", title: "프로젝트", color: "violet" },
  { id: "unmapped", title: "미할당", color: "gray" },
];

export function useMappingKanban() {
  const { effectiveTargetOptions } = useOntologySchema();
  const derived = useMappingDerivedState();
  const actions = useMappingActions(derived.relationTargetInfoByType);
  const { isSubmitting, handleSubmit } = useMappingSubmit();
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);

  const {
    baseMappings,
    extendedMappings,
    activeRelationMappings,
    unmappedColumns,
    totalMappings,
    totalApproved,
    excludedCount,
    hasMappings,
    getSampleData,
    selectableRelationTypeOptions,
    relationPropertyByType,
    relationTargetInfoByType,
  } = derived;

  // 스토어 데이터 → 칸반 컬럼 변환
  const columns = useMemo<KanbanColumn[]>(() => {
    const cardsByColumn: Record<KanbanColumnId, KanbanCardData[]> = {
      Part: [],
      parent_part: [],
      Supplier: [],
      Drawing: [],
      Project: [],
      unmapped: [],
    };

    // 1) 기본 매핑 → Part 컬럼
    for (const cm of baseMappings) {
      cardsByColumn.Part.push({
        id: cm.source_column,
        sourceColumn: cm.source_column,
        targetProperty: cm.target_property,
        confidence: cm.confidence,
        approved: cm.approved,
        isExtended: false,
        isRelation: false,
        sampleData: getSampleData(cm.source_column),
      });
    }

    // 2) 확장 매핑 → Part 컬럼 (isExtended: true)
    for (const cm of extendedMappings) {
      cardsByColumn.Part.push({
        id: cm.source_column,
        sourceColumn: cm.source_column,
        targetProperty: cm.target_property,
        confidence: cm.confidence,
        approved: cm.approved,
        isExtended: true,
        isRelation: false,
        sampleData: getSampleData(cm.source_column),
      });
    }

    // 3) 관계 매핑 → 관계 타입별 컬럼 배치
    for (const rm of activeRelationMappings) {
      const columnId = REL_TYPE_TO_COLUMN[rm.rel_type] || "Part";

      // node_columns의 source_column → 해당 관계 컬럼에 배치
      for (const [, nodeSourceCol] of Object.entries(rm.node_columns)) {
        // 이미 다른 카드로 추가된 경우 중복 방지
        const alreadyAdded = Object.values(cardsByColumn).some(
          (cards) => cards.some((c) => c.id === nodeSourceCol),
        );
        if (alreadyAdded) continue;

        cardsByColumn[columnId].push({
          id: nodeSourceCol,
          sourceColumn: nodeSourceCol,
          targetProperty: null,
          confidence: rm.confidence,
          approved: rm.approved,
          isExtended: false,
          isRelation: true,
          relType: rm.rel_type,
          sampleData: getSampleData(nodeSourceCol),
        });
      }

      // rel_columns의 source_column → 해당 관계 컬럼에 배치
      for (const [relSourceCol, relProp] of Object.entries(rm.rel_columns)) {
        const alreadyAdded = Object.values(cardsByColumn).some(
          (cards) => cards.some((c) => c.id === relSourceCol),
        );
        if (alreadyAdded) continue;

        cardsByColumn[columnId].push({
          id: relSourceCol,
          sourceColumn: relSourceCol,
          targetProperty: null,
          confidence: rm.confidence,
          approved: rm.approved,
          isExtended: false,
          isRelation: true,
          relType: rm.rel_type,
          relProperty: relProp,
          sampleData: getSampleData(relSourceCol),
        });
      }
    }

    // 4) 미할당 → unmapped 컬럼
    for (const col of unmappedColumns) {
      cardsByColumn.unmapped.push({
        id: col,
        sourceColumn: col,
        targetProperty: null,
        confidence: 0,
        approved: false,
        isExtended: false,
        isRelation: false,
        sampleData: getSampleData(col),
      });
    }

    // 원본 헤더 순서 기준 정렬
    const headerIndex = new Map(mappingHeaders.map((h, i) => [h, i]));
    const sortByHeader = (a: KanbanCardData, b: KanbanCardData) =>
      (headerIndex.get(a.sourceColumn) ?? Infinity) - (headerIndex.get(b.sourceColumn) ?? Infinity);

    return COLUMN_DEFS.map((def) => ({
      ...def,
      cards: cardsByColumn[def.id].sort(sortByHeader),
    }));
  }, [baseMappings, extendedMappings, activeRelationMappings, unmappedColumns, getSampleData, mappingHeaders]);

  return {
    columns,
    // 통계
    stats: { totalMappings, totalApproved, excludedCount, hasMappings },
    // 기존 액션 위임
    ...actions,
    // 온톨로지 옵션
    effectiveTargetOptions,
    // 관계 관련 정보
    selectableRelationTypeOptions,
    relationPropertyByType,
    relationTargetInfoByType,
    // 제출
    isSubmitting,
    handleSubmit,
    // 파생 데이터 (SummaryBar props용)
    baseMappingsCount: baseMappings.length,
    extendedMappingsCount: extendedMappings.length,
    activeRelationMappingsCount: activeRelationMappings.length,
  };
}

export { COLUMN_DEFS, COLUMN_TO_REL_TYPE, REL_TYPE_TO_COLUMN };
