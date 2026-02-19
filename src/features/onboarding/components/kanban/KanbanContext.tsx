import { createContext, useContext } from "react";
import type {
  ColumnMappingEntry,
  RelationMappingEntry,
  RelationTargetInfo,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";

export interface KanbanContextValue {
  // Part 매핑 옵션
  effectiveTargetOptions: TargetPropertyOption[];
  columnMappings: ColumnMappingEntry[];
  // Part 매핑 통합 액션 (선택/기본속성/확장속성)
  onSetPartMapping: (source: string, targetProperty: string) => void;
  onSetRelationCardMapping: (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => void;
  // 매핑 제거 액션
  onRemoveColumnMapping: (id: string) => Promise<void>;
  onRemoveExtendedMapping: (id: string) => void;
  onRemoveRelationMapping: (id: string) => void;
  onRemoveRelationCardMapping: (sourceColumn: string) => void;
  // 관계 매핑 정보
  relationMappings: RelationMappingEntry[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, RelationTargetInfo>;
  mergeKeysByLabel: Record<string, string[]>;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export const KanbanProvider = KanbanContext.Provider;

export function useKanbanContext() {
  const ctx = useContext(KanbanContext);
  if (!ctx) {
    throw new Error("useKanbanContext는 KanbanProvider 내부에서 사용해야 합니다.");
  }
  return ctx;
}
