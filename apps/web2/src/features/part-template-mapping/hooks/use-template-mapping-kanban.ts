import { useMemo } from "react";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type { OntologySchemaModel } from "@/features/part-template-mapping/types/part-template-mapping-model";
import { useTemplateMappingActions } from "./use-template-mapping-actions";
import { useTemplateMappingDerivedState } from "./use-template-mapping-derived-state";

export type KanbanColumnId =
  | "Part"
  | "parent_part"
  | "Supplier"
  | "Drawing"
  | "Project"
  | "unmapped";

export interface KanbanCardData {
  id: string;
  sourceColumn: string;
  targetProperty: string | null;
  confidence: number;
  approved: boolean;
  isExtended: boolean;
  isRelation: boolean;
  relType?: string;
  relNodeProperty?: string;
  relProperty?: string;
  sampleData: string[];
}

export interface KanbanColumnModel {
  id: KanbanColumnId;
  title: string;
  color: string;
  cards: KanbanCardData[];
}

export const COLUMN_TO_REL_TYPE: Record<string, string> = {
  parent_part: "CONSISTS_OF",
  Supplier: "SUPPLIED_BY",
  Drawing: "DEFINED_BY",
  Project: "HAS_ITEM",
};

const REL_TYPE_TO_COLUMN: Record<string, KanbanColumnId> = {
  CONSISTS_OF: "parent_part",
  SUPPLIED_BY: "Supplier",
  DEFINED_BY: "Drawing",
  HAS_ITEM: "Project",
};

const COLUMN_DEFS: Array<{ id: KanbanColumnId; title: string; color: string }> = [
  { id: "Part", title: "부품", color: "blue" },
  { id: "parent_part", title: "상위 부품", color: "indigo" },
  { id: "Supplier", title: "공급사", color: "emerald" },
  { id: "Drawing", title: "도면", color: "amber" },
  { id: "Project", title: "프로젝트", color: "violet" },
  { id: "unmapped", title: "미할당", color: "gray" },
];

export function useTemplateMappingKanban(ontologySchema?: OntologySchemaModel) {
  const derived = useTemplateMappingDerivedState(ontologySchema);
  const actions = useTemplateMappingActions(derived.relationTargetInfoByType);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const columnMappings = usePartTemplateMappingStore((state) => state.columnMappings);
  const relationMappings = usePartTemplateMappingStore((state) => state.relationMappings);

  const columns = useMemo<KanbanColumnModel[]>(() => {
    const cardsByColumn: Record<KanbanColumnId, KanbanCardData[]> = {
      Part: [],
      parent_part: [],
      Supplier: [],
      Drawing: [],
      Project: [],
      unmapped: [],
    };

    for (const mapping of derived.baseMappings) {
      cardsByColumn.Part.push({
        id: mapping.sourceColumn,
        sourceColumn: mapping.sourceColumn,
        targetProperty: mapping.targetProperty,
        confidence: mapping.confidence,
        approved: mapping.approved,
        isExtended: false,
        isRelation: false,
        sampleData: derived.getSampleData(mapping.sourceColumn),
      });
    }

    for (const mapping of derived.extendedMappings) {
      cardsByColumn.Part.push({
        id: mapping.sourceColumn,
        sourceColumn: mapping.sourceColumn,
        targetProperty: mapping.targetProperty,
        confidence: mapping.confidence,
        approved: mapping.approved,
        isExtended: true,
        isRelation: false,
        sampleData: derived.getSampleData(mapping.sourceColumn),
      });
    }

    for (const relation of derived.activeRelationMappings) {
      const columnId = REL_TYPE_TO_COLUMN[relation.relType] || "Part";

      for (const [nodeProperty, sourceColumn] of Object.entries(relation.nodeColumns)) {
        const alreadyAdded = Object.values(cardsByColumn).some((cards) =>
          cards.some((card) => card.id === sourceColumn),
        );

        if (alreadyAdded) {
          continue;
        }

        cardsByColumn[columnId].push({
          id: sourceColumn,
          sourceColumn,
          targetProperty: null,
          confidence: relation.confidence,
          approved: relation.approved,
          isExtended: false,
          isRelation: true,
          relType: relation.relType,
          relNodeProperty: nodeProperty,
          sampleData: derived.getSampleData(sourceColumn),
        });
      }

      for (const [sourceColumn, relationProperty] of Object.entries(relation.relColumns)) {
        const alreadyAdded = Object.values(cardsByColumn).some((cards) =>
          cards.some((card) => card.id === sourceColumn),
        );

        if (alreadyAdded) {
          continue;
        }

        cardsByColumn[columnId].push({
          id: sourceColumn,
          sourceColumn,
          targetProperty: null,
          confidence: relation.confidence,
          approved: relation.approved,
          isExtended: false,
          isRelation: true,
          relType: relation.relType,
          relProperty: relationProperty,
          sampleData: derived.getSampleData(sourceColumn),
        });
      }
    }

    for (const sourceColumn of derived.unmappedColumns) {
      cardsByColumn.unmapped.push({
        id: sourceColumn,
        sourceColumn,
        targetProperty: null,
        confidence: 0,
        approved: false,
        isExtended: false,
        isRelation: false,
        sampleData: derived.getSampleData(sourceColumn),
      });
    }

    const headerIndex = new Map(mappingHeaders.map((header, index) => [header, index]));
    const sortByHeader = (left: KanbanCardData, right: KanbanCardData) =>
      (headerIndex.get(left.sourceColumn) ?? Number.POSITIVE_INFINITY) -
      (headerIndex.get(right.sourceColumn) ?? Number.POSITIVE_INFINITY);

    return COLUMN_DEFS.map((column) => ({
      ...column,
      cards: cardsByColumn[column.id].sort(sortByHeader),
    }));
  }, [derived.activeRelationMappings, derived.baseMappings, derived.extendedMappings, derived.getSampleData, derived.unmappedColumns, mappingHeaders]);

  return {
    columns,
    columnMappings,
    relationMappings,
    effectiveTargetOptions: derived.effectiveTargetOptions,
    selectableRelationTypeOptions: derived.selectableRelationTypeOptions,
    relationPropertyByType: derived.relationPropertyByType,
    relationTargetInfoByType: derived.relationTargetInfoByType,
    mergeKeysByLabel: derived.mergeKeysByLabel,
    issueCountByColumn: derived.issueCountByColumn,
    issueSummaryByColumn: derived.issueSummaryByColumn,
    stats: {
      totalMappings: derived.totalMappings,
      totalApproved: derived.totalApproved,
      excludedCount: derived.excludedCount,
      hasMappings: derived.hasMappings,
    },
    ...actions,
  };
}
