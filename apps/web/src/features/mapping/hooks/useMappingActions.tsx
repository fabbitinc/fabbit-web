import { toast } from "sonner";
import { useMappingStore } from "@/stores/mapping";
import type {
  ColumnMappingEntry,
  RelationMappingEntry,
  RelationTargetInfo,
} from "@/features/mapping/types/mapping.types";
import { MAPPING_TERMS } from "@/features/mapping/constants/mappingTerminology";
import {
  toExtendedPropertyName,
} from "@/features/mapping/utils/mappingUtils";
import { AUTO_APPROVE_CONFIDENCE_THRESHOLD } from "@/features/mapping/constants/mappingConfig";

function normalizeRelationMappings(
  relations: RelationMappingEntry[],
  mappingHeaders: string[],
): RelationMappingEntry[] {
  const seenSources = new Set<string>();
  const normalizedReversed: RelationMappingEntry[] = [];

  for (let i = relations.length - 1; i >= 0; i -= 1) {
    const rm = relations[i];
    const trackSourceUniqueness = !rm.dismissed;

    const nodeEntries = Object.entries(rm.node_columns).filter(([, source]) => {
      if (!source || !mappingHeaders.includes(source)) return false;
      if (trackSourceUniqueness) {
        if (seenSources.has(source)) return false;
        seenSources.add(source);
      }
      return true;
    });

    const relEntries = Object.entries(rm.rel_columns).filter(([source]) => {
      if (!source || !mappingHeaders.includes(source)) return false;
      if (trackSourceUniqueness) {
        if (seenSources.has(source)) return false;
        seenSources.add(source);
      }
      return true;
    });

    const nextNodeColumns = Object.fromEntries(nodeEntries);
    const nextRelColumns = Object.fromEntries(relEntries);

    const referencedRelProps = new Set(
      Object.values(nextRelColumns).filter((prop) => Boolean(String(prop || "").trim())),
    );
    const nextRelColumnTypes = Object.fromEntries(
      Object.entries(rm.rel_column_types).filter(([prop]) => referencedRelProps.has(prop)),
    );

    const shouldDismiss =
      Object.keys(nextNodeColumns).length === 0 &&
      Object.keys(nextRelColumns).length === 0;

    normalizedReversed.push({
      ...rm,
      node_columns: nextNodeColumns,
      rel_columns: nextRelColumns,
      rel_column_types: nextRelColumnTypes,
      dismissed: shouldDismiss || rm.dismissed,
      dismissed_reason: shouldDismiss ? (rm.dismissed_reason || "missing_source_column") : rm.dismissed_reason,
    });
  }

  return normalizedReversed.reverse();
}

/**
 * 매핑 CRUD 핸들러
 */
export function useMappingActions(
  relationTargetInfoByType: Record<string, RelationTargetInfo>,
) {
  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const setMappings = useMappingStore((s) => s.setMappings);
  const resetMappings = useMappingStore((s) => s.resetMappings);

  // ── 내부 헬퍼 ──

  const applyValidatedState = async (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
  ) => {
    const normalizedRelations = normalizeRelationMappings(nextRelations, mappingHeaders);
    setMappings(nextColumns, normalizedRelations);
    return true;
  };

  // ── 공개 핸들러 ──

  const handleResetMappings = () => {
    resetMappings();
    toast.success("초기 매핑 상태로 되돌렸습니다.");
  };

  const handleRemoveColumnMapping = async (id: string) => {
    const removed = columnMappings.find((cm) => cm.id === id);
    if (!removed) return;

    const nextColumns = columnMappings.filter((cm) => cm.id !== id);
    let dismissedCount = 0;
    const nextRelations = relationMappings.map((rm) => {
      const usedInNodeColumns = Object.values(rm.node_columns).includes(removed.source_column);
      const usedInRelColumns = Object.keys(rm.rel_columns).includes(removed.source_column);
      if (!usedInNodeColumns && !usedInRelColumns) return rm;

      dismissedCount += rm.dismissed ? 0 : 1;
      return {
        ...rm,
        dismissed: true,
        approved: false,
        dismissed_reason: usedInNodeColumns
          ? "missing_node_column"
          : "missing_rel_column",
      };
    });

    const ok = await applyValidatedState(nextColumns, nextRelations);
    if (ok && dismissedCount > 0) {
      toast.warning(
        `${MAPPING_TERMS.sourceColumn}이 제거되어 ${MAPPING_TERMS.relationMapping} ${dismissedCount}건이 제외되었습니다.`,
      );
    }
  };

  const handleCreateColumnMapping = (
    sourceColumn: string,
    targetProperty: string,
  ) => {
    // 기본 속성 중복 체크
    const duplicate = columnMappings.find(
      (cm) => !cm.is_extended && cm.target_property === targetProperty,
    );
    if (duplicate) {
      toast.error(
        `"${targetProperty}" 속성은 이미 "${duplicate.source_column}" 컬럼에 매핑되어 있습니다.`,
      );
      return;
    }

    const confidence = 100;
    const nextColumns = [
      ...columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_property: targetProperty,
        data_type: "string",
        confidence,
        reason: "사용자 수동 매핑",
        approved: confidence >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
        is_extended: false,
      },
    ];

    void (async () => {
      const ok = await applyValidatedState(nextColumns, relationMappings);
      if (!ok) return;

      const dismissedCount = relationMappings.filter((rm) => rm.dismissed).length;
      if (dismissedCount > 0) {
        toast.warning(
          `${MAPPING_TERMS.baseMapping} 추가 후에도 제외된 ${MAPPING_TERMS.relationMapping} ${dismissedCount}건이 있습니다.`,
        );
      }
    })();
  };

  const handleApproveRelationMapping = async (id: string) => {
    const target = relationMappings.find((rm) => rm.id === id);
    if (!target || target.dismissed) return;

    // node_columns의 source_column이 Excel 헤더에 존재하는지 확인
    const missingNodeColumns = Object.values(target.node_columns).filter(
      (sourceColumn) => !mappingHeaders.includes(sourceColumn),
    );

    if (missingNodeColumns.length > 0) {
      toast.warning(
        <span>
          {MAPPING_TERMS.relationMapping} 할당에 필요한 {MAPPING_TERMS.sourceColumn}이 없습니다. 누락된{" "}
          {MAPPING_TERMS.sourceColumn}: <strong>{missingNodeColumns.join(", ")}</strong>
        </span>,
      );
      return;
    }

    const nextRelations = relationMappings.map((rm) =>
      rm.id === id ? { ...rm, approved: true, dismissed: false, dismissed_reason: null } : rm,
    );
    await applyValidatedState(columnMappings, nextRelations);
  };

  const handleCreateExtendedMapping = (
    sourceColumn: string,
    propertyName?: string,
  ) => {
    const nextPropertyName =
      propertyName && propertyName.startsWith("_ext_")
        ? propertyName
        : toExtendedPropertyName(sourceColumn);

    const nextColumns = [
      ...columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_property: nextPropertyName,
        data_type: "string",
        confidence: 100,
        reason: "사용자 확장 속성 추가",
        approved: true,
        is_extended: true,
      },
    ];

    void applyValidatedState(nextColumns, relationMappings);
  };

  const handleCreateRelationMapping = (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => {
    const {
      columnMappings: latestColumns,
      relationMappings: latestRelations,
    } = useMappingStore.getState();

    const targetInfo = relationTargetInfoByType[relType];
    const targetLabel = targetInfo?.targetLabel || "";

    if (!targetLabel) {
      toast.error("선택한 관계 타입의 정의를 찾을 수 없습니다.");
      return;
    }

    const existingIndex = latestRelations.findIndex(
      (rm) =>
        rm.rel_type === relType &&
        rm.target_label === targetLabel &&
        JSON.stringify(rm.node_columns) === JSON.stringify(nodeColumns),
    );

    const existingRelation = existingIndex >= 0 ? latestRelations[existingIndex] : null;

    const hasRelColumns = Object.keys(relColumns).length > 0;

    // 관계 속성 없이 관계만 생성하는 경우
    if (!hasRelColumns) {
      if (existingRelation) {
        if (existingRelation.dismissed) {
          const nextRelations = latestRelations.map((rm, idx) =>
            idx === existingIndex
              ? {
                  ...rm,
                  dismissed: false,
                  dismissed_reason: null,
                  approved: false,
                }
              : rm,
          );
          void applyValidatedState(latestColumns, nextRelations);
          return;
        }
        toast.info("이미 동일한 관계가 존재합니다.");
        return;
      }
      const nextRelations = [
        ...latestRelations,
        {
          id: `rm-${Date.now()}`,
          rel_type: relType,
          target_label: targetLabel,
          node_columns: nodeColumns,
          rel_columns: {},
          rel_column_types: {},
          confidence: 100,
          reason: "사용자 수동 추가",
          approved: false,
          dismissed: false,
          dismissed_reason: null,
        },
      ];
      void applyValidatedState(latestColumns, nextRelations);
      return;
    }

    // 관계 속성이 있는 경우: 기존 관계에 병합 또는 신규 생성
    const nextRelations =
      existingIndex >= 0
        ? latestRelations.map((rm, idx) =>
            idx === existingIndex
              ? {
                  ...rm,
                  dismissed: false,
                  dismissed_reason: null,
                  approved: false,
                  rel_columns: {
                    ...rm.rel_columns,
                    ...relColumns,
                  },
                  rel_column_types: {
                    ...rm.rel_column_types,
                    ...relColumnTypes,
                  },
                }
              : rm,
          )
        : [
            ...latestRelations,
            {
              id: `rm-${Date.now()}`,
              rel_type: relType,
              target_label: targetLabel,
              node_columns: nodeColumns,
              rel_columns: relColumns,
              rel_column_types: relColumnTypes,
              confidence: 100,
              reason: "사용자 수동 추가",
              approved: false,
              dismissed: false,
              dismissed_reason: null,
            },
          ];

    void applyValidatedState(latestColumns, nextRelations);
  };

  const handleRemoveExtendedMapping = (id: string) => {
    const state = useMappingStore.getState();
    void applyValidatedState(
      state.columnMappings.filter((cm) => cm.id !== id),
      state.relationMappings,
    );
  };

  const handleRemoveRelationMapping = (id: string) => {
    const state = useMappingStore.getState();
    void applyValidatedState(
      state.columnMappings,
      state.relationMappings.filter((rm) => rm.id !== id),
    );
  };

  const handleRemoveRelationCardMapping = (sourceColumn: string) => {
    const { columnMappings: cols, relationMappings: rels } = useMappingStore.getState();
    let changed = false;

    const nextRelations = rels.map((rm) => {
      if (rm.dismissed) return rm;

      const hasNode = Object.values(rm.node_columns).includes(sourceColumn);
      const hasRel = Object.keys(rm.rel_columns).includes(sourceColumn);
      if (!hasNode && !hasRel) return rm;

      changed = true;

      const nextNodeColumns = Object.fromEntries(
        Object.entries(rm.node_columns).filter(([, value]) => value !== sourceColumn),
      );

      const nextRelColumns = { ...rm.rel_columns };
      const removedRelProperty = nextRelColumns[sourceColumn];
      delete nextRelColumns[sourceColumn];

      const nextRelColumnTypes = { ...rm.rel_column_types };
      if (
        removedRelProperty &&
        !Object.values(nextRelColumns).includes(removedRelProperty)
      ) {
        delete nextRelColumnTypes[removedRelProperty];
      }

      const shouldDismiss =
        Object.keys(nextNodeColumns).length === 0 &&
        Object.keys(nextRelColumns).length === 0;

      return {
        ...rm,
        node_columns: nextNodeColumns,
        rel_columns: nextRelColumns,
        rel_column_types: nextRelColumnTypes,
        approved: false,
        dismissed: shouldDismiss,
        dismissed_reason: shouldDismiss ? "missing_source_column" : null,
      };
    });

    if (!changed) return;
    void applyValidatedState(cols, nextRelations);
  };

  /**
   * 전체 승인
   */
  const handleApproveAll = async () => {
    const nextColumns = columnMappings.map((cm) => ({ ...cm, approved: true }));
    const nextRelations = relationMappings.map((rm) =>
      rm.dismissed ? rm : { ...rm, approved: true },
    );

    await applyValidatedState(nextColumns, nextRelations);
  };

  // 기존 기본 매핑의 target_property를 atomic하게 변경
  const handleChangeColumnMappingTarget = (
    sourceColumn: string,
    newTargetProperty: string,
  ) => {
    const duplicate = columnMappings.find(
      (cm) => !cm.is_extended && cm.target_property === newTargetProperty,
    );
    if (duplicate) {
      toast.error(
        `"${newTargetProperty}" 속성은 이미 "${duplicate.source_column}" 컬럼에 매핑되어 있습니다.`,
      );
      return;
    }

    const nextColumns = columnMappings.map((cm) =>
      cm.source_column === sourceColumn && !cm.is_extended
        ? { ...cm, target_property: newTargetProperty, confidence: 100, reason: "사용자 수동 변경" }
        : cm,
    );

    void applyValidatedState(nextColumns, relationMappings);
  };

  /**
   * Part 컬럼 속성 통합 설정 (선택/기본속성/확장속성)
   * store.getState()로 최신 상태를 읽어 stale closure 문제 방지
   */
  const EXTENDED_VALUE = "__extended__";
  const handleSetPartMapping = (sourceColumn: string, targetProperty: string) => {
    const { columnMappings: cols, relationMappings: rels } = useMappingStore.getState();
    const isExtended = targetProperty === EXTENDED_VALUE;
    const isEmpty = !targetProperty;
    const existing = cols.find((cm) => cm.source_column === sourceColumn);

    // "선택" 상태 — Part에 배치만 (검증 불필요)
    if (isEmpty) {
      const next = existing
        ? cols.map((cm) =>
            cm.source_column === sourceColumn
              ? { ...cm, target_property: "", is_extended: false, confidence: 0, reason: "" }
              : cm,
          )
        : [...cols, {
            id: `cm-${Date.now()}`,
            source_column: sourceColumn,
            target_property: "",
            data_type: "string",
            confidence: 0,
            reason: "",
            approved: false,
            is_extended: false,
          }];
      void applyValidatedState(next, rels);
      return;
    }

    // 확장 속성 (검증 불필요)
    if (isExtended) {
      const extName = toExtendedPropertyName(sourceColumn);
      const next = existing
        ? cols.map((cm) =>
            cm.source_column === sourceColumn
              ? { ...cm, target_property: extName, is_extended: true, confidence: 100, reason: "사용자 확장 속성 변경", approved: false }
              : cm,
          )
        : [...cols, {
            id: `cm-${Date.now()}`,
            source_column: sourceColumn,
            target_property: extName,
            data_type: "string",
            confidence: 100,
            reason: "사용자 확장 속성 추가",
            approved: false,
            is_extended: true,
          }];
      void applyValidatedState(next, rels);
      return;
    }

    // 기본 속성 — 중복 체크 + 검증 API
    const duplicate = cols.find(
      (cm) => !cm.is_extended && cm.target_property === targetProperty && cm.source_column !== sourceColumn,
    );
    if (duplicate) {
      toast.error(`"${targetProperty}" 속성은 이미 "${duplicate.source_column}" 컬럼에 매핑되어 있습니다.`);
      return;
    }

    const nextColumns = existing
      ? cols.map((cm) =>
          cm.source_column === sourceColumn
            ? { ...cm, target_property: targetProperty, is_extended: false, confidence: 100, reason: "사용자 수동 변경" }
            : cm,
        )
      : [...cols, {
          id: `cm-${Date.now()}`,
          source_column: sourceColumn,
          target_property: targetProperty,
          data_type: "string",
          confidence: 100,
          reason: "사용자 수동 매핑",
          approved: false,
          is_extended: false,
        }];
    void applyValidatedState(nextColumns, rels);
  };

  const handleSetRelationCardMapping = (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => {
    const { columnMappings: cols, relationMappings: rels } = useMappingStore.getState();
    const relationIndex = rels.findIndex(
      (rm) =>
        !rm.dismissed &&
        rm.rel_type === relType &&
        (Object.values(rm.node_columns).includes(sourceColumn) ||
          Object.keys(rm.rel_columns).includes(sourceColumn)),
    );
    if (relationIndex < 0) return;

    const targetRelation = rels[relationIndex];
    const currentNodeColumns = Object.fromEntries(
      Object.entries(targetRelation.node_columns).filter(([, value]) => value !== sourceColumn),
    );
    const currentRelColumns = { ...targetRelation.rel_columns };
    const removedRelProperty = currentRelColumns[sourceColumn];
    delete currentRelColumns[sourceColumn];

    const currentRelColumnTypes = { ...targetRelation.rel_column_types };
    if (
      removedRelProperty &&
      !Object.values(currentRelColumns).includes(removedRelProperty)
    ) {
      delete currentRelColumnTypes[removedRelProperty];
    }

    if (mappingType === "node") {
      const existingSource = currentNodeColumns[property];
      if (existingSource && existingSource !== sourceColumn) {
        toast.error(`"${property}" 매칭키는 이미 "${existingSource}" 컬럼에 할당되어 있습니다.`);
        return;
      }
      currentNodeColumns[property] = sourceColumn;
    } else {
      currentRelColumns[sourceColumn] = property;
      if (!currentRelColumnTypes[property]) {
        currentRelColumnTypes[property] = "string";
      }
    }

    const nextRelations = rels.map((rm, idx) =>
      idx === relationIndex
        ? {
            ...rm,
            node_columns: currentNodeColumns,
            rel_columns: currentRelColumns,
            rel_column_types: currentRelColumnTypes,
            approved: false,
            dismissed: false,
            dismissed_reason: null,
          }
        : rm,
    );

    void applyValidatedState(cols, nextRelations);
  };

  return {
    handleResetMappings,
    handleRemoveColumnMapping,
    handleCreateColumnMapping,
    handleChangeColumnMappingTarget,
    handleSetPartMapping,
    handleSetRelationCardMapping,
    handleApproveRelationMapping,
    handleCreateExtendedMapping,
    handleCreateRelationMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleRemoveRelationCardMapping,
    handleApproveAll,
  };
}
