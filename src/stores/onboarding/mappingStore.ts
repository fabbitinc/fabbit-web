import { create } from "zustand";
import type {
  OnboardingStep,
  ColumnMappingEntry,
  RelationMappingEntry,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import type {
  EditableConstraintsDTO,
  MappingResultDTO,
  OntologySchemaResponse,
} from "@/api/types/onboarding";
import { cloneRelationMapping, isRelationValid } from "./helpers";
import {
  normalizeRelationColumns,
  toExtendedPropertyName,
} from "@/features/onboarding/utils/mappingUtils";
import { AUTO_APPROVE_CONFIDENCE_THRESHOLD } from "@/features/onboarding/constants/mappingConfig";

interface MappingState {
  // 현재 스텝 (4개 페이지 모두 setStep 호출)
  currentStep: OnboardingStep;

  // 매핑 데이터 (is_extended 플래그로 기본/확장 구분)
  columnMappings: ColumnMappingEntry[];
  relationMappings: RelationMappingEntry[];
  // preview API 기준 원본 스냅샷 (리셋용)
  initialColumnMappings: ColumnMappingEntry[];
  initialRelationMappings: RelationMappingEntry[];
  mappingHeaders: string[];
  mappingSampleRows: Record<string, string>[];
  editableConstraints: EditableConstraintsDTO | null;
  // 온톨로지 스키마에서 로드된 타겟 옵션
  targetPropertyOptions: TargetPropertyOption[];
  ontologySchema: OntologySchemaResponse | null;

  // API에서 받은 매핑 ID (confirm 후)
  mappingId: string | null;

  // Actions
  setStep: (step: OnboardingStep) => void;

  setMappingPreviewData: (
    headers: string[],
    sampleRows: Record<string, string>[],
    mapping: MappingResultDTO,
  ) => void;
  setTargetPropertyOptions: (options: TargetPropertyOption[]) => void;
  setOntologySchema: (schema: OntologySchemaResponse | null) => void;
  setMappingId: (id: string) => void;
  setMappings: (
    columnMappings: ColumnMappingEntry[],
    relationMappings: RelationMappingEntry[],
  ) => void;

  // 매핑 조작
  approveColumnMapping: (id: string) => void;
  approveRelationMapping: (id: string) => void;
  approveAllMappings: () => void;
  removeColumnMapping: (id: string) => number;
  restoreRelationMapping: (id: string) => boolean;
  changeColumnMappingTarget: (id: string, targetProperty: string) => number;
  createColumnMapping: (sourceColumn: string, targetProperty: string, isExtended?: boolean) => number;
  createExtendedMapping: (sourceColumn: string) => void;
  resetMappings: () => void;
  reset: () => void;

  // 매핑 결과를 API 형식으로 반환
  getMappingResult: () => MappingResultDTO;
}

export const useMappingStore = create<MappingState>()((set, get) => ({
  currentStep: 1,

  columnMappings: [],
  relationMappings: [],
  initialColumnMappings: [],
  initialRelationMappings: [],
  mappingHeaders: [],
  mappingSampleRows: [],
  editableConstraints: null,
  targetPropertyOptions: [],
  ontologySchema: null,
  mappingId: null,

  setStep: (step) => set({ currentStep: step }),

  setMappingPreviewData: (headers, sampleRows, mapping) => {
    // property_mappings → columnMappings (is_extended 플래그 유지)
    const columnMappings: ColumnMappingEntry[] = mapping.property_mappings.map((pm, idx) => ({
      id: `cm-${idx + 1}`,
      source_column: pm.source_column,
      target_property: pm.target_property,
      data_type: pm.data_type || "string",
      confidence: pm.confidence || 0,
      reason: pm.reason || "",
      approved: pm.is_extended
        ? true
        : (pm.confidence || 0) >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
      is_extended: pm.is_extended || false,
    }));

    // relation_mappings → relationMappings
    const relationMappings: RelationMappingEntry[] = mapping.relation_mappings.map((rm, idx) => ({
      id: `rm-${idx + 1}`,
      rel_type: rm.rel_type,
      target_label: rm.target_label,
      node_columns: rm.node_columns || {},
      rel_columns: normalizeRelationColumns(rm.rel_columns, headers),
      rel_column_types: rm.rel_column_types || {},
      confidence: rm.confidence || 0,
      reason: rm.reason || "",
      approved: false,
      dismissed: false,
    }));

    const initialColumnMappings = columnMappings.map((cm) => ({ ...cm }));
    const initialRelationMappings = relationMappings.map(cloneRelationMapping);

    set({
      mappingHeaders: headers,
      mappingSampleRows: sampleRows,
      columnMappings: initialColumnMappings.map((cm) => ({ ...cm })),
      relationMappings: initialRelationMappings.map(cloneRelationMapping),
      initialColumnMappings,
      initialRelationMappings,
    });
  },

  setTargetPropertyOptions: (options) => set({ targetPropertyOptions: options }),

  setOntologySchema: (schema) => set({ ontologySchema: schema }),

  setMappingId: (id) => set({ mappingId: id }),

  setMappings: (columnMappings, relationMappings) =>
    set({
      columnMappings: columnMappings.map((cm) => ({ ...cm })),
      relationMappings: relationMappings.map(cloneRelationMapping),
    }),

  approveColumnMapping: (id) =>
    set((state) => ({
      columnMappings: state.columnMappings.map((cm) =>
        cm.id === id ? { ...cm, approved: true } : cm,
      ),
    })),

  approveRelationMapping: (id) =>
    set((state) => ({
      relationMappings: state.relationMappings.map((rm) => {
        if (rm.id !== id || rm.dismissed) return rm;

        if (!isRelationValid(rm, state.columnMappings, state.mappingHeaders)) {
          return { ...rm, dismissed: true, approved: false };
        }

        return { ...rm, approved: true };
      }),
    })),

  approveAllMappings: () =>
    set((state) => ({
      columnMappings: state.columnMappings.map((cm) => ({ ...cm, approved: true })),
      relationMappings: state.relationMappings.map((rm) => {
        if (rm.dismissed) return rm;

        if (!isRelationValid(rm, state.columnMappings, state.mappingHeaders)) {
          return { ...rm, dismissed: true, approved: false };
        }

        return { ...rm, approved: true };
      }),
    })),

  removeColumnMapping: (id) => {
    const state = get();
    const removed = state.columnMappings.find((cm) => cm.id === id);
    if (!removed) return 0;

    const removedSourceColumn = removed.source_column;
    let affectedRelationCount = 0;

    const relationMappings = state.relationMappings.map((rm) => {
      const usedInNodeColumns = Object.values(rm.node_columns).includes(removedSourceColumn);
      const usedInRelColumns = Object.keys(rm.rel_columns).includes(removedSourceColumn);
      const shouldDismiss = usedInNodeColumns || usedInRelColumns;

      if (!shouldDismiss) return rm;

      if (!rm.dismissed) {
        affectedRelationCount += 1;
      }

      return { ...rm, dismissed: true, approved: false };
    });

    set({
      columnMappings: state.columnMappings.filter((cm) => cm.id !== id),
      relationMappings,
    });

    return affectedRelationCount;
  },

  createExtendedMapping: (sourceColumn) => {
    set((state) => ({
      columnMappings: [
        ...state.columnMappings,
        {
          id: `cm-${Date.now()}`,
          source_column: sourceColumn,
          target_property: toExtendedPropertyName(sourceColumn),
          data_type: "string",
          confidence: 100,
          reason: "사용자 확장 속성 추가",
          approved: false,
          is_extended: true,
        },
      ],
    }));
  },

  restoreRelationMapping: (id) => {
    const state = get();
    const target = state.relationMappings.find((rm) => rm.id === id);
    if (!target) return false;

    if (!isRelationValid(target, state.columnMappings, state.mappingHeaders)) {
      return false;
    }

    set((current) => ({
      relationMappings: current.relationMappings.map((rm) =>
        rm.id === id ? { ...rm, dismissed: false, approved: false } : rm,
      ),
    }));
    return true;
  },

  changeColumnMappingTarget: (id, targetProperty) => {
    const state = get();
    const changed = state.columnMappings.find((cm) => cm.id === id);
    if (!changed) return 0;

    const updatedColumnMappings = state.columnMappings.map((cm) =>
      cm.id === id
        ? {
            ...cm,
            target_property: targetProperty,
            approved: false,
            confidence: 100,
            reason: "사용자 수동 변경",
          }
        : cm,
    );

    let affectedRelationCount = 0;
    const relationMappings = state.relationMappings.map((rm) => {
      const shouldDismiss = !isRelationValid(rm, updatedColumnMappings, state.mappingHeaders);

      if (!shouldDismiss) return rm;
      if (!rm.dismissed) affectedRelationCount += 1;
      return { ...rm, dismissed: true, approved: false };
    });

    set({
      columnMappings: updatedColumnMappings,
      relationMappings,
    });

    return affectedRelationCount;
  },

  createColumnMapping: (sourceColumn, targetProperty, isExtended) => {
    const state = get();
    const updatedColumnMappings = [
      ...state.columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_property: targetProperty,
        data_type: "string",
        confidence: 100,
        reason: "사용자 수동 매핑",
        approved: false,
        is_extended: isExtended || false,
      },
    ];

    let affectedRelationCount = 0;
    const relationMappings = state.relationMappings.map((rm) => {
      const shouldDismiss = !isRelationValid(rm, updatedColumnMappings, state.mappingHeaders);

      if (!shouldDismiss) return rm;
      if (!rm.dismissed) affectedRelationCount += 1;
      return { ...rm, dismissed: true, approved: false };
    });

    set({
      columnMappings: updatedColumnMappings,
      relationMappings,
    });

    return affectedRelationCount;
  },

  resetMappings: () => {
    set((state) => ({
      columnMappings: state.initialColumnMappings.map((cm) => ({ ...cm })),
      relationMappings: state.initialRelationMappings.map(cloneRelationMapping),
    }));
  },

  reset: () => set({
    currentStep: 1,
    columnMappings: [],
    relationMappings: [],
    initialColumnMappings: [],
    initialRelationMappings: [],
    mappingHeaders: [],
    mappingSampleRows: [],
    editableConstraints: null,
    targetPropertyOptions: [],
    ontologySchema: null,
    mappingId: null,
  }),

  getMappingResult: () => {
    const state = get();
    return {
      property_mappings: state.columnMappings.map((cm) => ({
        source_column: cm.source_column,
        target_property: cm.target_property,
        data_type: cm.data_type,
        confidence: cm.confidence,
        reason: cm.reason,
        is_extended: cm.is_extended || false,
      })),
      relation_mappings: state.relationMappings
        .filter((rm) => !rm.dismissed)
        .map((rm) => ({
          rel_type: rm.rel_type,
          target_label: rm.target_label,
          node_columns: rm.node_columns,
          // API 스키마 기준: { property_name: source_column }
          rel_columns: Object.fromEntries(
            Object.entries(rm.rel_columns).map(([sourceColumn, property]) => [
              property,
              sourceColumn,
            ]),
          ),
          rel_column_types: rm.rel_column_types,
          confidence: rm.confidence,
          reason: rm.reason,
        })),
    };
  },
}));
