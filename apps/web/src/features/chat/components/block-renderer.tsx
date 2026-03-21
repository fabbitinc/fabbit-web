import type { ChatBlock } from "../types/chat-artifact";
import { EntityListCard } from "./entity-list-card";
import { EntityDetailCard } from "./entity-detail-card";
import { ActionRequestCard } from "./action-request-card";
import { WarningCard } from "./warning-card";
import { TableCard } from "./table-card";

// ── Block 렌더러 ──
// blocks 배열의 개별 항목을 렌더링
// text block은 여기서 렌더링하지 않음 (메시지 버블에서 직접 처리)

interface BlockRendererProps {
  block: ChatBlock;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      // text block은 메시지 버블에서 처리하므로 여기서 skip
      return null;

    case "entity_list":
      return <EntityListCard artifact={block} />;

    case "entity_detail":
      return <EntityDetailCard artifact={block} />;

    case "action_request":
      return <ActionRequestCard payload={block.payload} />;

    case "warning":
      return <WarningCard artifact={block} />;

    case "table":
      return <TableCard artifact={block} />;

    default:
      return (
        <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          지원하지 않는 블록 타입: {(block as { type: string }).type}
        </div>
      );
  }
}
