import { Plus, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@fabbit/ui";
import { useChatThreadsQuery } from "../hooks/use-chat-threads-query";
import { useCreateThreadAction } from "../hooks/use-create-thread-action";
import { useChatStore } from "../stores/chat-store";
import type { ChatThreadModel } from "../types/chat-model";

export function ChatThreadListView() {
  const { data: threads, isLoading } = useChatThreadsQuery();
  const createThread = useCreateThreadAction();
  const { openThread } = useChatStore();

  function handleNewThread() {
    createThread.mutate({});
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">대화 목록</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewThread}
          disabled={createThread.isPending}
        >
          {createThread.isPending ? (
            <Loader2 className="mr-1 size-4 animate-spin" />
          ) : (
            <Plus className="mr-1 size-4" />
          )}
          새 대화
        </Button>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (!threads || threads.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageSquare className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              아직 대화가 없습니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewThread}
              disabled={createThread.isPending}
            >
              <Plus className="mr-1 size-4" />
              대화 시작하기
            </Button>
          </div>
        )}

        {threads && threads.length > 0 && (
          <ul className="divide-y divide-border">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.threadId}
                thread={thread}
                onClick={() => openThread(thread.threadId)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ThreadItem({
  thread,
  onClick,
}: {
  thread: ChatThreadModel;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 cursor-pointer"
        onClick={onClick}
      >
        <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{thread.title}</p>
          {thread.lastMessageAt && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatRelativeTime(thread.lastMessageAt)}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}
