// ── Message Block 타입 ──
// 백엔드 assistant 메시지의 content.blocks 배열 항목
// 새 블록 타입 추가 시 이 union에 추가하고 block-renderer에 렌더러 등록

export type ChatBlock =
  | TextBlock
  | EntityListBlock
  | EntityDetailBlock
  | ActionRequestBlock
  | WarningBlock
  | TableBlock;

export type ChatBlockType = ChatBlock["type"];

// ── 텍스트 ──

export interface TextBlock {
  type: "text";
  text: string;
}

// ── 엔티티 목록 (부품, 이슈 등) ──

export interface EntityListBlock {
  type: "entity_list";
  entityType: string;
  items: EntityListItem[];
}

export interface EntityListItem {
  id: string;
  [key: string]: unknown;
}

// ── 엔티티 상세 ──

export interface EntityDetailBlock {
  type: "entity_detail";
  entityType: string;
  entityId: string;
  fields: Record<string, unknown>;
}

// ── 액션 요청 (이슈 생성 등) ──

export type ActionRequestStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "EXECUTED"
  | "FAILED"
  | "EXPIRED";

export interface ActionRequestPayload {
  actionRequestId: string;
  actionType: string;
  status: ActionRequestStatus;
  preview: {
    title?: string;
    bodySummary?: string;
    part?: {
      number?: string;
      name?: string;
    };
  };
}

export interface ActionRequestBlock {
  type: "action_request";
  payload: ActionRequestPayload;
}

// ── 경고 ──

export interface WarningBlock {
  type: "warning";
  title: string;
  description?: string;
}

// ── 테이블 ──

export interface TableBlock {
  type: "table";
  columns: string[];
  rows: unknown[][];
}
