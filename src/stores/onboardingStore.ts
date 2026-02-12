import { create } from "zustand";
import type {
  OnboardingStep,
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

  // Step 1: 업로드
  uploadedFiles: UploadedFile[];

  // Step 2: 매핑
  connections: MappingConnection[];

  // Step 3: 처리
  processingSteps: ProcessingStep[];
  processingStats: ProcessingStats;
  processingProgress: number;
  processingLogs: LogEntry[];
  isProcessing: boolean;

  // Step 4: 탐색
  chatMessages: ChatMessage[];

  // Actions
  setStep: (step: OnboardingStep) => void;

  // 파일 업로드
  addFiles: (files: UploadedFile[]) => void;
  updateFileProgress: (id: string, progress: number, status?: UploadedFile["status"]) => void;
  removeFile: (id: string) => void;

  // 매핑
  approveConnection: (connectionId: string) => void;
  approveAllConnections: () => void;
  removeConnection: (connectionId: string) => void;
  resetConnections: () => void;
  changeConnectionTarget: (connectionId: string, newTargetId: string) => void;
  createConnection: (sourceId: string, targetId: string) => void;

  // 처리
  startProcessing: () => void;
  updateProcessingStep: (phase: string, status: ProcessingStep["status"]) => void;
  updateProcessingStats: (stats: Partial<ProcessingStats>) => void;
  setProcessingProgress: (progress: number) => void;
  addLog: (log: LogEntry) => void;

  // 채팅
  addChatMessage: (message: ChatMessage) => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  currentStep: 1,

  uploadedFiles: [],

  connections: [...mockMappingConnections],

  processingSteps: [...mockProcessingSteps],
  processingStats: { nodesCreated: 0, relationsCreated: 0, totalNodes: 3450, totalRelations: 8920 },
  processingProgress: 0,
  processingLogs: [],
  isProcessing: false,

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

  changeConnectionTarget: (connectionId, newTargetId) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? { ...c, targetId: newTargetId, approved: false, confidence: 100, confidenceLevel: "high" as const }
          : c
      ),
    })),

  createConnection: (sourceId, targetId) =>
    set((state) => ({
      connections: [
        ...state.connections,
        {
          id: `conn-${Date.now()}`,
          sourceId,
          targetId,
          confidence: 100,
          confidenceLevel: "high" as const,
          approved: false,
        },
      ],
    })),

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
