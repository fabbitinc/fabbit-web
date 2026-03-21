import type { ChatMessageContent } from "../types/chat-model";
import type { ChatBlock, ActionRequestPayload } from "../types/chat-artifact";

// ── JsonNode(unknown) → ChatMessageContent 파싱 ──
// 백엔드 content 구조: { text?: string, blocks?: Block[] }
// 또는 단순 문자열

export function parseMessageContent(raw: unknown): ChatMessageContent {
  // 단순 문자열
  if (typeof raw === "string") {
    return { text: raw, blocks: [{ type: "text", text: raw }] };
  }

  if (!isRecord(raw)) {
    return { text: "", blocks: [] };
  }

  const text = typeof raw.text === "string" ? raw.text : "";
  const rawBlocks = Array.isArray(raw.blocks) ? raw.blocks : [];

  // blocks가 없으면 text만으로 구성
  if (rawBlocks.length === 0 && text) {
    return { text, blocks: [{ type: "text", text }] };
  }

  const blocks = rawBlocks
    .map(parseBlock)
    .filter((b): b is ChatBlock => b !== null);

  return { text, blocks };
}

// ── 개별 Block 파싱 ──

export function parseBlock(raw: unknown): ChatBlock | null {
  if (!isRecord(raw)) return null;

  const type = raw.type as string | undefined;
  if (!type) return null;

  switch (type) {
    case "text":
      return {
        type: "text",
        text: typeof raw.text === "string" ? raw.text : "",
      };

    case "entity_list":
      return {
        type: "entity_list",
        entityType: String(raw.payload?.entityType ?? raw.entityType ?? ""),
        items: Array.isArray(raw.payload?.items ?? raw.items)
          ? (raw.payload?.items ?? raw.items)
          : [],
      };

    case "entity_detail":
      return {
        type: "entity_detail",
        entityType: String(raw.payload?.entityType ?? raw.entityType ?? ""),
        entityId: String(raw.payload?.entityId ?? raw.entityId ?? ""),
        fields: isRecord(raw.payload?.fields ?? raw.fields)
          ? (raw.payload?.fields ?? raw.fields)
          : {},
      };

    case "action_request":
      return parseActionRequestBlock(raw);

    case "warning":
      return {
        type: "warning",
        title: String(raw.payload?.title ?? raw.title ?? ""),
        description: (raw.payload?.description ?? raw.description)
          ? String(raw.payload?.description ?? raw.description)
          : undefined,
      };

    case "table":
      return {
        type: "table",
        columns: Array.isArray(raw.payload?.columns ?? raw.columns)
          ? (raw.payload?.columns ?? raw.columns)
          : [],
        rows: Array.isArray(raw.payload?.rows ?? raw.rows)
          ? (raw.payload?.rows ?? raw.rows)
          : [],
      };

    default:
      return null;
  }
}

function parseActionRequestBlock(raw: Record<string, unknown>): ChatBlock | null {
  const payload = isRecord(raw.payload) ? raw.payload : raw;

  const actionRequestId = String(payload.actionRequestId ?? "");
  if (!actionRequestId) return null;

  const preview = isRecord(payload.preview) ? payload.preview : {};

  return {
    type: "action_request",
    payload: {
      actionRequestId,
      actionType: String(payload.actionType ?? ""),
      status: (payload.status ?? "PENDING") as ActionRequestPayload["status"],
      preview: {
        title: typeof preview.title === "string" ? preview.title : undefined,
        bodySummary: typeof preview.bodySummary === "string" ? preview.bodySummary : undefined,
        part: isRecord(preview.part)
          ? {
              number: typeof preview.part.number === "string" ? preview.part.number : undefined,
              name: typeof preview.part.name === "string" ? preview.part.name : undefined,
            }
          : undefined,
      },
    },
  };
}

// ── SSE action.required 이벤트 → ActionRequestBlock 변환 ──

export function actionRequiredToBlock(data: {
  actionRequestId: string;
  actionType: string;
  status: string;
  preview: Record<string, unknown>;
}): ChatBlock {
  const preview = isRecord(data.preview) ? data.preview : {};

  return {
    type: "action_request",
    payload: {
      actionRequestId: data.actionRequestId,
      actionType: data.actionType,
      status: (data.status ?? "PENDING") as ActionRequestPayload["status"],
      preview: {
        title: typeof preview.title === "string" ? preview.title : undefined,
        bodySummary: typeof preview.bodySummary === "string" ? preview.bodySummary : undefined,
        part: isRecord(preview.part)
          ? {
              number: typeof preview.part.number === "string" ? preview.part.number : undefined,
              name: typeof preview.part.name === "string" ? preview.part.name : undefined,
            }
          : undefined,
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
