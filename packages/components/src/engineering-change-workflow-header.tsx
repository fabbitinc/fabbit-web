import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { UserAvatar } from "@fabbit/ui";
import { MemberPickerSection } from "./member-picker-section";
import type {
  EngineeringChangeWorkflowAssignee,
  EngineeringChangeWorkflowData,
  EngineeringChangeWorkflowStage,
  EngineeringChangeWorkflowStageType,
} from "./engineering-change-workflow-section";

export interface EngineeringChangeWorkflowHeaderStagePicker {
  availableMembers: { id: string; name: string; email: string }[];
  selectedIds: string[];
  onSync: (userIds: string[]) => void;
  onRequest: () => void;
  onSearchChange: (search: string) => void;
  isSearching?: boolean;
  isUpdating?: boolean;
}

export interface EngineeringChangeWorkflowHeaderProps {
  workflow: EngineeringChangeWorkflowData;
  stagePickers?: Partial<Record<EngineeringChangeWorkflowStageType, EngineeringChangeWorkflowHeaderStagePicker>>;
}

const STAGE_PICKER_LABELS: Record<EngineeringChangeWorkflowStageType, { label: string; applyLabel: string }> = {
  REVIEW: { label: "검토자", applyLabel: "검토자 적용" },
  APPROVAL: { label: "승인자", applyLabel: "승인자 적용" },
  RELEASE: { label: "배포자", applyLabel: "배포자 적용" },
};

function formatActionTime(actedAt?: string | null) {
  if (!actedAt) {
    return "대기";
  }

  return new Date(actedAt).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getStageStateLabel(stage: EngineeringChangeWorkflowStage) {
  if (stage.status === "completed") {
    return "완료";
  }

  if (stage.status === "active") {
    return "진행중";
  }

  return "대기";
}

function getAssigneeStateLabel(assignee: EngineeringChangeWorkflowAssignee) {
  if (assignee.status === "APPROVED") {
    return "완료";
  }

  if (assignee.status === "REJECTED") {
    return "반려";
  }

  return "대기";
}

function getStageCardClassName(stage: EngineeringChangeWorkflowStage) {
  const base = "rounded-xl border bg-card";

  if (stage.status === "active") {
    return `${base} border-foreground/25 bg-muted/20`;
  }

  return base;
}

function WideStepRail({
  stages,
  expanded,
  onToggle,
}: {
  stages: EngineeringChangeWorkflowStage[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const currentIndex = stages.findIndex((stage) => stage.status === "active");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="cursor-pointer rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-0">
            {stages.map((stage, index) => {
              const isCompleted = currentIndex >= 0 ? index < currentIndex : stage.status === "completed";
              const isCurrent = currentIndex >= 0 ? index === currentIndex : stage.status === "active";

              return (
                <div key={stage.id} className="flex min-w-0 flex-1 items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                            ? "border-primary bg-background text-primary"
                            : "border-muted-foreground/30 bg-background text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-medium ${
                          isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {stage.label}
                      </p>
                      {stage.description ? (
                        <p className="truncate text-[11px] text-muted-foreground">{stage.description}</p>
                      ) : null}
                    </div>
                  </div>

                  {index < stages.length - 1 ? (
                    <div className="mx-4 h-px flex-1 bg-muted-foreground/30">
                      <div className={`h-full ${isCompleted ? "bg-primary" : "bg-transparent"}`} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function AssigneeRow({ assignee }: { assignee: EngineeringChangeWorkflowAssignee }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <UserAvatar
        name={assignee.name}
        imageUrl={assignee.profileImageUrl}
        className="h-7 w-7 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-foreground">{assignee.name}</span>
          <span className="text-[11px] text-muted-foreground">{getAssigneeStateLabel(assignee)}</span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{assignee.subtitle ?? "역할 미지정"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-medium text-foreground">{formatActionTime(assignee.actedAt)}</p>
        <p className="text-[10px] text-muted-foreground">{assignee.actedAt ? "처리시간" : "담당 대기"}</p>
      </div>
    </div>
  );
}

function ShiftBoardBody({
  stages,
  stagePickers,
}: {
  stages: EngineeringChangeWorkflowStage[];
  stagePickers?: EngineeringChangeWorkflowHeaderProps["stagePickers"];
}) {
  return (
    <div className="grid gap-3">
      {stages.map((stage) => {
        const picker = stagePickers?.[stage.type];

        return (
          <div key={stage.id} className={getStageCardClassName(stage)}>
            <div className="grid gap-0 xl:grid-cols-[180px_1fr]">
              <div className="border-b px-4 py-4 xl:border-b-0 xl:border-r">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{getStageStateLabel(stage)}</p>
                  </div>
                  {picker ? (
                    <div className="xl:hidden">
                      <MemberPickerSection
                        label=""
                        applyLabel={STAGE_PICKER_LABELS[stage.type].applyLabel}
                        availableMembers={picker.availableMembers}
                        selectedIds={picker.selectedIds}
                        displayItems={[]}
                        onSync={picker.onSync}
                        onRequestMembers={picker.onRequest}
                        onSearchChange={picker.onSearchChange}
                        isSearching={picker.isSearching}
                        isUpdating={picker.isUpdating}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="px-4 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {stage.assignees.length > 0 ? (
                      stage.assignees.map((assignee, index) => (
                        <div key={assignee.id} className={index > 0 ? "border-t" : ""}>
                          <AssigneeRow assignee={assignee} />
                        </div>
                      ))
                    ) : (
                      <p className="py-3 text-xs text-muted-foreground">담당자가 아직 지정되지 않았습니다.</p>
                    )}
                  </div>
                  {picker ? (
                    <div className="hidden shrink-0 pt-2 xl:block">
                      <MemberPickerSection
                        label=""
                        applyLabel={STAGE_PICKER_LABELS[stage.type].applyLabel}
                        availableMembers={picker.availableMembers}
                        selectedIds={picker.selectedIds}
                        displayItems={[]}
                        onSync={picker.onSync}
                        onRequestMembers={picker.onRequest}
                        onSearchChange={picker.onSearchChange}
                        isSearching={picker.isSearching}
                        isUpdating={picker.isUpdating}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EngineeringChangeWorkflowHeader({ workflow, stagePickers }: EngineeringChangeWorkflowHeaderProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="space-y-3">
      <WideStepRail
        stages={workflow.stages}
        expanded={expanded}
        onToggle={() => setExpanded((previous) => !previous)}
      />
      {expanded ? <ShiftBoardBody stages={workflow.stages} stagePickers={stagePickers} /> : null}
    </div>
  );
}
