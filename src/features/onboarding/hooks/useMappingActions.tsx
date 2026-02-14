import { useRef } from "react";
import { toast } from "sonner";
import { useMappingStore, useUploadStore } from "@/stores/onboarding";
import { validateMapping } from "@/api/onboarding";
import type {
  ColumnMappingEntry,
  ExtendedPropertyEntry,
  RelationMappingEntry,
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
 * handleApproveAll도 검증 API를 경유하여 버그 #1을 수정.
 */
export function useMappingActions(
  relationEndpointOptionsByType: Record<
    string,
    { fromColumns: string[]; toColumns: string[]; fromLabel: string; toLabel: string }
  >,
) {
  const validateRequestSeqRef = useRef(0);

  const columnMappings = useMappingStore((s) => s.columnMappings);
  const relationMappings = useMappingStore((s) => s.relationMappings);
  const extendedMappings = useMappingStore((s) => s.extendedMappings);
  const editableConstraints = useMappingStore((s) => s.editableConstraints);
  const setMappings = useMappingStore((s) => s.setMappings);
  const resetMappings = useMappingStore((s) => s.resetMappings);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);

  // ── 내부 헬퍼 ──

  const buildDraftMapping = (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
    nextExtended: ExtendedPropertyEntry[],
  ): MappingResultDTO => ({
    column_mappings: nextColumns.map((cm) => ({
      source_column: cm.source_column,
      target_label: cm.target_label,
      target_property: cm.target_property,
      data_type: cm.data_type,
      confidence: cm.confidence,
      reason: cm.reason,
    })),
    relation_mappings: nextRelations
      .filter((rm) => !rm.dismissed)
      .map((rm) => ({
        from_label: rm.from_label,
        to_label: rm.to_label,
        rel_type: rm.rel_type,
        from_columns: rm.from_columns,
        to_columns: rm.to_columns,
        properties: rm.properties,
        property_types: rm.property_types,
      })),
    extended_properties: nextExtended.map((ep) => ({
      source_column: ep.source_column,
      target_label: ep.target_label,
      property_name: ep.property_name,
      data_type: ep.data_type,
      confidence: ep.confidence,
      reason: ep.reason,
    })),
  });

  const applyValidatedState = async (
    nextColumns: ColumnMappingEntry[],
    nextRelations: RelationMappingEntry[],
    nextExtended: ExtendedPropertyEntry[],
  ) => {
    const requestSeq = ++validateRequestSeqRef.current;

    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return false;
    }

    try {
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: buildDraftMapping(nextColumns, nextRelations, nextExtended),
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
            rm.from_label,
            rm.rel_type,
            rm.to_label,
            JSON.stringify(rm.from_columns || {}),
            JSON.stringify(rm.to_columns || {}),
            JSON.stringify(rm.properties || {}),
          ].join("|"),
          rm,
        ]),
      );

      const finalColumns = normalized.column_mappings.map((cm, idx) => {
        const existing =
          nextColumns.find(
            (item) =>
              item.source_column === cm.source_column &&
              item.target_label === cm.target_label &&
              item.target_property === cm.target_property,
          ) ||
          columnMappings.find(
            (item) =>
              item.source_column === cm.source_column &&
              item.target_label === cm.target_label &&
              item.target_property === cm.target_property,
          );

        return {
          id: existing?.id || `cm-auto-${idx + 1}`,
          source_column: cm.source_column,
          target_label: cm.target_label,
          target_property: cm.target_property,
          data_type: cm.data_type,
          confidence: cm.confidence,
          reason: cm.reason,
          approved: existing?.approved ?? cm.confidence >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
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
          from_columns: { ...normalizedRelation.from_columns },
          to_columns: { ...normalizedRelation.to_columns },
          properties: { ...normalizedRelation.properties },
          property_types: { ...normalizedRelation.property_types },
          dismissed: false,
          dismissed_reason: null,
        };
      });

      const finalExtended = normalized.extended_properties.map((ep, idx) => {
        const existing =
          nextExtended.find(
            (item) =>
              item.source_column === ep.source_column &&
              item.target_label === ep.target_label &&
              item.property_name === ep.property_name,
          ) ||
          extendedMappings.find(
            (item) =>
              item.source_column === ep.source_column &&
              item.target_label === ep.target_label &&
              item.property_name === ep.property_name,
          );

        return {
          id: existing?.id || `ep-auto-${idx + 1}`,
          source_column: ep.source_column,
          target_label: ep.target_label,
          property_name: ep.property_name,
          data_type: ep.data_type,
          confidence: ep.confidence,
          reason: ep.reason,
          approved: existing?.approved ?? true,
        };
      });

      setMappings(finalColumns, finalRelations, finalExtended);
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
      const usedInFrom = Object.values(rm.from_columns).includes(removed.source_column);
      const usedInTo = Object.values(rm.to_columns).includes(removed.source_column);
      if (!usedInFrom && !usedInTo) return rm;

      dismissedCount += rm.dismissed ? 0 : 1;
      return {
        ...rm,
        dismissed: true,
        approved: false,
        dismissed_reason: usedInFrom
          ? "missing_from_endpoint"
          : "missing_to_endpoint",
      };
    });

    const ok = await applyValidatedState(nextColumns, nextRelations, extendedMappings);
    if (ok && dismissedCount > 0) {
      toast.warning(
        `${MAPPING_TERMS.sourceColumn}이 제거되어 ${MAPPING_TERMS.relationMapping} ${dismissedCount}건이 제외되었습니다.`,
      );
    }
  };

  const handleCreateColumnMapping = (
    sourceColumn: string,
    targetLabel: string,
    targetProperty: string,
  ) => {
    const confidence = 100;
    const nextColumns = [
      ...columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        target_property: targetProperty,
        data_type: "string",
        confidence,
        reason: "사용자 수동 매핑",
        approved: confidence >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
      },
    ];

    void (async () => {
      const ok = await applyValidatedState(nextColumns, relationMappings, extendedMappings);
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

    const missingFrom = Object.entries(target.from_columns)
      .filter(
        ([prop, sourceColumn]) =>
          !columnMappings.some(
            (cm) =>
              cm.source_column === sourceColumn &&
              cm.target_label === target.from_label &&
              cm.target_property === prop,
          ),
      )
      .map(([, sourceColumn]) => sourceColumn);

    const missingTo = Object.entries(target.to_columns)
      .filter(
        ([prop, sourceColumn]) =>
          !columnMappings.some(
            (cm) =>
              cm.source_column === sourceColumn &&
              cm.target_label === target.to_label &&
              cm.target_property === prop,
          ),
      )
      .map(([, sourceColumn]) => sourceColumn);

    const missingEndpointColumns = [...new Set([...missingFrom, ...missingTo])];

    if (missingEndpointColumns.length > 0) {
      const mappedAsExtended = missingEndpointColumns.filter((col) =>
        extendedMappings.some((ep) => ep.source_column === col),
      );
      if (mappedAsExtended.length > 0) {
        toast.warning(
          <span>
            {MAPPING_TERMS.relationMapping}의 연결 기준은 {MAPPING_TERMS.baseMapping}에 있어야 합니다.{" "}
            {MAPPING_TERMS.extendedMapping}에만 있는 {MAPPING_TERMS.sourceColumn}:{" "}
            <strong>{mappedAsExtended.join(", ")}</strong>
          </span>,
        );
      } else {
        toast.warning(
          <span>
            {MAPPING_TERMS.relationMapping} 할당에 필요한 연결 기준이 없습니다. 누락된{" "}
            {MAPPING_TERMS.sourceColumn}: <strong>{missingEndpointColumns.join(", ")}</strong>
          </span>,
        );
      }
      return;
    }

    const nextRelations = relationMappings.map((rm) =>
      rm.id === id ? { ...rm, approved: true, dismissed: false, dismissed_reason: null } : rm,
    );
    await applyValidatedState(columnMappings, nextRelations, extendedMappings);
  };

  const handleCreateExtendedMapping = (
    sourceColumn: string,
    targetLabel: string,
    propertyName?: string,
  ) => {
    const nextPropertyName =
      propertyName && propertyName.startsWith("_ext_")
        ? propertyName
        : toExtendedPropertyName(sourceColumn);

    const nextExtended = [
      ...extendedMappings,
      {
        id: `ep-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        property_name: nextPropertyName,
        data_type: "string",
        confidence: 100,
        reason: "사용자 확장 속성 추가",
        approved: true,
      },
    ];

    void applyValidatedState(columnMappings, relationMappings, nextExtended);
  };

  const handleCreateRelationPropertyMapping = (
    sourceColumn: string,
    relType: string,
    fromSourceColumn: string,
    toSourceColumn: string,
    relationProperty: string,
  ) => {
    const endpointOptions = relationEndpointOptionsByType[relType];
    if (endpointOptions) {
      const fromAllowed = endpointOptions.fromColumns.includes(fromSourceColumn);
      const toAllowed = endpointOptions.toColumns.includes(toSourceColumn);
      if (!fromAllowed || !toAllowed) {
        toast.warning("선택한 관계 타입에 맞는 연결 기준 컬럼(할당됨)만 선택할 수 있습니다.");
        return;
      }
    }

    if (!editableConstraints) {
      toast.error("관계 속성 제약 정보를 찾을 수 없습니다.");
      return;
    }

    const relationCatalog = editableConstraints.relation_catalog || [];
    const relationDef = relationCatalog.find((item) => item.rel_type === relType);
    if (!relationDef) {
      toast.error("선택한 관계 타입의 정의를 찾을 수 없습니다.");
      return;
    }

    const mergeKeysByLabel = editableConstraints.merge_keys_by_label || {};
    const fromMergeKey = mergeKeysByLabel[relationDef.from_label]?.[0];
    const toMergeKey = mergeKeysByLabel[relationDef.to_label]?.[0];

    if (!fromMergeKey || !toMergeKey) {
      toast.error("관계 엔드포인트 머지키 정보가 없어 적용할 수 없습니다.");
      return;
    }

    const relationPropertyCatalog = editableConstraints.relation_property_catalog || [];
    const relationPropertyDef = relationPropertyCatalog.find(
      (item) => item.rel_type === relType && item.property === relationProperty,
    );
    const propertyType = relationPropertyDef?.data_type || "string";

    const fromColumns = { [fromMergeKey]: fromSourceColumn };
    const toColumns = { [toMergeKey]: toSourceColumn };

    const existingIndex = relationMappings.findIndex(
      (rm) =>
        rm.rel_type === relType &&
        rm.from_label === relationDef.from_label &&
        rm.to_label === relationDef.to_label &&
        JSON.stringify(rm.from_columns) === JSON.stringify(fromColumns) &&
        JSON.stringify(rm.to_columns) === JSON.stringify(toColumns),
    );

    const existingRelation = existingIndex >= 0 ? relationMappings[existingIndex] : null;
    if (existingRelation) {
      const sameFrom = Object.values(existingRelation.from_columns)[0] === fromSourceColumn;
      const sameTo = Object.values(existingRelation.to_columns)[0] === toSourceColumn;
      const prevProp = existingRelation.properties[sourceColumn];
      if (sameFrom && sameTo && prevProp === relationProperty) {
        toast.info("이미 동일한 관계 속성 매핑이 적용되어 있습니다.");
        return;
      }
      if (prevProp && prevProp !== relationProperty) {
        toast.warning(
          `관계 속성 매핑이 변경되었습니다: ${sourceColumn} (${prevProp} -> ${relationProperty})`,
        );
      }
    }

    const nextRelations =
      existingIndex >= 0
        ? relationMappings.map((rm, idx) =>
            idx === existingIndex
              ? {
                  ...rm,
                  dismissed: false,
                  dismissed_reason: null,
                  approved: false,
                  properties: {
                    ...rm.properties,
                    [sourceColumn]: relationProperty,
                  },
                  property_types: {
                    ...rm.property_types,
                    [relationProperty]: propertyType,
                  },
                }
              : rm,
          )
        : [
            ...relationMappings,
            {
              id: `rm-${Date.now()}`,
              from_label: relationDef.from_label,
              to_label: relationDef.to_label,
              rel_type: relType,
              from_columns: fromColumns,
              to_columns: toColumns,
              properties: {
                [sourceColumn]: relationProperty,
              },
              property_types: {
                [relationProperty]: propertyType,
              },
              approved: false,
              dismissed: false,
              dismissed_reason: null,
            },
          ];

    void applyValidatedState(columnMappings, nextRelations, extendedMappings);
  };

  const handleRemoveExtendedMapping = (id: string) => {
    const state = useMappingStore.getState();
    setMappings(
      state.columnMappings,
      state.relationMappings,
      state.extendedMappings.filter((ep) => ep.id !== id),
    );
  };

  const handleRemoveRelationMapping = (id: string) => {
    const state = useMappingStore.getState();
    setMappings(
      state.columnMappings,
      state.relationMappings.filter((rm) => rm.id !== id),
      state.extendedMappings,
    );
  };

  /**
   * 전체 승인 — 검증 API를 경유 (버그 #1 수정)
   * 기존: approveAllMappings 스토어 액션 직접 호출 → validate API 미경유
   * 수정: 전체 approved 상태를 만든 뒤 applyValidatedState로 검증
   */
  const handleApproveAll = async () => {
    const nextColumns = columnMappings.map((cm) => ({ ...cm, approved: true }));
    const nextRelations = relationMappings.map((rm) =>
      rm.dismissed ? rm : { ...rm, approved: true },
    );
    const nextExtended = extendedMappings.map((ep) => ({ ...ep, approved: true }));

    await applyValidatedState(nextColumns, nextRelations, nextExtended);
  };

  return {
    handleResetMappings,
    handleRemoveColumnMapping,
    handleCreateColumnMapping,
    handleApproveRelationMapping,
    handleCreateExtendedMapping,
    handleCreateRelationPropertyMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleApproveAll,
  };
}
