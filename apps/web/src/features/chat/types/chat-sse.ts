// 백엔드 SSE 이벤트 타입 정의

export interface SseRawEvent {
  id?: string;
  event: string;
  data: string;
}

// ── 파싱된 이벤트 유니온 ──

export type ChatSseEvent =
  | ConnectedEvent
  | RunStartedEvent
  | TraceUpdatedEvent
  | ToolStartedEvent
  | ToolCompletedEvent
  | ToolFailedEvent
  | MessageDeltaEvent
  | MessageCompletedEvent
  | ActionRequiredEvent
  | RunCompletedEvent
  | RunFailedEvent;

export interface ConnectedEvent {
  type: "connected";
  sequence: number;
}

export interface RunStartedEvent {
  type: "run.started";
  runId: string;
  sequence: number;
}

export interface TraceUpdatedEvent {
  type: "trace.updated";
  trace: string;
  sequence: number;
}

export interface ToolStartedEvent {
  type: "tool.started";
  toolName: string;
  toolCallId: string;
  displayName?: string;
  message?: string;
  sequence: number;
}

export interface ToolCompletedEvent {
  type: "tool.completed";
  toolCallId: string;
  toolName?: string;
  displayName?: string;
  summary?: string;
  message?: string;
  blocks?: unknown[];
  result: unknown;
  sequence: number;
}

export interface ToolFailedEvent {
  type: "tool.failed";
  toolCallId: string;
  error: string;
  sequence: number;
}

export interface MessageDeltaEvent {
  type: "message.delta";
  messageId: string;
  delta: string;
  sequence: number;
}

export interface MessageCompletedEvent {
  type: "message.completed";
  messageId: string;
  content: unknown;
  sequence: number;
}

export interface ActionRequiredEvent {
  type: "action.required";
  actionRequestId: string;
  actionType: string;
  status: string;
  preview: {
    title?: string;
    bodySummary?: string;
    part?: {
      number?: string;
      name?: string;
    };
  };
  sequence: number;
}

export interface RunCompletedEvent {
  type: "run.completed";
  runId: string;
  sequence: number;
}

export interface RunFailedEvent {
  type: "run.failed";
  runId: string;
  error: string;
  sequence: number;
}

// ── Tool Step (timeline 아이템) ──

export type ToolStepStatus = "running" | "completed" | "failed";

export interface ToolStep {
  toolCallId: string;
  toolName: string;
  displayName: string;
  status: ToolStepStatus;
  message: string;
  summary?: string;
  blocks?: unknown[];
}
