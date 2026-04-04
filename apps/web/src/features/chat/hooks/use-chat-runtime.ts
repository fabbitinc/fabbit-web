import { useCallback, useMemo } from "react";
import {
  useExternalStoreRuntime,
  type ThreadMessageLike,
  type AppendMessage,
} from "@assistant-ui/react";
import { useChatStore } from "../stores/chat-store";
import { useChatMessagesQuery } from "./use-chat-messages-query";
import { useSendMessageAction } from "./use-send-message-action";
import { useChatStreamListener } from "./use-chat-stream-listener";
import { createChatThread } from "../api/chat.api";
import type { ChatMessageModel } from "../types/chat-model";

// assistant-ui ExternalStoreRuntime 통합 훅
// 현재는 커스텀 UI로 동작하지만, 향후 <Thread /> 컴포넌트 전환 시 사용

export function useChatRuntime() {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const { setActiveThread, stopStreaming } = useChatStore();

  const messagesQuery = useChatMessagesQuery(activeThreadId);
  const sendMessageAction = useSendMessageAction();

  useChatStreamListener();

  const messages = useMemo(() => {
    const dbMessages = messagesQuery.data ?? [];
    const threadMessages: ThreadMessageLike[] =
      dbMessages.map(toThreadMessageLike);

    if (isStreaming && streamingText) {
      threadMessages.push({
        role: "assistant",
        content: [{ type: "text", text: streamingText }],
        id: "__streaming__",
        createdAt: new Date(),
        status: { type: "running" },
      });
    }

    return threadMessages;
  }, [messagesQuery.data, isStreaming, streamingText]);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const text = extractTextFromAppendMessage(message);
      if (!text.trim()) return;

      let threadId = activeThreadId;

      if (!threadId) {
        const result = await createChatThread({ title: text.slice(0, 50) });
        threadId = result.thread_id ?? null;
        if (!threadId) return;
        setActiveThread(threadId);
      }

      await sendMessageAction.mutateAsync({ threadId, text });
    },
    [activeThreadId, sendMessageAction, setActiveThread],
  );

  const onCancel = useCallback(async () => {
    stopStreaming();
  }, [stopStreaming]);

  const runtime = useExternalStoreRuntime({
    messages,
    isRunning: isStreaming,
    onNew,
    onCancel,
    convertMessage: (message) => message,
  });

  return { runtime };
}

function toThreadMessageLike(msg: ChatMessageModel): ThreadMessageLike {
  // blocks에서 text를 추출
  const textParts = msg.content.blocks
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .filter(Boolean);

  const displayText = textParts.join("\n") || msg.content.text || " ";

  return {
    id: msg.messageId,
    role: msg.role,
    content: [{ type: "text", text: displayText }],
    createdAt: new Date(msg.createdAt),
    status: mapStatus(msg.status),
  };
}

function mapStatus(
  status: string,
): { type: "running" } | { type: "complete"; reason: "unknown" } | { type: "incomplete"; reason: "error" } {
  switch (status) {
    case "streaming":
    case "created":
      return { type: "running" };
    case "failed":
      return { type: "incomplete", reason: "error" };
    default:
      return { type: "complete", reason: "unknown" };
  }
}

function extractTextFromAppendMessage(message: AppendMessage): string {
  if (!message.content || message.content.length === 0) return "";
  return message.content
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}
