import { create } from "zustand";
import type {
  ProcessingStep,
  ProcessingStats,
  LogEntry,
} from "@/features/onboarding/types/onboarding.types";
import type { SynthesisJobResponse } from "@/api/types/onboarding";
import { mockProcessingSteps } from "@/features/onboarding/mock-data/onboarding-mock";

interface ProcessingState {
  processingSteps: ProcessingStep[];
  processingStats: ProcessingStats;
  processingProgress: number;
  processingLogs: LogEntry[];
  isProcessing: boolean;
  synthesisJobId: string | null;
  synthesisJob: SynthesisJobResponse | null;

  startProcessing: () => void;
  updateProcessingStep: (phase: string, status: ProcessingStep["status"]) => void;
  updateProcessingStats: (stats: Partial<ProcessingStats>) => void;
  setProcessingProgress: (progress: number) => void;
  addLog: (log: LogEntry) => void;
  setSynthesisJob: (job: SynthesisJobResponse) => void;
}

export const useProcessingStore = create<ProcessingState>()((set) => ({
  processingSteps: [...mockProcessingSteps],
  processingStats: { nodesCreated: 0, relationsCreated: 0, totalNodes: 0, totalRelations: 0 },
  processingProgress: 0,
  processingLogs: [],
  isProcessing: false,
  synthesisJobId: null,
  synthesisJob: null,

  startProcessing: () => set({ isProcessing: true }),

  updateProcessingStep: (phase, status) =>
    set((state) => ({
      processingSteps: state.processingSteps.map((s) =>
        s.phase === phase ? { ...s, status } : s,
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
}));
