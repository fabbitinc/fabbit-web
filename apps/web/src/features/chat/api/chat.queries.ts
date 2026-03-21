import { queryOptions } from "@tanstack/react-query";
import {
  fetchChatThreadList,
  fetchChatMessages,
  fetchChatThreadDetail,
  fetchRunEvents,
} from "./chat.api";

// ── Query Keys ──

export const chatKeys = {
  all: ["chat"] as const,
  threads: () => ["chat", "threads"] as const,
  threadDetail: (threadId: string) =>
    ["chat", "threads", threadId] as const,
  messages: (threadId: string) =>
    ["chat", "messages", threadId] as const,
  runEvents: (runId: string) =>
    ["chat", "run-events", runId] as const,
};

// ── Query Options ──

export const chatQueries = {
  threads: () =>
    queryOptions({
      queryKey: chatKeys.threads(),
      queryFn: () => fetchChatThreadList(),
      staleTime: 30_000,
    }),

  threadDetail: (threadId: string) =>
    queryOptions({
      queryKey: chatKeys.threadDetail(threadId),
      queryFn: () => fetchChatThreadDetail(threadId),
      staleTime: 30_000,
      enabled: !!threadId,
    }),

  messages: (threadId: string) =>
    queryOptions({
      queryKey: chatKeys.messages(threadId),
      queryFn: () => fetchChatMessages(threadId),
      staleTime: 5_000,
      enabled: !!threadId,
    }),

  runEvents: (runId: string) =>
    queryOptions({
      queryKey: chatKeys.runEvents(runId),
      queryFn: () => fetchRunEvents(runId),
      staleTime: 60_000,
      enabled: !!runId,
    }),
};
