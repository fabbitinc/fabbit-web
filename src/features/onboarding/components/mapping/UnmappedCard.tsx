import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  SourceColumn,
  TargetProperty,
} from "@/features/onboarding/types/onboarding.types";
import { TargetSelector } from "./TargetSelector";

interface UnmappedCardProps {
  source: SourceColumn;
  availableTargets: TargetProperty[];
  onCreate: (sourceId: string, targetId: string) => void;
}

export function UnmappedCard({
  source,
  availableTargets,
  onCreate,
}: UnmappedCardProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");

  const handleCreate = () => {
    if (selectedTargetId) {
      onCreate(source.id, selectedTargetId);
      setSelectedTargetId("");
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/30 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-600">
            {source.name}
          </span>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {source.sampleData.filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <TargetSelector
            value={selectedTargetId || undefined}
            targets={availableTargets}
            onChange={setSelectedTargetId}
            placeholder="타겟 선택"
            className="w-[120px]"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 border-blue-200 px-2.5 text-xs text-blue-700 hover:bg-blue-50"
            disabled={!selectedTargetId}
            onClick={handleCreate}
          >
            <Plus className="mr-1 size-3" />
            매핑
          </Button>
        </div>
      </div>
    </div>
  );
}
