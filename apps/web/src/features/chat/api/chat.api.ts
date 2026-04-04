// ── 수정 체크리스트 ──
// - chat.queries.ts: 여기 함수를 queryOptions/mutationOptions에서 사용
// - chat-model.ts: 변환 대상 타입 변경 시 함께 수정

import {
  chatListThreads as listThreadsApi,
  chatCreateThread as createThreadApi,
  chatGetThread as getThreadApi,
  chatListMessages as listMessagesApi,
  chatSendMessage as sendMessageApi,
  chatConfirmAction as confirmActionApi,
  chatRejectAction as rejectActionApi,
  chatListRunEvents as listRunEventsApi,
} from "@/api/generated/orval/chat/chat";
import type {
  ChatThreadItemResponse,
  ChatThreadDetailResponse,
  ChatMessageResponse,
  ChatRunEventResponse,
  CreateChatThreadRequest,
} from "@/api/generated/orval/model";
import type {
  ChatThreadModel,
  ChatMessageModel,
  ChatMessageRole,
  ChatMessageStatus,
  ChatMessageType,
} from "../types/chat-model";
import type { ToolStep } from "../types/chat-sse";
import { parseMessageContent } from "../lib/message-parser";

// ── 조회 ──

export async function fetchChatThreadList(): Promise<ChatThreadModel[]> {
  const response = await listThreadsApi();
  if (!response) return [];

  const items = (response as { items?: ChatThreadItemResponse[] }).items;
  return (items ?? []).map(toChatThreadModel);
}

export async function fetchChatThreadDetail(
  threadId: string,
): Promise<ChatThreadModel> {
  const response = await getThreadApi(threadId);
  return toChatThreadModel(response as ChatThreadDetailResponse);
}

export async function fetchChatMessages(
  threadId: string,
): Promise<ChatMessageModel[]> {
  const response = await listMessagesApi(threadId);
  if (!response) return [];

  const items = (response as { items?: ChatMessageResponse[] }).items;
  return (items ?? []).map(toChatMessageModel);
}

// ── Run Events 조회 (재진입 시 timeline 복원) ──

export async function fetchRunEvents(runId: string): Promise<ToolStep[]> {
  try {
    const response = await listRunEventsApi(runId);
    if (!response) return [];

    const items = (response as { items?: ChatRunEventResponse[] }).items;
    if (!items || items.length === 0) return [];

    const steps: ToolStep[] = [];
    const stepMap = new Map<string, ToolStep>();

    for (const event of items) {
      // USER_VISIBLE 이벤트만 timeline에 표시
      if (event.visibility && event.visibility !== "USER_VISIBLE") continue;

      const payload = event.payload as Record<string, unknown> | undefined;
      if (!payload) continue;

      const toolCallId = String(payload.toolCallId ?? payload.tool_call_id ?? "");
      if (!toolCallId) continue;

      const eventType = event.event_type ?? "";

      if (eventType === "tool.started" || eventType === "TOOL_STARTED") {
        const step: ToolStep = {
          toolCallId,
          toolName: String(payload.toolName ?? payload.tool_name ?? ""),
          displayName: String(payload.displayName ?? payload.display_name ?? payload.toolName ?? payload.tool_name ?? ""),
          status: "running",
          message: String(payload.message ?? `${payload.displayName ?? payload.display_name ?? ""} 실행 중...`),
        };
        stepMap.set(toolCallId, step);
        steps.push(step);
      } else if (eventType === "tool.completed" || eventType === "TOOL_COMPLETED") {
        const existing = stepMap.get(toolCallId);
        if (existing) {
          existing.status = "completed";
          existing.message = String(payload.message ?? payload.summary ?? "완료");
          existing.summary = payload.summary ? String(payload.summary) : undefined;
          existing.blocks = Array.isArray(payload.blocks) ? payload.blocks : undefined;
        } else {
          steps.push({
            toolCallId,
            toolName: String(payload.toolName ?? payload.tool_name ?? ""),
            displayName: String(payload.displayName ?? payload.display_name ?? ""),
            status: "completed",
            message: String(payload.message ?? payload.summary ?? "완료"),
            summary: payload.summary ? String(payload.summary) : undefined,
            blocks: Array.isArray(payload.blocks) ? payload.blocks : undefined,
          });
        }
      } else if (eventType === "tool.failed" || eventType === "TOOL_FAILED") {
        const errorMsg = String(payload.error ?? payload.message ?? "실패");
        const existing = stepMap.get(toolCallId);
        if (existing) {
          existing.status = "failed";
          existing.message = errorMsg;
        } else {
          steps.push({
            toolCallId,
            toolName: String(payload.toolName ?? payload.tool_name ?? ""),
            displayName: String(payload.displayName ?? payload.display_name ?? ""),
            status: "failed",
            message: errorMsg,
          });
        }
      }
    }

    return steps;
  } catch {
    return [];
  }
}

// ── 뮤테이션 ──

export async function createChatThread(request: CreateChatThreadRequest) {
  const response = await createThreadApi(request);
  return response as { thread_id?: string };
}

export async function sendChatMessage(threadId: string, text: string) {
  const response = await sendMessageApi(threadId, { text });
  return response as {
    message_id?: string;
    run_id?: string;
    status?: string;
  };
}

export async function confirmChatAction(actionRequestId: string) {
  const response = await confirmActionApi(actionRequestId);
  return response as {
    action_request_id?: string;
    status?: string;
    issue_id?: string;
  };
}

export async function rejectChatAction(actionRequestId: string) {
  await rejectActionApi(actionRequestId);
}

// ── DTO → Model 변환 ──

function toChatThreadModel(
  dto: ChatThreadItemResponse | ChatThreadDetailResponse | undefined,
): ChatThreadModel {
  return {
    threadId: dto?.thread_id ?? "",
    projectId: dto?.project_id ?? null,
    contextType: dto?.context_type ?? null,
    contextId: dto?.context_id ?? null,
    title: dto?.title ?? "새 대화",
    status: (dto?.status as "ACTIVE" | "ARCHIVED") ?? "ACTIVE",
    lastMessageAt: dto?.last_message_at ?? null,
    createdAt: dto?.created_at ?? new Date().toISOString(),
  };
}

function toChatMessageModel(dto: ChatMessageResponse): ChatMessageModel {
  const role = mapRole(dto.role);
  const messageType = mapMessageType(dto.message_type);
  const status = mapStatus(dto.status);

  return {
    messageId: dto.message_id ?? "",
    runId: dto.run_id ?? null,
    role,
    messageType,
    status,
    sequence: dto.sequence ?? 0,
    content: parseMessageContent(dto.content),
    createdAt: dto.created_at ?? new Date().toISOString(),
  };
}

function mapRole(raw: string | undefined): ChatMessageRole {
  switch (raw?.toUpperCase()) {
    case "USER":
      return "user";
    case "ASSISTANT":
      return "assistant";
    case "SYSTEM":
      return "system";
    case "TOOL":
      return "assistant";
    default:
      return "assistant";
  }
}

function mapMessageType(raw: string | undefined): ChatMessageType {
  switch (raw?.toUpperCase()) {
    case "TEXT":
      return "text";
    case "STRUCTURED":
      return "structured";
    case "ERROR":
      return "error";
    default:
      return "text";
  }
}

function mapStatus(raw: string | undefined): ChatMessageStatus {
  switch (raw?.toUpperCase()) {
    case "CREATED":
      return "created";
    case "STREAMING":
      return "streaming";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    default:
      return "completed";
  }
}
