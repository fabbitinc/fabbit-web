import {
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Clock,
  FileCheck,
  FilePen,
  FileX,
  type LucideIcon,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge, cn } from "@fabbit/ui";

interface WorkItemStatusConfig {
  badgeClassName: string;
  icon: LucideIcon;
  label: string;
  toneClassName: string;
}

const ISSUE_STATUS_CONFIG: Record<"OPEN" | "CLOSED", WorkItemStatusConfig> = {
  OPEN: {
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-600",
    icon: AlertCircle,
    label: "열림",
    toneClassName: "text-emerald-600",
  },
  CLOSED: {
    badgeClassName: "border-purple-200 bg-purple-50 text-purple-600",
    icon: CheckCircle2,
    label: "닫힘",
    toneClassName: "text-purple-600",
  },
};

const EC_STATUS_CONFIG: Record<string, WorkItemStatusConfig> = {
  DRAFT: {
    badgeClassName: "border-gray-200 bg-gray-50 text-gray-500",
    icon: FilePen,
    label: "초안",
    toneClassName: "text-gray-500",
  },
  REVIEW_PENDING: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
    icon: Clock,
    label: "검토중",
    toneClassName: "text-amber-600",
  },
  APPROVAL_PENDING: {
    badgeClassName: "border-blue-200 bg-blue-50 text-blue-600",
    icon: ShieldCheck,
    label: "승인중",
    toneClassName: "text-blue-600",
  },
  RELEASE_PENDING: {
    badgeClassName: "border-indigo-200 bg-indigo-50 text-indigo-600",
    icon: CircleDot,
    label: "릴리즈 대기",
    toneClassName: "text-indigo-600",
  },
  RELEASED: {
    badgeClassName: "border-purple-200 bg-purple-50 text-purple-600",
    icon: FileCheck,
    label: "반영 완료",
    toneClassName: "text-purple-600",
  },
  CANCELED: {
    badgeClassName: "border-red-200 bg-red-50 text-red-500",
    icon: XCircle,
    label: "취소",
    toneClassName: "text-red-500",
  },
  // 이전 상태값 호환
  SUBMITTED: {
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-600",
    icon: Clock,
    label: "검토중",
    toneClassName: "text-amber-600",
  },
  MERGED: {
    badgeClassName: "border-purple-200 bg-purple-50 text-purple-600",
    icon: FileCheck,
    label: "반영 완료",
    toneClassName: "text-purple-600",
  },
  CLOSED: {
    badgeClassName: "border-red-200 bg-red-50 text-red-500",
    icon: XCircle,
    label: "취소",
    toneClassName: "text-red-500",
  },
};

function renderStatusIcon(config: WorkItemStatusConfig, className?: string) {
  const Icon = config.icon;

  return <Icon className={cn(config.toneClassName, className)} />;
}

export function getIssueStatusConfig(state: string): WorkItemStatusConfig {
  return state.toUpperCase() === "CLOSED"
    ? ISSUE_STATUS_CONFIG.CLOSED
    : ISSUE_STATUS_CONFIG.OPEN;
}

export function getEngineeringChangeStatusConfig(state: string): WorkItemStatusConfig {
  const normalized = state.toUpperCase();

  return EC_STATUS_CONFIG[normalized] ?? EC_STATUS_CONFIG.DRAFT;
}

export function IssueStatusIcon({
  className = "h-4 w-4",
  state,
}: {
  className?: string;
  state: string;
}) {
  return renderStatusIcon(getIssueStatusConfig(state), className);
}

export function EngineeringChangeStatusIcon({
  className = "h-4 w-4",
  state,
}: {
  className?: string;
  state: string;
}) {
  return renderStatusIcon(getEngineeringChangeStatusConfig(state), className);
}

export function IssueStatusBadge({
  className,
  state,
}: {
  className?: string;
  state: string;
}) {
  const config = getIssueStatusConfig(state);

  return (
    <Badge variant="outline" className={cn(config.badgeClassName, className)}>
      <IssueStatusIcon state={state} className="h-4 w-4" />
      {config.label}
    </Badge>
  );
}

export function EngineeringChangeStatusBadge({
  className,
  state,
}: {
  className?: string;
  state: string;
}) {
  const config = getEngineeringChangeStatusConfig(state);

  return (
    <Badge variant="outline" className={cn(config.badgeClassName, className)}>
      <EngineeringChangeStatusIcon state={state} className="h-4 w-4" />
      {config.label}
    </Badge>
  );
}
