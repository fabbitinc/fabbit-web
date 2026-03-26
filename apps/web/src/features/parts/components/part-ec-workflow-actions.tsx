import { ChevronDown } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fabbit/ui";

interface PartEcWorkflowActionsProps {
  className?: string;
  disabledReason: string;
}

/**
 * EC 모드에서 리비전 릴리즈/취소 버튼을 비활성화 상태로 표시한다.
 * aria-disabled + Tooltip으로 비활성 사유를 표시한다.
 */
export function PartEcWorkflowActions({
  className,
  disabledReason,
}: PartEcWorkflowActionsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={className ?? "w-full"}>
            <div className="inline-flex w-full items-stretch rounded-md shadow-xs">
              <Button
                aria-disabled="true"
                className="min-w-0 flex-1 rounded-r-none opacity-50 cursor-not-allowed"
                size="sm"
                type="button"
                variant="default"
                onClick={(e) => e.preventDefault()}
              >
                배포
              </Button>
              <Button
                aria-disabled="true"
                className="w-4 rounded-l-none border-l border-current/20 px-0 opacity-50 cursor-not-allowed"
                size="sm"
                type="button"
                variant="default"
                onClick={(e) => e.preventDefault()}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{disabledReason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
