import { create } from "zustand";
import type { ToolStep } from "../types/chat-sse";

type ChatView = "thread-list" | "chat";

interface ChatStoreState {
  // 패널 상태
  isOpen: boolean;
  view: ChatView;

  // 활성 스레드
  activeThreadId: string | null;

  // 스트리밍 상태
  isStreaming: boolean;
  streamingRunId: string | null;
  streamingText: string;
  lastEventSequence: number;

  // Tool timeline — runId 기준으로 관리
  // 현재 스트리밍 run + 과거 run 모두 저장
  toolStepsByRun: Record<string, ToolStep[]>;
}

interface ChatStoreActions {
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setView: (view: ChatView) => void;

  setActiveThread: (threadId: string | null) => void;
  openThread: (threadId: string) => void;

  startStreaming: (runId: string) => void;
  appendStreamingText: (delta: string) => void;
  setLastEventSequence: (seq: number) => void;
  stopStreaming: () => void;
  resetStreamingText: () => void;

  // Tool timeline
  addToolStep: (runId: string, step: ToolStep) => void;
  updateToolStep: (runId: string, toolCallId: string, update: Partial<ToolStep>) => void;
  setToolStepsForRun: (runId: string, steps: ToolStep[]) => void;
  clearAllToolSteps: () => void;
}

type ChatStore = ChatStoreState & ChatStoreActions;

export const useChatStore = create<ChatStore>((set) => ({
  // 초기 상태
  isOpen: false,
  view: "chat",
  activeThreadId: null,
  isStreaming: false,
  streamingRunId: null,
  streamingText: "",
  lastEventSequence: 0,
  toolStepsByRun: {},

  // 패널
  openPanel: () => set({ isOpen: true }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setView: (view) => set({ view }),

  // 스레드
  setActiveThread: (threadId) => set({ activeThreadId: threadId }),
  openThread: (threadId) =>
    set({
      activeThreadId: threadId,
      view: "chat",
      streamingText: "",
      streamingRunId: null,
      isStreaming: false,
      lastEventSequence: 0,
      toolStepsByRun: {},
    }),

  // 스트리밍
  startStreaming: (runId) =>
    set((s) => ({
      isStreaming: true,
      streamingRunId: runId,
      streamingText: "",
      lastEventSequence: 0,
      // 이전 run의 steps는 유지하고, 새 run만 빈 배열로 시작
      toolStepsByRun: { ...s.toolStepsByRun, [runId]: [] },
    })),
  appendStreamingText: (delta) =>
    set((s) => ({ streamingText: s.streamingText + delta })),
  setLastEventSequence: (seq) => set({ lastEventSequence: seq }),
  stopStreaming: () =>
    set({
      isStreaming: false,
      streamingRunId: null,
    }),
  resetStreamingText: () => set({ streamingText: "" }),

  // Tool timeline
  addToolStep: (runId, step) =>
    set((s) => ({
      toolStepsByRun: {
        ...s.toolStepsByRun,
        [runId]: [...(s.toolStepsByRun[runId] ?? []), step],
      },
    })),

  updateToolStep: (runId, toolCallId, update) =>
    set((s) => {
      const steps = s.toolStepsByRun[runId] ?? [];
      const exists = steps.some((step) => step.toolCallId === toolCallId);

      if (exists) {
        return {
          toolStepsByRun: {
            ...s.toolStepsByRun,
            [runId]: steps.map((step) =>
              step.toolCallId === toolCallId ? { ...step, ...update } : step,
            ),
          },
        };
      }

      // started 없이 completed만 온 경우 새 step으로 추가
      return {
        toolStepsByRun: {
          ...s.toolStepsByRun,
          [runId]: [
            ...steps,
            {
              toolCallId,
              toolName: "",
              displayName: update.summary ?? update.message ?? "",
              status: update.status ?? "completed",
              message: update.message ?? "",
              ...update,
            } as ToolStep,
          ],
        },
      };
    }),

  setToolStepsForRun: (runId, steps) =>
    set((s) => ({
      toolStepsByRun: { ...s.toolStepsByRun, [runId]: steps },
    })),

  clearAllToolSteps: () => set({ toolStepsByRun: {} }),
}));
