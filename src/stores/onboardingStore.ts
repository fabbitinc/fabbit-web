import { create } from "zustand";
import type {
  OnboardingStep,
  PlanTier,
  WorkspaceFormData,
  UploadedFile,
  MappingConnection,
  ProcessingStep,
  ProcessingStats,
  LogEntry,
  ChatMessage,
} from "@/features/onboarding/types/onboarding.types";
import {
  mockMappingConnections,
  mockProcessingSteps,
} from "@/features/onboarding/mock-data/onboarding-mock";

interface OnboardingState {
  // 현재 스텝
  currentStep: OnboardingStep;

  // Step 2: 워크스페이스
  workspaceData: WorkspaceFormData;

  // Step 3: 플랜
  selectedPlan: PlanTier;

  // Step 4: 업로드
  uploadedFiles: UploadedFile[];

  // Step 5: 매핑
  connections: MappingConnection[];
  selectedSourceId: string | null;
  selectedTargetId: string | null;

  // Step 6: 처리
  processingSteps: ProcessingStep[];
  processingStats: ProcessingStats;
  processingProgress: number;
  processingLogs: LogEntry[];
  isProcessing: boolean;

  // Step 7: 탐색
  chatMessages: ChatMessage[];

  // Actions
  setStep: (step: OnboardingStep) => void;
  setWorkspaceData: (data: Partial<WorkspaceFormData>) => void;
  setSelectedPlan: (plan: PlanTier) => void;

  // 파일 업로드
  addFiles: (files: UploadedFile[]) => void;
  updateFileProgress: (id: string, progress: number, status?: UploadedFile["status"]) => void;
  removeFile: (id: string) => void;

  // 매핑
  setSelectedSource: (id: string | null) => void;
  setSelectedTarget: (id: string | null) => void;
  toggleConnection: (sourceId: string, targetId: string) => void;
  approveConnection: (connectionId: string) => void;
  approveAllConnections: () => void;
  removeConnection: (connectionId: string) => void;
  resetConnections: () => void;

  // 처리
  startProcessing: () => void;
  updateProcessingStep: (phase: string, status: ProcessingStep["status"]) => void;
  updateProcessingStats: (stats: Partial<ProcessingStats>) => void;
  setProcessingProgress: (progress: number) => void;
  addLog: (log: LogEntry) => void;

  // 채팅
  addChatMessage: (message: ChatMessage) => void;
}

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  currentStep: 1,

  workspaceData: {
    organizationName: "",
    slug: "",
    industry: "",
    teamSize: "",
    role: "",
  },

  selectedPlan: "free",

  uploadedFiles: [],

  connections: [...mockMappingConnections],
  selectedSourceId: null,
  selectedTargetId: null,

  processingSteps: [...mockProcessingSteps],
  processingStats: { nodesCreated: 0, relationsCreated: 0, totalNodes: 3450, totalRelations: 8920 },
  processingProgress: 0,
  processingLogs: [],
  isProcessing: false,

  chatMessages: [],

  setStep: (step) => set({ currentStep: step }),

  setWorkspaceData: (data) =>
    set((state) => ({
      workspaceData: { ...state.workspaceData, ...data },
    })),

  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

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

  setSelectedSource: (id) => {
    const { selectedTargetId, connections } = get();
    set({ selectedSourceId: id });

    // 소스와 타겟이 모두 선택된 경우 연결/해제
    if (id && selectedTargetId) {
      const existing = connections.find(
        (c) => c.sourceId === id && c.targetId === selectedTargetId
      );
      if (existing) {
        // 이미 연결되어 있으면 해제
        set({
          connections: connections.filter((c) => c.id !== existing.id),
          selectedSourceId: null,
          selectedTargetId: null,
        });
      } else {
        // 새로운 연결 생성
        const newConnection: MappingConnection = {
          id: `conn-${Date.now()}`,
          sourceId: id,
          targetId: selectedTargetId,
          confidence: 100,
          confidenceLevel: "high",
          approved: true,
        };
        set({
          connections: [...connections, newConnection],
          selectedSourceId: null,
          selectedTargetId: null,
        });
      }
    }
  },

  setSelectedTarget: (id) => {
    const { selectedSourceId, connections } = get();
    set({ selectedTargetId: id });

    if (selectedSourceId && id) {
      const existing = connections.find(
        (c) => c.sourceId === selectedSourceId && c.targetId === id
      );
      if (existing) {
        set({
          connections: connections.filter((c) => c.id !== existing.id),
          selectedSourceId: null,
          selectedTargetId: null,
        });
      } else {
        const newConnection: MappingConnection = {
          id: `conn-${Date.now()}`,
          sourceId: selectedSourceId,
          targetId: id,
          confidence: 100,
          confidenceLevel: "high",
          approved: true,
        };
        set({
          connections: [...connections, newConnection],
          selectedSourceId: null,
          selectedTargetId: null,
        });
      }
    }
  },

  toggleConnection: (sourceId, targetId) => {
    const { connections } = get();
    const existing = connections.find(
      (c) => c.sourceId === sourceId && c.targetId === targetId
    );
    if (existing) {
      set({ connections: connections.filter((c) => c.id !== existing.id) });
    } else {
      const newConnection: MappingConnection = {
        id: `conn-${Date.now()}`,
        sourceId,
        targetId,
        confidence: 100,
        confidenceLevel: "high",
        approved: true,
      };
      set({ connections: [...connections, newConnection] });
    }
  },

  approveConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId ? { ...c, approved: true } : c
      ),
    })),

  approveAllConnections: () =>
    set((state) => ({
      connections: state.connections.map((c) => ({ ...c, approved: true })),
    })),

  removeConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
    })),

  resetConnections: () => set({ connections: [...mockMappingConnections] }),

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

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
}));
