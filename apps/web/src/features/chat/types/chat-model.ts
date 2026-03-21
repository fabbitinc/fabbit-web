import type { ChatBlock } from "./chat-artifact";

// ── 스레드 ──

export type ChatThreadStatus = "ACTIVE" | "ARCHIVED";

export interface ChatThreadModel {
  threadId: string;
  projectId: string | null;
  contextType: string | null;
  contextId: string | null;
  title: string;
  status: ChatThreadStatus;
  lastMessageAt: string | null;
  createdAt: string;
}

// ── 메시지 ──

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessageStatus =
  | "created"
  | "streaming"
  | "completed"
  | "failed";

export type ChatMessageType = "text" | "structured" | "error";

export interface ChatMessageModel {
  messageId: string;
  runId: string | null;
  role: ChatMessageRole;
  messageType: ChatMessageType;
  status: ChatMessageStatus;
  sequence: number;
  content: ChatMessageContent;
  createdAt: string;
}

// ── 메시지 Content ──
// 백엔드 content 구조: { text?: string, blocks?: ChatBlock[] }

export interface ChatMessageContent {
  text: string;
  blocks: ChatBlock[];
}
