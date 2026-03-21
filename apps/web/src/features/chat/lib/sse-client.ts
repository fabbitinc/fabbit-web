import { getStoredTokens } from "@/lib/auth-cookies";
import type { ChatSseEvent, SseRawEvent } from "../types/chat-sse";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ── SSE 연결 옵션 ──

export interface SseStreamOptions {
  runId: string;
  lastEventSequence?: number;
  signal: AbortSignal;
  onEvent: (event: ChatSseEvent) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

// ── SSE 연결 (fetch + ReadableStream) ──
// EventSource는 커스텀 헤더를 지원하지 않으므로 fetch 사용

export async function connectSseStream(options: SseStreamOptions) {
  const { runId, lastEventSequence = 0, signal, onEvent, onError, onClose } =
    options;

  const url = new URL(`${API_BASE_URL}/api/v1/chat/runs/${runId}/stream`);
  if (lastEventSequence > 0) {
    url.searchParams.set("last_event_sequence", String(lastEventSequence));
  }

  const { accessToken } = getStoredTokens();

  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (lastEventSequence > 0) {
    headers["Last-Event-ID"] = String(lastEventSequence);
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      signal,
    });

    if (!response.ok) {
      throw new Error(`SSE 연결 실패: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("SSE 응답에 body가 없습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // SSE 파싱 상태
    let currentEventType = "";
    let currentData = "";
    let currentId = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 줄 단위로 처리
      const lines = buffer.split("\n");
      // 마지막 줄은 불완전할 수 있으므로 버퍼에 보존
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          currentData += line.slice(5).trim();
        } else if (line.startsWith("id:")) {
          currentId = line.slice(3).trim();
        } else if (line === "" || line === "\r") {
          // 빈 줄 = 이벤트 경계
          if (currentEventType || currentData) {
            const rawEvent: SseRawEvent = {
              event: currentEventType || "message",
              data: currentData,
              id: currentId || undefined,
            };

            const parsed = parseSseEvent(rawEvent);
            if (parsed) {
              onEvent(parsed);
            }
          }

          // 상태 초기화
          currentEventType = "";
          currentData = "";
          currentId = "";
        }
        // ":" 로 시작하는 줄은 주석 (keepalive) — 무시
      }
    }

    onClose();
  } catch (error) {
    if (signal.aborted) return;
    onError(
      error instanceof Error ? error : new Error("SSE 연결 오류"),
    );
  }
}

// ── SSE 이벤트 파싱 ──

function parseSseEvent(raw: SseRawEvent): ChatSseEvent | null {
  const eventType = raw.event;

  let data: Record<string, unknown> = {};
  try {
    if (raw.data) {
      data = JSON.parse(raw.data);
    }
  } catch {
    // JSON 파싱 실패 시 data 문자열 그대로 사용
    data = { raw: raw.data };
  }

  const sequence = typeof data.sequence === "number" ? data.sequence : 0;

  switch (eventType) {
    case "connected":
      return { type: "connected", sequence };

    case "run.started":
      return {
        type: "run.started",
        runId: String(data.runId ?? data.run_id ?? ""),
        sequence,
      };

    case "trace.updated":
      return {
        type: "trace.updated",
        trace: String(data.trace ?? data.message ?? ""),
        sequence,
      };

    case "tool.started":
      return {
        type: "tool.started",
        toolName: String(data.toolName ?? data.tool_name ?? ""),
        toolCallId: String(data.toolCallId ?? data.tool_call_id ?? ""),
        displayName: data.displayName ?? data.display_name
          ? String(data.displayName ?? data.display_name)
          : undefined,
        message: data.message ? String(data.message) : undefined,
        sequence,
      };

    case "tool.completed":
      return {
        type: "tool.completed",
        toolCallId: String(data.toolCallId ?? data.tool_call_id ?? ""),
        toolName: data.toolName ?? data.tool_name
          ? String(data.toolName ?? data.tool_name)
          : undefined,
        displayName: data.displayName ?? data.display_name
          ? String(data.displayName ?? data.display_name)
          : undefined,
        summary: data.summary ? String(data.summary) : undefined,
        message: data.message ? String(data.message) : undefined,
        blocks: Array.isArray(data.blocks) ? data.blocks : undefined,
        result: data.result,
        sequence,
      };

    case "tool.failed":
      return {
        type: "tool.failed",
        toolCallId: String(data.toolCallId ?? data.tool_call_id ?? ""),
        error: String(data.error ?? ""),
        sequence,
      };

    case "message.delta":
      return {
        type: "message.delta",
        messageId: String(data.messageId ?? data.message_id ?? ""),
        delta: String(data.delta ?? data.content ?? ""),
        sequence,
      };

    case "message.completed":
      return {
        type: "message.completed",
        messageId: String(data.messageId ?? data.message_id ?? ""),
        content: data.content,
        sequence,
      };

    case "run.completed":
      return {
        type: "run.completed",
        runId: String(data.runId ?? data.run_id ?? ""),
        sequence,
      };

    case "action.required":
      return {
        type: "action.required",
        actionRequestId: String(data.actionRequestId ?? data.action_request_id ?? ""),
        actionType: String(data.actionType ?? data.action_type ?? ""),
        status: String(data.status ?? "PENDING"),
        preview: (typeof data.preview === "object" && data.preview !== null
          ? data.preview
          : {}) as { title?: string; bodySummary?: string; part?: { number?: string; name?: string } },
        sequence,
      };

    case "run.failed":
      return {
        type: "run.failed",
        runId: String(data.runId ?? data.run_id ?? ""),
        error: String(data.error ?? data.message ?? "실행 실패"),
        sequence,
      };

    default:
      // 알 수 없는 이벤트는 무시
      return null;
  }
}

// ── 재연결 유틸리티 ──

export function calculateBackoff(attempt: number): number {
  const base = 1000;
  const max = 30000;
  const delay = Math.min(base * Math.pow(2, attempt), max);
  // 지터 추가 (±25%)
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}
