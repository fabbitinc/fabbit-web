import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MappingConnection,
  SourceColumn,
  TargetProperty,
} from "@/features/onboarding/types/onboarding.types";
import { TargetSelector } from "./TargetSelector";
import { cn } from "@/lib/utils";

interface MappingCardProps {
  connection: MappingConnection;
  source: SourceColumn;
  target: TargetProperty;
  availableTargets: TargetProperty[];
  onApprove: (connectionId: string) => void;
  onChangeTarget: (connectionId: string, newTargetId: string) => void;
  onRemove: (connectionId: string) => void;
}

const confidenceColor = {
  high: "text-green-700 bg-green-50 ring-1 ring-inset ring-green-200",
  medium: "text-amber-700 bg-amber-50 ring-1 ring-inset ring-amber-200",
  low: "text-red-700 bg-red-50 ring-1 ring-inset ring-red-200",
};

export function MappingCard({
  connection,
  source,
  target,
  availableTargets,
  onApprove,
  onChangeTarget,
  onRemove,
}: MappingCardProps) {
  const isApproved = connection.approved;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3",
        isApproved
          ? "border-green-100 border-l-4 border-l-green-400 bg-green-50/30"
          : "border-amber-100 border-l-4 border-l-amber-400 bg-white"
      )}
    >
      {/* Row 1: Source → Target + Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {source.name}
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-gray-300" />
          <span className="text-sm font-medium text-blue-700">
            {target.name}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
              confidenceColor[connection.confidenceLevel]
            )}
          >
            {connection.confidence}%
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {isApproved ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
              <Check className="size-3" />
              승인됨
            </span>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-green-200 px-2.5 text-xs text-green-700 hover:bg-green-50"
                onClick={() => onApprove(connection.id)}
              >
                <Check className="mr-1 size-3" />
                승인
              </Button>
              {availableTargets.length > 0 && (
                <TargetSelector
                  key={connection.targetId}
                  targets={availableTargets}
                  onChange={(newTargetId) =>
                    onChangeTarget(connection.id, newTargetId)
                  }
                  placeholder="변경"
                  className="w-[72px]"
                />
              )}
            </>
          )}
          <button
            className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            onClick={() => onRemove(connection.id)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Metadata */}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
        <span className="truncate">
          {source.sampleData.filter(Boolean).join(", ")}
        </span>
        <span className="shrink-0 text-gray-200">|</span>
        <span className="shrink-0">
          {target.description} · {target.label}
          {target.required && (
            <span className="ml-1 text-red-400">[필수]</span>
          )}
        </span>
      </div>
    </div>
  );
}
