import { createContext, useContext } from "react";
import type { ColumnMappingModel, RelationMappingModel, RelationTargetInfoModel, TargetPropertyOptionModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

export interface KanbanContextValue {
  effectiveTargetOptions: TargetPropertyOptionModel[];
  columnMappings: ColumnMappingModel[];
  relationMappings: RelationMappingModel[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, RelationTargetInfoModel>;
  mergeKeysByLabel: Record<string, string[]>;
  onSetPartMapping: (sourceColumn: string, targetProperty: string) => void;
  onSetRelationCardMapping: (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => void;
  onRemoveColumnMapping: (mappingId: string) => void;
  onRemoveExtendedMapping: (mappingId: string) => void;
  onRemoveRelationMapping: (mappingId: string) => void;
  onRemoveRelationCardMapping: (sourceColumn: string) => void;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export const KanbanProvider = KanbanContext.Provider;

export function useKanbanContext() {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("useKanbanContext는 KanbanProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
