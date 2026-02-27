import { Flag, CheckCircle2, CircleDot, Circle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Milestone } from "../../types/dashboard.types";
import { useMilestoneWarning, getDaysUntilText } from "../../hooks/useMilestoneWarning";

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onEdit?: () => void;
  onOpenGantt?: () => void;
}

export function MilestoneTimeline({ milestones, onEdit, onOpenGantt }: MilestoneTimelineProps) {
  const milestonesWithWarning = useMilestoneWarning(milestones);

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-[#8b5cf6]" />
          <h3 className="font-semibold text-[#0f172a]">마일스톤</h3>
        </div>
        <div className="flex items-center gap-2">
          {onOpenGantt && (
            <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]" onClick={onOpenGantt}>
              전체 일정 보기
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" className="text-xs text-[#64748b]" onClick={onEdit}>
              편집
            </Button>
          )}
        </div>
      </div>

      <div className="relative mt-5">
        {/* Timeline Line */}
        <div className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-[#e2e8f0]" />

        <div className="space-y-4">
          {milestonesWithWarning.map(({ milestone, daysUntil, isWarning, isOverdue }) => {
            const showWarningIcon = (isWarning || isOverdue) && milestone.status !== "completed";

            return (
              <div key={milestone.id} className="relative flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                    milestone.status === "completed" && "border-[#22c55e] bg-[#22c55e]",
                    milestone.status === "current" && !isWarning && !isOverdue && "border-[#3b82f6] bg-white",
                    milestone.status === "current" && isWarning && "border-[#f59e0b] bg-white",
                    milestone.status === "current" && isOverdue && "border-[#ef4444] bg-white",
                    milestone.status === "upcoming" && "border-[#e2e8f0] bg-white"
                  )}
                >
                  {milestone.status === "completed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  ) : milestone.status === "current" ? (
                    <CircleDot
                      className={cn(
                        "h-3.5 w-3.5",
                        isOverdue && "text-[#ef4444]",
                        isWarning && !isOverdue && "text-[#f59e0b]",
                        !isWarning && !isOverdue && "text-[#3b82f6]"
                      )}
                    />
                  ) : (
                    <Circle className="h-3 w-3 text-[#cbd5e1]" />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          milestone.status === "completed" && "text-[#64748b]",
                          milestone.status === "current" && "text-[#0f172a]",
                          milestone.status === "upcoming" && "text-[#94a3b8]"
                        )}
                      >
                        {milestone.name}
                      </p>
                      {showWarningIcon && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle
                              className={cn("h-4 w-4", isOverdue ? "text-[#ef4444]" : "text-[#f59e0b]")}
                            />
                          </TooltipTrigger>
                          <TooltipContent>{getDaysUntilText(daysUntil)}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        milestone.status === "current" && isWarning && "font-medium text-[#f59e0b]",
                        milestone.status === "current" && isOverdue && "font-medium text-[#ef4444]",
                        milestone.status === "current" && !isWarning && !isOverdue && "font-medium text-[#3b82f6]",
                        milestone.status !== "current" && "text-[#94a3b8]"
                      )}
                    >
                      {milestone.date}
                    </span>
                  </div>

                  {milestone.status === "current" && (
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        isOverdue && "bg-[#ef4444]/10 text-[#ef4444]",
                        isWarning && !isOverdue && "bg-[#f59e0b]/10 text-[#f59e0b]",
                        !isWarning && !isOverdue && "bg-[#3b82f6]/10 text-[#3b82f6]"
                      )}
                    >
                      {isOverdue ? "기한 초과" : isWarning ? `${daysUntil}일 남음` : "현재 단계"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
