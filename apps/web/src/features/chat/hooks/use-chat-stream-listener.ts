import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectSseStream, calculateBackoff } from "../lib/sse-client";
import { chatKeys } from "../api/chat.queries";
import { useChatStore } from "../stores/chat-store";
import type { ChatSseEvent } from "../types/chat-sse";

export function useChatStreamListener() {
  const queryClient = useQueryClient();
  const streamingRunId = useChatStore((s) => s.streamingRunId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const lastEventSequence = useChatStore((s) => s.lastEventSequence);

  const {
    appendStreamingText,
    setLastEventSequence,
    stopStreaming,
    addToolStep,
    updateToolStep,
  } = useChatStore();

  const reconnectAttemptRef = useRef(0);
  const processedSequencesRef = useRef(new Set<number>());

  useEffect(() => {
    if (!isStreaming || !streamingRunId) return;

    const abortController = new AbortController();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function handleEvent(event: ChatSseEvent) {
      // 중복 이벤트 방지
      if (event.sequence > 0 && processedSequencesRef.current.has(event.sequence)) {
        return;
      }
      if (event.sequence > 0) {
        processedSequencesRef.current.add(event.sequence);
      }

      if (event.type === "connected" || event.type === "run.started") {
        reconnectAttemptRef.current = 0;
      }

      switch (event.type) {
        // ── Tool timeline 이벤트 ──
        case "tool.started": {
          // toolCallId가 없으면 sequence 기반 고유 ID 생성
          const startCallId = event.toolCallId || `step-${event.sequence}`;
          addToolStep({
            toolCallId: startCallId,
            toolName: event.toolName,
            displayName: event.displayName ?? event.toolName,
            status: "running",
            message: event.message ?? `${event.displayName ?? event.toolName} 실행 중...`,
          });
          setLastEventSequence(event.sequence);
          break;
        }

        case "tool.completed": {
          const completeCallId = event.toolCallId || `step-${event.sequence}`;
          updateToolStep(completeCallId, {
            status: "completed",
            message: event.message ?? event.summary ?? "완료",
            summary: event.summary,
            blocks: event.blocks,
          });
          setLastEventSequence(event.sequence);
          break;
        }

        case "tool.failed":
          updateToolStep(event.toolCallId, {
            status: "failed",
            message: event.error || "실패",
          });
          setLastEventSequence(event.sequence);
          break;

        case "trace.updated":
          // trace는 현재 진행 중인 마지막 tool step의 메시지를 업데이트
          // 별도 step으로 추가하지 않고, 스트리밍 표시에 반영
          setLastEventSequence(event.sequence);
          break;

        // ── 메시지 이벤트 ──
        case "message.delta":
          appendStreamingText(event.delta);
          setLastEventSequence(event.sequence);
          break;

        case "message.completed":
          setLastEventSequence(event.sequence);
          if (activeThreadId) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(activeThreadId),
            });
          }
          break;

        case "action.required":
          setLastEventSequence(event.sequence);
          if (activeThreadId) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(activeThreadId),
            });
          }
          break;

        // ── Run 종료 이벤트 ──
        case "run.completed":
          setLastEventSequence(event.sequence);
          stopStreaming();
          if (activeThreadId) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(activeThreadId),
            });
          }
          break;

        case "run.failed":
          setLastEventSequence(event.sequence);
          toast.error(event.error || "실행 중 오류가 발생했습니다.");
          stopStreaming();
          if (activeThreadId) {
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(activeThreadId),
            });
          }
          break;

        default:
          if (event.sequence > 0) {
            setLastEventSequence(event.sequence);
          }
          break;
      }
    }

    function handleError(error: Error) {
      if (abortController.signal.aborted) return;

      const attempt = reconnectAttemptRef.current;
      if (attempt >= 5) {
        toast.error("스트리밍 연결에 실패했습니다. 새로고침해 주세요.");
        stopStreaming();
        return;
      }

      reconnectAttemptRef.current = attempt + 1;
      const delay = calculateBackoff(attempt);

      reconnectTimer = setTimeout(() => {
        if (!abortController.signal.aborted) {
          startConnection();
        }
      }, delay);
    }

    function handleClose() {
      // 정상 종료
    }

    function startConnection() {
      connectSseStream({
        runId: streamingRunId!,
        lastEventSequence,
        signal: abortController.signal,
        onEvent: handleEvent,
        onError: handleError,
        onClose: handleClose,
      });
    }

    processedSequencesRef.current.clear();
    reconnectAttemptRef.current = 0;
    startConnection();

    return () => {
      abortController.abort();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [isStreaming, streamingRunId]);
}
