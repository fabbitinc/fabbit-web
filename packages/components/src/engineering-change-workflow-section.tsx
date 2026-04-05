import { Badge, UserAvatar, WorkflowStepper, type WorkflowStep } from "@fabbit/ui";

export type EngineeringChangeWorkflowStageStatus = "completed" | "active" | "pending";
export type EngineeringChangeWorkflowAssigneeStatus = "PENDING" | "APPROVED" | "CHANGES_REQUESTED" | "REJECTED" | "CANCELED";
export type EngineeringChangeWorkflowAssigneeType = "USER" | "TEAM";
export type EngineeringChangeWorkflowStageType = "REVIEW" | "APPROVAL" | "RELEASE";

export interface EngineeringChangeWorkflowAssignee {
  id: string;
  name: string;
  type: EngineeringChangeWorkflowAssigneeType;
  status: EngineeringChangeWorkflowAssigneeStatus;
  profileImageUrl?: string | null;
  actedAt?: string | null;
  actedByName?: string | null;
  subtitle?: string | null;
}

export interface EngineeringChangeWorkflowStage {
  id: string;
  label: string;
  type: EngineeringChangeWorkflowStageType;
  status: EngineeringChangeWorkflowStageStatus;
  description?: string;
  assignees: EngineeringChangeWorkflowAssignee[];
}

export interface EngineeringChangeWorkflowData {
  stages: EngineeringChangeWorkflowStage[];
}

export interface EngineeringChangeWorkflowSectionProps {
  workflow: EngineeringChangeWorkflowData;
}

function getAssigneeStatusLabel(status: EngineeringChangeWorkflowAssigneeStatus) {
  if (status === "APPROVED") {
    return "완료";
  }

  if (status === "REJECTED") {
    return "반려";
  }

  if (status === "CHANGES_REQUESTED") {
    return "수정 요청";
  }

  if (status === "CANCELED") {
    return "취소됨";
  }

  return "대기";
}

function getAssigneeStatusClassName(status: EngineeringChangeWorkflowAssigneeStatus) {
  if (status === "APPROVED") {
    return "text-emerald-600";
  }

  if (status === "REJECTED") {
    return "text-destructive";
  }

  if (status === "CHANGES_REQUESTED") {
    return "text-amber-600";
  }

  if (status === "CANCELED") {
    return "text-muted-foreground/50";
  }

  return "text-muted-foreground";
}

function getStageTypeLabel(type: EngineeringChangeWorkflowStageType) {
  if (type === "APPROVAL") {
    return "승인";
  }

  if (type === "RELEASE") {
    return "릴리즈";
  }

  return "검토";
}

function formatActionTime(actedAt?: string | null) {
  if (!actedAt) {
    return null;
  }

  return new Date(actedAt).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getWorkflowSummary(workflow: EngineeringChangeWorkflowData) {
  const { stages } = workflow;
  const completedCount = stages.filter((stage) => stage.status === "completed").length;
  const activeStage = stages.find((stage) => stage.status === "active") ?? null;
  const currentStage = activeStage ?? stages[stages.length - 1] ?? null;
  const pendingAssignees =
    currentStage?.assignees.filter((assignee) => assignee.status === "PENDING").map((assignee) => assignee.name) ?? [];

  return {
    currentStageLabel: currentStage?.label ?? "미정",
    nextAssigneeLabel:
      pendingAssignees.length > 0
        ? pendingAssignees.join(", ")
        : currentStage?.status === "completed"
          ? "모든 단계 완료"
          : "담당자 미지정",
    progressLabel: `${Math.min(completedCount + (activeStage ? 1 : 0), stages.length)}/${stages.length} 단계`,
  };
}

function WorkflowAssigneeRow({ assignee }: { assignee: EngineeringChangeWorkflowAssignee }) {
  const actionTimeLabel = formatActionTime(assignee.actedAt);

  return (
    <div className="flex items-start gap-2 rounded-md border bg-background px-2.5 py-2">
      <UserAvatar
        name={assignee.name}
        imageUrl={assignee.profileImageUrl}
        className="mt-0.5 h-6 w-6 shrink-0 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-foreground">{assignee.name}</span>
          <span className={`shrink-0 text-[11px] font-medium ${getAssigneeStatusClassName(assignee.status)}`}>
            {getAssigneeStatusLabel(assignee.status)}
          </span>
        </div>
        {assignee.subtitle ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{assignee.subtitle}</p>
        ) : null}
        {actionTimeLabel ? (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {assignee.actedByName ? `${assignee.actedByName} 처리` : "처리 완료"} · {actionTimeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function EngineeringChangeWorkflowSection({
  workflow,
}: EngineeringChangeWorkflowSectionProps) {
  const summary = getWorkflowSummary(workflow);

  const steps: WorkflowStep[] = workflow.stages.map((stage) => ({
    id: stage.id,
    label: stage.label,
    status: stage.status,
    children: (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {getStageTypeLabel(stage.type)}
          </Badge>
          {stage.description ? <span className="text-xs text-muted-foreground">{stage.description}</span> : null}
        </div>
        {stage.assignees.length > 0 ? (
          <div className="space-y-1.5">
            {stage.assignees.map((assignee) => (
              <WorkflowAssigneeRow key={assignee.id} assignee={assignee} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">담당자가 아직 지정되지 않았습니다.</p>
        )}
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">워크플로</h3>
        <span className="text-[11px] font-medium text-muted-foreground">{summary.progressLabel}</span>
      </div>

      <div className="mt-2 rounded-lg border bg-muted/30 px-3 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground">현재 단계</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{summary.currentStageLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">다음 처리: {summary.nextAssigneeLabel}</p>
      </div>

      <div className="mt-3">
        <WorkflowStepper steps={steps} />
      </div>
    </div>
  );
}
