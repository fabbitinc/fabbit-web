import { useState } from "react";
import { Check, Loader2, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@fabbit/ui";
import type { ToolStep } from "../types/chat-sse";
import type { ChatBlock } from "../types/chat-artifact";
import { parseBlock } from "../lib/message-parser";
import { BlockRenderer } from "./block-renderer";

interface ToolTimelineProps {
  steps: ToolStep[];
}

export function ToolTimeline({ steps }: ToolTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="space-y-0.5 py-1">
      {steps.map((step) => (
        <ToolStepItem key={step.toolCallId} step={step} />
      ))}
    </div>
  );
}

function ToolStepItem({ step }: { step: ToolStep }) {
  const [expanded, setExpanded] = useState(false);

  const hasBlocks = step.blocks && step.blocks.length > 0;
  const parsedBlocks = hasBlocks
    ? (step.blocks!
        .map((raw) => parseBlock(raw))
        .filter((b): b is ChatBlock => b !== null))
    : [];
  const hasExpandableContent = parsedBlocks.length > 0;

  return (
    <div className="group">
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors",
          hasExpandableContent && "hover:bg-muted/50 cursor-pointer",
          !hasExpandableContent && "cursor-default",
        )}
        onClick={() => hasExpandableContent && setExpanded(!expanded)}
        disabled={!hasExpandableContent}
      >
        {/* 상태 아이콘 */}
        <StepStatusIcon status={step.status} />

        {/* 메시지 */}
        <span className="min-w-0 flex-1 truncate text-left">
          {step.message}
        </span>

        {/* 펼치기 화살표 */}
        {hasExpandableContent && (
          expanded
            ? <ChevronDown className="size-3 shrink-0 opacity-50" />
            : <ChevronRight className="size-3 shrink-0 opacity-50" />
        )}
      </button>

      {/* 펼침 영역 — supporting blocks */}
      {expanded && parsedBlocks.length > 0 && (
        <div className="ml-5 mt-1 mb-1 space-y-1.5">
          {parsedBlocks.map((block, i) => (
            <div key={i} className="text-xs">
              <BlockRenderer block={block} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepStatusIcon({ status }: { status: ToolStep["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />;
    case "completed":
      return <Check className="size-3 shrink-0 text-emerald-500" />;
    case "failed":
      return <X className="size-3 shrink-0 text-destructive" />;
  }
}
