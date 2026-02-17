import { useRef } from "react";
import { toast } from "sonner";
import { useMappingStore, useUploadStore } from "@/stores/onboarding";
import { validateMapping } from "@/api/onboarding";
import type {
  ColumnMappingEntry,
  RelationMappingEntry,
  RelationTargetInfo,
} from "@/features/onboarding/types/onboarding.types";
import type { MappingResultDTO } from "@/api/types/onboarding";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import {
  toExtendedPropertyName,
  getRelationIdentityKey,
  extractApiErrorMessage,
} from "@/features/onboarding/utils/mappingUtils";
import { AUTO_APPROVE_CONFIDENCE_THRESHOLD } from "@/features/onboarding/constants/mappingConfig";

/**
 * 매핑 CRUD 핸들러 + 검증 API 연동
 *
 * 모든 변경은 buildDraftMapping → validateMapping → applyValidatedState 파이프라인을 거침.
 */
export function useMappingActions(
  relationTargetInfoByType: Record<string, RelationTargetInfo>,
) {
  const validateRequestSeqRef = useRef(0);

  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const mappingHeaders = useMappingStore((s) => s.mappingHeaders);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);
  const setMappings = useMappingStore((s) => s.setMappings);
  const resetMappings = useMappingStore((s) => s.resetMappings);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);

  // ── 내부 헬퍼 ──

  const buildDraftMapping = (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
  ): MappingResultDTO => ({
    property_mappings: nextColumns.map((cm) => ({
      source_column: cm.source_column,
      target_property: cm.target_property,
      data_type: cm.data_type,
      confidence: cm.confidence,
      reason: cm.reason,
      is_extended: cm.is_extended || false,
    })),
    relation_mappings: nextRelations
      .filter((rm) => !rm.dismissed)
      .map((rm) => ({
        rel_type: rm.rel_type,
        target_label: rm.target_label,
        node_columns: rm.node_columns,
        rel_columns: rm.rel_columns,
        rel_column_types: rm.rel_column_types,
        confidence: rm.confidence,
        reason: rm.reason,
      })),
  });

  const applyValidatedState = async (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
  ) => {
    const requestSeq = ++validateRequestSeqRef.current;

    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return false;
    }

    try {
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: buildDraftMapping(nextColumns, nextRelations),
      });

      const errors = validation.errors || [];
      if (errors.length > 0) {
        toast.error(errors[0].message || "매핑 검증에 실패했습니다.");
        return false;
      }

      const warnings = validation.warnings || [];
      if (warnings.length > 0) {
        toast.warning(warnings[0].message || "매핑 검증 경고가 있습니다.");
      }

      if (requestSeq !== validateRequestSeqRef.current) {
        return false;
      }

      const normalized = validation.normalized_mapping;
      const normalizedRelationMap = new Map(
        normalized.relation_mappings.map((rm) => [
          [
            rm.rel_type,
            rm.target_label,
            JSON.stringify(rm.node_columns || {}),
            JSON.stringify(rm.rel_columns || {}),
          ].join("|"),
          rm,
        ]),
      );

      const finalColumns = normalized.property_mappings.map((pm, idx) => {
        const existing =
          nextColumns.find(
            (item) =>
              item.source_column === pm.source_column &&
              item.target_property === pm.target_property,
          ) ||
          columnMappings.find(
            (item) =>
              item.source_column === pm.source_column &&
              item.target_property === pm.target_property,
          );

        return {
          id: existing?.id || `cm-auto-${idx + 1}`,
          source_column: pm.source_column,
          target_property: pm.target_property,
          data_type: pm.data_type,
          confidence: pm.confidence,
          reason: pm.reason,
          approved: existing?.approved ?? (pm.is_extended ? true : pm.confidence >= AUTO_APPROVE_CONFIDENCE_THRESHOLD),
          is_extended: pm.is_extended || false,
        };
      });

      const finalRelations = nextRelations.map((rm) => {
        const relationKey = getRelationIdentityKey(rm);
        const normalizedRelation = normalizedRelationMap.get(relationKey);

        if (rm.dismissed) return rm;

        if (!normalizedRelation) {
          return {
            ...rm,
            dismissed: true,
            approved: false,
            dismissed_reason: rm.dismissed_reason || "missing_source_column",
          };
        }

        return {
          ...rm,
          node_columns: { ...normalizedRelation.node_columns },
          rel_columns: { ...normalizedRelation.rel_columns },
          rel_column_types: { ...normalizedRelation.rel_column_types },
          dismissed: false,
          dismissed_reason: null,
        };
      });

      setMappings(finalColumns, finalRelations);
      return true;
    } catch (err) {
      console.error("Mapping validate failed:", err);
      toast.error(extractApiErrorMessage(err, "매핑 검증에 실패했습니다."));
      return false;
    }
  };

  // ── 공개 핸들러 ──

  const handleResetMappings = () => {
    validateRequestSeqRef.current += 1;
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
    if (!editableConstraints) {
      toast.error("관계 속성 제약 정보를 찾을 수 없습니다.");
      return;
    }

    const targetInfo = relationTargetInfoByType[relType];
    const relationCatalog = editableConstraints.relation_catalog || [];
    const relationDef = relationCatalog.find((item) => item.rel_type === relType);
    const targetLabel = relationDef?.to_label || targetInfo?.targetLabel || "";

    if (!targetLabel) {
      toast.error("선택한 관계 타입의 정의를 찾을 수 없습니다.");
      return;
    }

    const existingIndex = relationMappings.findIndex(
      (rm) =>
        rm.rel_type === relType &&
        rm.target_label === targetLabel &&
        JSON.stringify(rm.node_columns) === JSON.stringify(nodeColumns),
    );

    const existingRelation = existingIndex >= 0 ? relationMappings[existingIndex] : null;

    const hasRelColumns = Object.keys(relColumns).length > 0;

    // 관계 속성 없이 관계만 생성하는 경우
    if (!hasRelColumns) {
      if (existingRelation) {
        toast.info("이미 동일한 관계가 존재합니다.");
        return;
      }
      const nextRelations = [
        ...relationMappings,
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
      void applyValidatedState(columnMappings, nextRelations);
      return;
    }

    // 관계 속성이 있는 경우: 기존 관계에 병합 또는 신규 생성
    const nextRelations =
      existingIndex >= 0
        ? relationMappings.map((rm, idx) =>
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
            ...relationMappings,
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

    void applyValidatedState(columnMappings, nextRelations);
  };

  const handleRemoveExtendedMapping = (id: string) => {
    const state = useMappingStore.getState();
    setMappings(
      state.columnMappings.filter((cm) => cm.id !== id),
      state.relationMappings,
    );
  };

  const handleRemoveRelationMapping = (id: string) => {
    const state = useMappingStore.getState();
    setMappings(
      state.columnMappings,
      state.relationMappings.filter((rm) => rm.id !== id),
    );
  };

  /**
   * 전체 승인 — 검증 API를 경유
   */
  const handleApproveAll = async () => {
    const nextColumns = columnMappings.map((cm) => ({ ...cm, approved: true }));
    const nextRelations = relationMappings.map((rm) =>
      rm.dismissed ? rm : { ...rm, approved: true },
    );

    await applyValidatedState(nextColumns, nextRelations);
  };

  return {
    handleResetMappings,
    handleRemoveColumnMapping,
    handleCreateColumnMapping,
    handleApproveRelationMapping,
    handleCreateExtendedMapping,
    handleCreateRelationMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleApproveAll,
  };
}
