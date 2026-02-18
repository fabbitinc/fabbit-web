import type { KanbanColumnId } from "@/features/onboarding/hooks/useMappingKanban";

// 현재 카드의 기존 매핑을 제거하는 헬퍼
export function removeExistingMapping(
  sourceColumn: string,
  fromColumnId: KanbanColumnId,
  columnMappings: { id: string; source_column: string; is_extended?: boolean }[],
  relationMappings: { id: string; rel_columns: Record<string, string>; node_columns: Record<string, string>; dismissed: boolean }[],
  onRemoveColumnMapping: (id: string) => Promise<void>,
  onRemoveExtendedMapping: (id: string) => void,
  onRemoveRelationMapping: (id: string) => void,
) {
  if (fromColumnId === "unmapped") return;

  // Part 컬럼에서 이동: 기본/확장 매핑 제거
  if (fromColumnId === "Part") {
    const cm = columnMappings.find((c) => c.source_column === sourceColumn);
    if (cm) {
      if (cm.is_extended) {
        onRemoveExtendedMapping(cm.id);
      } else {
        void onRemoveColumnMapping(cm.id);
      }
    }
    return;
  }

  // 관계 컬럼에서 이동: 관계 매핑 제거
  const rm = relationMappings.find(
    (r) =>
      !r.dismissed &&
      (Object.keys(r.rel_columns).includes(sourceColumn) ||
        Object.values(r.node_columns).includes(sourceColumn)),
  );
  if (rm) {
    onRemoveRelationMapping(rm.id);
  }
}
