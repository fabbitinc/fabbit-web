import { AlertTriangle } from "lucide-react";
import type { WarningBlock } from "../types/chat-artifact";

interface WarningCardProps {
  artifact: WarningBlock;
}

export function WarningCard({ artifact }: WarningCardProps) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {artifact.title}
        </p>
        {artifact.description && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            {artifact.description}
          </p>
        )}
      </div>
    </div>
  );
}
