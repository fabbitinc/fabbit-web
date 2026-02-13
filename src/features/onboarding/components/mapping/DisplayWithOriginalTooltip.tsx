import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DisplayWithOriginalTooltipProps {
  display: string;
  original?: string;
}

export function DisplayWithOriginalTooltip({
  display,
  original,
}: DisplayWithOriginalTooltipProps) {
  if (!original || display === original) {
    return <span>{display}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span>{display}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-help items-center text-gray-400"
            aria-label="원문 보기"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>{original}</TooltipContent>
      </Tooltip>
    </span>
  );
}
