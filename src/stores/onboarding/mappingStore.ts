import { create } from "zustand";
import type {
  OnboardingStep,
  ColumnMappingEntry,
  RelationMappingEntry,
  ExtendedPropertyEntry,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import type {
  EditableConstraintsDTO,
  MappingResultDTO,
} from "@/api/types/onboarding";
import { cloneRelationMapping, isRelationValid } from "./helpers";
import { toExtendedPropertyName } from "@/features/onboarding/utils/mappingUtils";
import { AUTO_APPROVE_CONFIDENCE_THRESHOLD } from "@/features/onboarding/constants/mappingConfig";

interface MappingState {
  // 현재 스텝 (4개 페이지 모두 setStep 호출)
  currentStep: OnboardingStep;

  // 매핑 데이터
  columnMappings: ColumnMappingEntry[];
  relationMappings: RelationMappingEntry[];
  extendedMappings: ExtendedPropertyEntry[];
  // preview API 기준 원본 스냅샷 (리셋용)
  initialColumnMappings: ColumnMappingEntry[];
  initialRelationMappings: RelationMappingEntry[];
  initialExtendedMappings: ExtendedPropertyEntry[];
  mappingHeaders: string[];
  mappingSampleRows: Record<string, string>[];
  editableConstraints: EditableConstraintsDTO | null;
  // 온톨로지 스키마에서 로드된 타겟 옵션
  targetPropertyOptions: TargetPropertyOption[];

  // API에서 받은 매핑 ID (confirm 후)
  mappingId: string | null;

  // Actions
  setStep: (step: OnboardingStep) => void;

  setMappingPreviewData: (
    headers: string[],
    sampleRows: Record<string, string>[],
    mapping: MappingResultDTO,
    editableConstraints?: EditableConstraintsDTO,
  ) => void;
  setTargetPropertyOptions: (options: TargetPropertyOption[]) => void;
  setMappingId: (id: string) => void;
  setMappings: (
    columnMappings: ColumnMappingEntry[],
    relationMappings: RelationMappingEntry[],
    extendedMappings: ExtendedPropertyEntry[],
  ) => void;

  // 매핑 조작
  approveColumnMapping: (id: string) => void;
  approveRelationMapping: (id: string) => void;
  approveAllMappings: () => void;
  removeColumnMapping: (id: string) => number;
  approveExtendedMapping: (id: string) => void;
  removeExtendedMapping: (id: string) => void;
  createExtendedMapping: (sourceColumn: string, targetLabel: string) => void;
  restoreRelationMapping: (id: string) => boolean;
  changeColumnMappingTarget: (id: string, targetLabel: string, targetProperty: string) => number;
  createColumnMapping: (sourceColumn: string, targetLabel: string, targetProperty: string) => number;
  resetMappings: () => void;
  reset: () => void;

  // 매핑 결과를 API 형식으로 반환
  getMappingResult: () => MappingResultDTO;
}

export const useMappingStore = create<MappingState>()((set, get) => ({
  currentStep: 1,

  columnMappings: [],
  relationMappings: [],
  extendedMappings: [],
  initialColumnMappings: [],
  initialRelationMappings: [],
  initialExtendedMappings: [],
  mappingHeaders: [],
  mappingSampleRows: [],
  editableConstraints: null,
  targetPropertyOptions: [],
  mappingId: null,

  setStep: (step) => set({ currentStep: step }),

  setMappingPreviewData: (headers, sampleRows, mapping, editableConstraints) => {
    const columnMappings: ColumnMappingEntry[] = mapping.column_mappings.map((cm, idx) => ({
      id: `cm-${idx + 1}`,
      source_column: cm.source_column,
      target_label: cm.target_label,
      target_property: cm.target_property,
      data_type: cm.data_type || "string",
      confidence: cm.confidence || 0,
      reason: cm.reason || "",
      approved: (cm.confidence || 0) >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
    }));

    const relationMappings: RelationMappingEntry[] = mapping.relation_mappings.map((rm, idx) => ({
      id: `rm-${idx + 1}`,
      from_label: rm.from_label,
      to_label: rm.to_label,
      rel_type: rm.rel_type,
      from_columns: rm.from_columns || {},
      to_columns: rm.to_columns || {},
      properties: rm.properties || {},
      property_types: rm.property_types || {},
      approved: false,
      dismissed: false,
    }));

    const initialColumnMappings = columnMappings.map((cm) => ({ ...cm }));
    const initialRelationMappings = relationMappings.map(cloneRelationMapping);
    const extendedMappings: ExtendedPropertyEntry[] = mapping.extended_properties.map((ep, idx) => ({
      id: `ep-${idx + 1}`,
      source_column: ep.source_column,
      target_label: ep.target_label,
      property_name: ep.property_name,
      data_type: ep.data_type || "string",
      confidence: ep.confidence || 0,
      reason: ep.reason || "",
      approved: true,
    }));
    const initialExtendedMappings = extendedMappings.map((ep) => ({ ...ep }));

    set({
      mappingHeaders: headers,
      mappingSampleRows: sampleRows,
      editableConstraints: editableConstraints || null,
      columnMappings: initialColumnMappings.map((cm) => ({ ...cm })),
      relationMappings: initialRelationMappings.map(cloneRelationMapping),
      extendedMappings: initialExtendedMappings.map((ep) => ({ ...ep })),
      initialColumnMappings,
      initialRelationMappings,
      initialExtendedMappings,
    });
  },

  setTargetPropertyOptions: (options) => set({ targetPropertyOptions: options }),

  setMappingId: (id) => set({ mappingId: id }),

  setMappings: (columnMappings, relationMappings, extendedMappings) =>
    set({
      columnMappings: columnMappings.map((cm) => ({ ...cm })),
      relationMappings: relationMappings.map(cloneRelationMapping),
      extendedMappings: extendedMappings.map((ep) => ({ ...ep })),
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
      extendedMappings: state.extendedMappings.map((ep) => ({ ...ep, approved: true })),
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
      const usedInFrom = Object.values(rm.from_columns).includes(removedSourceColumn);
      const usedInTo = Object.values(rm.to_columns).includes(removedSourceColumn);
      const usedInProperties = Object.keys(rm.properties).includes(removedSourceColumn);
      const shouldDismiss = usedInFrom || usedInTo || usedInProperties;

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

  approveExtendedMapping: (id) =>
    set((state) => ({
      extendedMappings: state.extendedMappings.map((ep) =>
        ep.id === id ? { ...ep, approved: true } : ep,
      ),
    })),

  removeExtendedMapping: (id) =>
    set((state) => ({
      extendedMappings: state.extendedMappings.filter((ep) => ep.id !== id),
    })),

  createExtendedMapping: (sourceColumn, targetLabel) => {
    set((state) => ({
      extendedMappings: [
        ...state.extendedMappings,
        {
          id: `ep-${Date.now()}`,
          source_column: sourceColumn,
          target_label: targetLabel,
          property_name: toExtendedPropertyName(sourceColumn),
          data_type: "string",
          confidence: 100,
          reason: "사용자 확장 속성 추가",
          approved: false,
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

  changeColumnMappingTarget: (id, targetLabel, targetProperty) => {
    const state = get();
    const changed = state.columnMappings.find((cm) => cm.id === id);
    if (!changed) return 0;

    const updatedColumnMappings = state.columnMappings.map((cm) =>
      cm.id === id
        ? {
            ...cm,
            target_label: targetLabel,
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

  createColumnMapping: (sourceColumn, targetLabel, targetProperty) => {
    const state = get();
    const updatedColumnMappings = [
      ...state.columnMappings,
      {
        id: `cm-${Date.now()}`,
        source_column: sourceColumn,
        target_label: targetLabel,
        target_property: targetProperty,
        data_type: "string",
        confidence: 100,
        reason: "사용자 수동 매핑",
        approved: false,
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
      extendedMappings: state.initialExtendedMappings.map((ep) => ({ ...ep })),
    }));
  },

  reset: () => set({
    currentStep: 1,
    columnMappings: [],
    relationMappings: [],
    extendedMappings: [],
    initialColumnMappings: [],
    initialRelationMappings: [],
    initialExtendedMappings: [],
    mappingHeaders: [],
    mappingSampleRows: [],
    editableConstraints: null,
    targetPropertyOptions: [],
    mappingId: null,
  }),

  getMappingResult: () => {
    const state = get();
    return {
      column_mappings: state.columnMappings.map((cm) => ({
        source_column: cm.source_column,
        target_label: cm.target_label,
        target_property: cm.target_property,
        data_type: cm.data_type,
        confidence: cm.confidence,
        reason: cm.reason,
      })),
      relation_mappings: state.relationMappings
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
      extended_properties: state.extendedMappings.map((ep) => ({
        source_column: ep.source_column,
        target_label: ep.target_label,
        property_name: ep.property_name,
        data_type: ep.data_type,
        confidence: ep.confidence,
        reason: ep.reason,
      })),
    };
  },
}));
