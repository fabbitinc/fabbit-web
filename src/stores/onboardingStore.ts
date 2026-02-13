import { create } from "zustand";
import type {
  OnboardingStep,
  UploadedFile,
  ColumnMappingEntry,
  RelationMappingEntry,
  ExtendedPropertyEntry,
  ProcessingStep,
  ProcessingStats,
  LogEntry,
  ChatMessage,
  TargetPropertyOption,
} from "@/features/onboarding/types/onboarding.types";
import type {
  EditableConstraintsDTO,
  MappingResultDTO,
  SynthesisJobResponse,
} from "@/api/types/onboarding";
import {
  mockProcessingSteps,
} from "@/features/onboarding/mock-data/onboarding-mock";

function cloneRelationMapping(rm: RelationMappingEntry): RelationMappingEntry {
  return {
    ...rm,
    from_columns: { ...rm.from_columns },
    to_columns: { ...rm.to_columns },
    properties: { ...rm.properties },
    property_types: { ...rm.property_types },
  };
}

function isRelationValid(
  relation: RelationMappingEntry,
  columnMappings: ColumnMappingEntry[],
  mappingHeaders: string[],
): boolean {
  const isFromValid = Object.entries(relation.from_columns).every(([prop, sourceColumn]) =>
    columnMappings.some(
      (cm) =>
        cm.source_column === sourceColumn &&
        cm.target_label === relation.from_label &&
        cm.target_property === prop,
    ),
  );

  const isToValid = Object.entries(relation.to_columns).every(([prop, sourceColumn]) =>
    columnMappings.some(
      (cm) =>
        cm.source_column === sourceColumn &&
        cm.target_label === relation.to_label &&
        cm.target_property === prop,
    ),
  );

  const isPropertiesValid = Object.keys(relation.properties).every((sourceColumn) =>
    mappingHeaders.includes(sourceColumn),
  );

  return isFromValid && isToValid && isPropertiesValid;
}

interface OnboardingState {
  // 현재 스텝
  currentStep: OnboardingStep;

  // Step 1: 업로드
  uploadedFiles: UploadedFile[];

  // API에서 받은 업로드 ID들 (presigned URL 업로드 후)
  uploadIds: string[];
  // 첫 번째 BOM 파일의 upload_id (매핑에 사용)
  primaryUploadId: string | null;

  // Step 2: 매핑
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

  // Step 3: 처리
  processingSteps: ProcessingStep[];
  processingStats: ProcessingStats;
  processingProgress: number;
  processingLogs: LogEntry[];
  isProcessing: boolean;
  // 합성 작업
  synthesisJobId: string | null;
  synthesisJob: SynthesisJobResponse | null;

  // Step 4: 탐색
  chatMessages: ChatMessage[];

  // Actions
  setStep: (step: OnboardingStep) => void;

  // 파일 업로드
  addFiles: (files: UploadedFile[]) => void;
  updateFileProgress: (id: string, progress: number, status?: UploadedFile["status"]) => void;
  removeFile: (id: string) => void;

  // 업로드 ID 관리
  addUploadId: (fileId: string, uploadId: string) => void;
  setPrimaryUploadId: (uploadId: string) => void;

  // 매핑 데이터 설정 (API 응답)
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
  dismissRelationMapping: (id: string) => void;
  restoreRelationMapping: (id: string) => boolean;
  changeColumnMappingTarget: (id: string, targetLabel: string, targetProperty: string) => number;
  createColumnMapping: (sourceColumn: string, targetLabel: string, targetProperty: string) => number;
  resetMappings: () => void;

  // 매핑 결과를 API 형식으로 반환
  getMappingResult: () => MappingResultDTO;

  // 처리
  startProcessing: () => void;
  updateProcessingStep: (phase: string, status: ProcessingStep["status"]) => void;
  updateProcessingStats: (stats: Partial<ProcessingStats>) => void;
  setProcessingProgress: (progress: number) => void;
  addLog: (log: LogEntry) => void;

  // 합성
  setSynthesisJob: (job: SynthesisJobResponse) => void;

  // 채팅
  addChatMessage: (message: ChatMessage) => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  
  currentStep: 1,

  uploadedFiles: [],
  uploadIds: [],
  primaryUploadId: null,

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

  processingSteps: [...mockProcessingSteps],
  processingStats: { nodesCreated: 0, relationsCreated: 0, totalNodes: 0, totalRelations: 0 },
  processingProgress: 0,
  processingLogs: [],
  isProcessing: false,
  synthesisJobId: null,
  synthesisJob: null,

  chatMessages: [],

  setStep: (step) => set({ currentStep: step }),

  addFiles: (files) =>
    set((state) => ({
      uploadedFiles: [...state.uploadedFiles, ...files],
    })),

  updateFileProgress: (id, progress, status) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((f) =>
        f.id === id ? { ...f, progress, ...(status ? { status } : {}) } : f
      ),
    })),

  removeFile: (id) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
    })),

  addUploadId: (fileId, uploadId) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((f) =>
        f.id === fileId ? { ...f, uploadId } : f
      ),
      uploadIds: [...state.uploadIds, uploadId],
    })),

  setPrimaryUploadId: (uploadId) => set({ primaryUploadId: uploadId }),

  setMappingPreviewData: (headers, sampleRows, mapping, editableConstraints) => {
    // API의 column_mappings를 프론트의 ColumnMappingEntry로 변환
    const columnMappings: ColumnMappingEntry[] = mapping.column_mappings.map((cm, idx) => ({
      id: `cm-${idx + 1}`,
      source_column: cm.source_column,
      target_label: cm.target_label,
      target_property: cm.target_property,
      data_type: cm.data_type || "string",
      confidence: cm.confidence || 0,
      reason: cm.reason || "",
      approved: (cm.confidence || 0) >= 90,
    }));

    // API의 relation_mappings를 프론트의 RelationMappingEntry로 변환
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
        cm.id === id ? { ...cm, approved: true } : cm
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
    const hash = Array.from(sourceColumn).reduce(
      (acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0),
      7,
    );
    const normalizeName = sourceColumn
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    set((state) => ({
      extendedMappings: [
        ...state.extendedMappings,
        {
          id: `ep-${Date.now()}`,
          source_column: sourceColumn,
          target_label: targetLabel,
          property_name: `_ext_${normalizeName || `col_${hash.toString(36)}`}`,
          data_type: "string",
          confidence: 100,
          reason: "사용자 확장 속성 추가",
          approved: false,
        },
      ],
    }));
  },

  dismissRelationMapping: (id) =>
    set((state) => ({
      relationMappings: state.relationMappings.map((rm) =>
        rm.id === id ? { ...rm, dismissed: true, approved: false } : rm
      ),
    })),

  restoreRelationMapping: (id) => {
    const state = get();
    const target = state.relationMappings.find((rm) => rm.id === id);
    if (!target) return false;

    if (!isRelationValid(target, state.columnMappings, state.mappingHeaders)) {
      return false;
    }

    set((current) => ({
      relationMappings: current.relationMappings.map((rm) =>
        rm.id === id ? { ...rm, dismissed: false, approved: false } : rm
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
        : cm
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

  startProcessing: () => set({ isProcessing: true }),

  updateProcessingStep: (phase, status) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((s) =>
        s.phase === phase ? { ...s, status } : s
      ),
    })),

  updateProcessingStats: (stats) =>
    set((state) => ({
      processingStats: { ...state.processingStats, ...stats },
    })),

  setProcessingProgress: (progress) => set({ processingProgress: progress }),

  addLog: (log) =>
    set((state) => ({
      processingLogs: [...state.processingLogs, log],
    })),

  setSynthesisJob: (job) =>
    set({
      synthesisJobId: job.id,
      synthesisJob: job,
    }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
}));
