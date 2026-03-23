import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, List, Loader2, Send, X, Plus } from "lucide-react";
import { Button } from "@fabbit/ui";
import { MarkdownText } from "./markdown-text";
import { useChatStore } from "../stores/chat-store";
import { useChatMessagesQuery } from "../hooks/use-chat-messages-query";
import { useSendMessageAction } from "../hooks/use-send-message-action";
import { useChatStreamListener } from "../hooks/use-chat-stream-listener";
import { useRunEventsQuery } from "../hooks/use-run-events-query";
import { createChatThread } from "../api/chat.api";
import { ChatThreadListView } from "./chat-thread-list-view";
import { BlockRenderer } from "./block-renderer";
import { ToolTimeline } from "./tool-timeline";
import type { ChatMessageModel } from "../types/chat-model";
import type { ActionRequestBlock } from "../types/chat-artifact";
import type { ToolStep } from "../types/chat-sse";

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
  const streamingRunId = useChatStore((s) => s.streamingRunId);
  const streamingText = useChatStore((s) => s.streamingText);
  const toolStepsByRun = useChatStore((s) => s.toolStepsByRun);
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
  }, [messages, streamingText, toolStepsByRun]);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || sendMessageAction.isPending) return;

    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
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

  // 현재 스트리밍 중인 run의 tool steps
  const currentStreamSteps = streamingRunId
    ? (toolStepsByRun[streamingRunId] ?? [])
    : [];

  const isSending = sendMessageAction.isPending;

  // 메시지를 렌더링할 때, assistant 메시지의 runId로 timeline을 연결
  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    return messages.filter((msg) => {
      // 스트리밍 중 서버 측 미완성 assistant 메시지 제외
      if (
        isStreaming &&
        msg.role === "assistant" &&
        (msg.status === "streaming" || msg.status === "created")
      ) {
        return false;
      }
      return true;
    });
  }, [messages, isStreaming]);

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && filteredMessages.length === 0 && !isStreaming && (
          <EmptyState />
        )}

        <div className="space-y-3 px-4 py-4">
          {filteredMessages.map((msg) => (
            <MessageWithTimeline
              key={msg.messageId}
              message={msg}
              toolStepsByRun={toolStepsByRun}
            />
          ))}

          {/* 스트리밍 중: 과정 로그 + 응답 프리뷰 */}
          {isStreaming && (
            <div className="flex gap-2">
              <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 max-w-[90%] flex-1 space-y-1">
                {currentStreamSteps.length > 0 && (
                  <ToolTimeline steps={currentStreamSteps} />
                )}

                {streamingText && (
                  <>
                    {currentStreamSteps.length > 0 && (
                      <div className="my-1.5 border-t border-border/50" />
                    )}
                    <div className="rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm">
                      <MarkdownText>{streamingText}</MarkdownText>
                    </div>
                  </>
                )}

                {currentStreamSteps.length === 0 && !streamingText && (
                  <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    생각하는 중...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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

// ── 메시지 + Timeline 렌더링 ──
// assistant 메시지에 runId가 있으면 해당 run의 timeline을 위에 표시

function MessageWithTimeline({
  message,
  toolStepsByRun,
}: {
  message: ChatMessageModel;
  toolStepsByRun: Record<string, ToolStep[]>;
}) {
  const isUser = message.role === "user";

  // user 메시지는 timeline 없이 그냥 렌더링
  if (isUser) {
    return <UserBubble message={message} />;
  }

  // assistant 메시지 — runId로 timeline 연결
  const runId = message.runId;
  const storeSteps = runId ? (toolStepsByRun[runId] ?? []) : [];

  return (
    <AssistantMessageWithTimeline
      message={message}
      storeSteps={storeSteps}
      runId={runId}
    />
  );
}

function UserBubble({ message }: { message: ChatMessageModel }) {
  const displayText = message.content.text || "";

  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap">
        {displayText}
      </div>
    </div>
  );
}

function AssistantMessageWithTimeline({
  message,
  storeSteps,
  runId,
}: {
  message: ChatMessageModel;
  storeSteps: ToolStep[];
  runId: string | null;
}) {
  const setToolStepsForRun = useChatStore((s) => s.setToolStepsForRun);

  // store에 steps가 없으면 서버에서 조회 (재진입 복원)
  const shouldFetchEvents = storeSteps.length === 0 && !!runId;
  const { data: fetchedSteps } = useRunEventsQuery(shouldFetchEvents ? runId : null);

  // 서버에서 가져온 steps를 store에 저장 (한 번만)
  useEffect(() => {
    if (fetchedSteps && fetchedSteps.length > 0 && runId && storeSteps.length === 0) {
      setToolStepsForRun(runId, fetchedSteps);
    }
  }, [fetchedSteps, runId, storeSteps.length, setToolStepsForRun]);

  const timelineSteps = storeSteps.length > 0 ? storeSteps : (fetchedSteps ?? []);

  // blocks 분리: text vs action_request
  const { displayText, actionRequests } = useMemo(() => {
    const textParts: string[] = [];
    const actions: ActionRequestBlock[] = [];

    if (message.content.blocks.length === 0) {
      return {
        displayText: message.content.text || "",
        actionRequests: [],
      };
    }

    for (const block of message.content.blocks) {
      if (block.type === "text") {
        if (block.text) textParts.push(block.text);
      } else if (block.type === "action_request") {
        actions.push(block);
      }
    }

    // blocks에서 text를 추출 못하면 content.text fallback
    const joined = textParts.join("\n");
    return {
      displayText: joined || message.content.text || "",
      actionRequests: actions,
    };
  }, [message.content]);

  return (
    <div className="flex gap-2">
      <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bot className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 max-w-[90%] flex-1 space-y-1.5">
        {/* Timeline (과정 로그) */}
        {timelineSteps.length > 0 && (
          <ToolTimeline steps={timelineSteps} />
        )}

        {/* 구분선 — timeline과 최종 응답 사이 */}
        {timelineSteps.length > 0 && displayText && (
          <div className="my-1 border-t border-border/50" />
        )}

        {/* 최종 응답 텍스트 */}
        {displayText && (
          <div className="rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm">
            <MarkdownText>{displayText}</MarkdownText>
          </div>
        )}

        {/* 액션 카드 */}
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
