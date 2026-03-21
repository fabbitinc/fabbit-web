import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, List, Loader2, Send, X, Plus } from "lucide-react";
import { Button, cn } from "@fabbit/ui";
import { useChatStore } from "../stores/chat-store";
import { useChatMessagesQuery } from "../hooks/use-chat-messages-query";
import { useSendMessageAction } from "../hooks/use-send-message-action";
import { useChatStreamListener } from "../hooks/use-chat-stream-listener";
import { createChatThread } from "../api/chat.api";
import { ChatThreadListView } from "./chat-thread-list-view";
import { BlockRenderer } from "./block-renderer";
import { ToolTimeline } from "./tool-timeline";
import type { ChatMessageModel } from "../types/chat-model";
import type { ChatBlock, ActionRequestBlock } from "../types/chat-artifact";

export function ChatSidePanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const view = useChatStore((s) => s.view);
  const { closePanel, setView } = useChatStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-[420px] max-w-full flex-col border-l border-border bg-background shadow-xl">
      <PanelHeader
        view={view}
        onBack={() => setView("thread-list")}
        onClose={closePanel}
        onNewThread={() => setView("thread-list")}
      />
      <div className="flex-1 overflow-hidden">
        {view === "thread-list" ? <ChatThreadListView /> : <ChatView />}
      </div>
    </div>
  );
}

// ── 패널 헤더 ──

function PanelHeader({
  view,
  onBack,
  onClose,
  onNewThread,
}: {
  view: string;
  onBack: () => void;
  onClose: () => void;
  onNewThread: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2">
      <div className="flex items-center gap-2">
        {view === "chat" && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onBack}>
            <List className="size-4" />
          </Button>
        )}
        <div className="flex items-center gap-1.5">
          <Bot className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">AI 어시스턴트</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {view === "chat" && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onNewThread} aria-label="대화 목록">
            <Plus className="size-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose} aria-label="패널 닫기">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── 채팅 뷰 ──

function ChatView() {
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const toolSteps = useChatStore((s) => s.toolSteps);
  const { data: messages, isLoading } = useChatMessagesQuery(activeThreadId);
  const sendMessageAction = useSendMessageAction();
  const { setActiveThread } = useChatStore();

  useChatStreamListener();

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, toolSteps]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || sendMessageAction.isPending) return;

    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let threadId = activeThreadId;

    if (!threadId) {
      try {
        const result = await createChatThread({ title: text.slice(0, 50) });
        threadId = result.thread_id ?? null;
        if (!threadId) return;
        setActiveThread(threadId);
      } catch {
        return;
      }
    }

    sendMessageAction.mutate({ threadId, text });
  }, [inputValue, activeThreadId, sendMessageAction, setActiveThread]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isSending = sendMessageAction.isPending;

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!messages || messages.length === 0) && !isStreaming && (
          <EmptyState />
        )}

        {messages && messages.length > 0 && (
          <div className="space-y-3 px-4 py-4">
            {messages
              .filter((msg) => {
                if (
                  isStreaming &&
                  msg.role === "assistant" &&
                  (msg.status === "streaming" || msg.status === "created")
                ) {
                  return false;
                }
                return true;
              })
              .map((msg) => (
                <MessageBubble key={msg.messageId} message={msg} />
              ))}

            {/* ── 과정 로그 + 스트리밍 중 텍스트 ── */}
            {/* toolSteps가 있으면 스트리밍 끝난 후에도 계속 보여줌 */}
            {(toolSteps.length > 0 || (isStreaming && !streamingText)) && (
              <StreamingSection
                toolSteps={toolSteps}
                streamingText={isStreaming ? streamingText : ""}
                isStreaming={isStreaming}
              />
            )}
          </div>
        )}

        {/* 메시지 없지만 스트리밍 시작된 경우 */}
        {(!messages || messages.length === 0) && (toolSteps.length > 0 || isStreaming) && (
          <div className="space-y-3 px-4 py-4">
            <StreamingSection
              toolSteps={toolSteps}
              streamingText={isStreaming ? streamingText : ""}
              isStreaming={isStreaming}
            />
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="min-h-[36px] max-h-[160px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            rows={1}
            disabled={isSending}
          />
          <Button
            size="icon"
            className="size-9 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending || isStreaming}
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── 스트리밍 섹션: Tool Timeline + 진행 중 텍스트 ──

function StreamingSection({
  toolSteps,
  streamingText,
  isStreaming,
}: {
  toolSteps: import("../types/chat-sse").ToolStep[];
  streamingText: string;
  isStreaming: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 max-w-[90%] flex-1 space-y-1">
        {/* Tool timeline (과정 로그) */}
        {toolSteps.length > 0 && (
          <ToolTimeline steps={toolSteps} />
        )}

        {/* 스트리밍 중 텍스트 (최종 응답 프리뷰) */}
        {streamingText && (
          <>
            {toolSteps.length > 0 && (
              <div className="my-1.5 border-t border-border/50" />
            )}
            <div className="rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
              {streamingText}
            </div>
          </>
        )}

        {/* 스트리밍 중이지만 아직 아무것도 없을 때 */}
        {isStreaming && toolSteps.length === 0 && !streamingText && (
          <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            생각하는 중...
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메시지 버블 ──
// assistant 메시지: text blocks → 최종 응답 텍스트, action_request blocks → 카드
// entity_list/entity_detail 등 supporting blocks → 별도 렌더링하지 않음 (timeline에서 처리)

function MessageBubble({ message }: { message: ChatMessageModel }) {
  const { role, content } = message;
  const isUser = role === "user";

  // blocks 분리: text vs action_request vs others
  const { displayText, actionRequests, otherBlocks } = useMemo(() => {
    const textParts: string[] = [];
    const actions: ActionRequestBlock[] = [];
    const others: ChatBlock[] = [];

    if (content.blocks.length === 0) {
      return {
        displayText: content.text || "",
        actionRequests: [],
        otherBlocks: [],
      };
    }

    for (const block of content.blocks) {
      if (block.type === "text") {
        if (block.text) textParts.push(block.text);
      } else if (block.type === "action_request") {
        actions.push(block);
      } else {
        others.push(block);
      }
    }

    return {
      displayText: textParts.join("\n"),
      actionRequests: actions,
      otherBlocks: others,
    };
  }, [content]);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap">
          {displayText || content.text}
        </div>
      </div>
    );
  }

  // assistant 메시지
  return (
    <div className="flex gap-2">
      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 max-w-[90%] flex-1 space-y-2">
        {/* 최종 응답 텍스트 */}
        {displayText && (
          <div className="rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm whitespace-pre-wrap">
            {displayText}
          </div>
        )}

        {/* 액션 카드 — 최종 응답 바로 아래 */}
        {actionRequests.map((block) => (
          <BlockRenderer
            key={block.payload.actionRequestId}
            block={block}
          />
        ))}
      </div>
    </div>
  );
}

// ── 빈 상태 ──

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">AI 어시스턴트</p>
        <p className="mt-1 text-xs text-muted-foreground">
          부품 검색, 이슈 관리 등 업무를 도와드립니다.
          <br />
          메시지를 입력해 대화를 시작하세요.
        </p>
      </div>
    </div>
  );
}
