import { useState, useMemo, useRef, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  MoreHorizontal,
  Trash2,
  Plus,
  Search,
  LinkIcon,
  Unlink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CircleDot,
  FileCheck,
  Package,
  Activity,
  LayoutDashboard,
  Filter,
  AlertCircle,
  FilePen,
  FileX,
  Paperclip,
  MessageSquare,
  Settings,
  Loader2,
  UserPlus,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LabelBadge } from "@fabbit/ui";
import { TruncatedNames } from "./ChangeRequestDetailPage";
import { useParts, useProject, useLookupParts } from "@/api/hooks";
import { useProjectActivities } from "@/api/hooks/useActivities";
import type {
  IssueDto,
  ChangeDto,
  ProjectDto,
  ActivityDto,
  ActivityScope,
  TimelineUserDto,
  UserSummaryDto,
} from "@/api/types";
import {
  useCreateIssueComment,
  useCreateProjectIssue,
  useCloseIssue,
  useReopenIssue,
  useIssueTimeline,
  useProjectIssue,
  useProjectIssues,
  useIssueLabels,
  useSyncIssueAssignees,
  useSyncIssueLabels,
  useSyncIssueParts,
  useUploadIssueFiles,
  useDeleteIssueFile,
  useUpdateIssue,
  useUpdateIssueComment,
} from "@/api/hooks/useIssues";
import {
  useProjectChanges,
  useProjectChange,
  useChangeTimeline,
  useCreateProjectChange,
  useSyncChangeAssignees,
  useSyncChangeReviewers,
  useChangeLabels,
  useSyncChangeLabels,
  useSyncChangeParts,
  useUploadChangeFiles,
  useDeleteChangeFile,
  useCreateChangeComment,
  useLinkChangeIssues,
  useUnlinkChangeIssues,
  useUpdateChange,
  useUpdateChangeComment,
  useCloseChange,
  useMergeChange,
  useOpenChange,
} from "@/api/hooks/useChanges";
import { linkPartsToProject, unlinkPartsFromProject } from "@/api/project";
import {
  useProjectMembers,
  useSearchProjectParts,
} from "@/api/hooks/useProjects";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ChangeRequest,
  type ChangeRequestType,
  type TimelineEvent,
  type TimelineAuthor,
  MOCK_ISSUES,
  MOCK_PRS,
} from "./changeRequestMock";
import type { IssueTimelineItemDto } from "@/api/types";
import { ChangeRequestDetail } from "./ChangeRequestDetailPage";
import { ProjectSettingsView } from "./ProjectSettingsView";
import { PartsTableContent } from "@/components/parts/PartsTableContent";

// ============================================================
// Mock 데이터
// ============================================================

// --- 부품 ---

interface MockProjectPart {
  id: string;
  part_number: string;
  name: string | null;
  category: string | null;
}

// --- 활동 로그 ---

// scope: 아이콘 + 범위 라벨 (고정)
const SCOPE_ICON: Record<string, { icon: React.ElementType; label: string }> = {
  issue: { icon: AlertCircle, label: "이슈" },
  cr: { icon: FilePen, label: "변경 요청" },
  part: { icon: Package, label: "부품" },
  assignee: { icon: UserPlus, label: "담당자" },
  reviewer: { icon: UserPlus, label: "검토자" },
  label: { icon: Tag, label: "라벨" },
  file: { icon: Paperclip, label: "파일" },
};
const DEFAULT_SCOPE = { icon: CircleDot, label: "활동" };

// state: 상태 라벨 + 색상
interface ActivityConfig {
  scope: string;
  state: string;
  stateClass: string; // 상태 텍스트 색상
  badgeClass: string; // scope 뱃지 배경/테두리
}

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  issue_created: {
    scope: "issue",
    state: "열림",
    stateClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  issue_closed: {
    scope: "issue",
    state: "닫힘",
    stateClass: "text-red-600 dark:text-red-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  issue_reopened: {
    scope: "issue",
    state: "다시 열림",
    stateClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  issue_state_changed: {
    scope: "issue",
    state: "상태 변경",
    stateClass: "text-purple-600 dark:text-purple-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  cr_created: {
    scope: "cr",
    state: "열림",
    stateClass: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  cr_merged: {
    scope: "cr",
    state: "반영",
    stateClass: "text-purple-600 dark:text-purple-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  cr_state_changed: {
    scope: "cr",
    state: "상태 변경",
    stateClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  cr_issue_linked: {
    scope: "cr",
    state: "이슈 연결",
    stateClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  cr_issue_unlinked: {
    scope: "cr",
    state: "이슈 해제",
    stateClass: "text-muted-foreground",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  part_added: {
    scope: "part",
    state: "추가",
    stateClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  part_removed: {
    scope: "part",
    state: "제거",
    stateClass: "text-muted-foreground",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  part_changed: {
    scope: "part",
    state: "변경",
    stateClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  assignee_changed: {
    scope: "assignee",
    state: "변경",
    stateClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  reviewer_changed: {
    scope: "reviewer",
    state: "변경",
    stateClass: "text-amber-600 dark:text-amber-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  label_changed: {
    scope: "label",
    state: "변경",
    stateClass: "text-purple-600 dark:text-purple-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  file_attached: {
    scope: "file",
    state: "추가",
    stateClass: "text-blue-600 dark:text-blue-400",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
  file_detached: {
    scope: "file",
    state: "제거",
    stateClass: "text-muted-foreground",
    badgeClass: "border-border bg-muted/50 text-muted-foreground",
  },
};

const DEFAULT_ACTIVITY: ActivityConfig = {
  scope: "",
  state: "활동",
  stateClass: "text-muted-foreground",
  badgeClass: "border-border bg-muted/50 text-muted-foreground",
};

// action + detail → 요약 텍스트
function getActivitySummary(
  action: string,
  detail: Record<string, unknown> | null,
): React.ReactNode {
  if (!detail) return ACTIVITY_CONFIG[action]?.state ?? action;

  switch (action) {
    case "issue_created":
    case "issue_closed":
    case "issue_reopened":
      return detail.title
        ? `#${detail.number} ${detail.title}`
        : (ACTIVITY_CONFIG[action]?.state ?? action);
    case "issue_state_changed":
    case "cr_state_changed":
      return detail.from && detail.to
        ? `${detail.from} → ${detail.to}`
        : (ACTIVITY_CONFIG[action]?.state ?? action);
    case "cr_created":
      return detail.title ? `#${detail.number} ${detail.title}` : "";
    case "cr_merged":
      return detail.title ? `#${detail.number} ${detail.title}` : "변경 요청";
    case "part_added":
    case "part_removed": {
      const parts =
        (detail.parts as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      if (parts.length === 0) return "부품";
      return <TruncatedNames items={parts.map((p) => p.part_number)} />;
    }
    case "part_changed": {
      const added =
        (detail.added as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      const removed =
        (detail.removed as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      if (added.length === 0 && removed.length === 0) return "부품 변경";
      return (
        <>
          {added.length > 0 && (
            <TruncatedNames
              items={added.map((p) => p.part_number)}
              suffix="추가"
            />
          )}
          {added.length > 0 && removed.length > 0 && ", "}
          {removed.length > 0 && (
            <TruncatedNames
              items={removed.map((p) => p.part_number)}
              suffix="제거"
            />
          )}
        </>
      );
    }
    case "assignee_changed":
    case "reviewer_changed": {
      const addedUsers =
        (detail.added as { user_id: string; name: string }[] | undefined) ?? [];
      const removedUsers =
        (detail.removed as { user_id: string; name: string }[] | undefined) ??
        [];
      const segments: string[] = [];
      if (addedUsers.length > 0)
        segments.push(`${addedUsers.map((u) => u.name).join(", ")} 추가`);
      if (removedUsers.length > 0)
        segments.push(`${removedUsers.map((u) => u.name).join(", ")} 제거`);
      return segments.join(", ") || (ACTIVITY_CONFIG[action]?.state ?? action);
    }
    case "label_changed": {
      const addedLabels =
        (detail.added as { name: string }[] | undefined) ?? [];
      const removedLabels =
        (detail.removed as { name: string }[] | undefined) ?? [];
      if (addedLabels.length === 0 && removedLabels.length === 0)
        return "라벨 변경";
      return (
        <>
          {addedLabels.length > 0 && (
            <TruncatedNames
              items={addedLabels.map((l) => l.name)}
              suffix="추가"
            />
          )}
          {addedLabels.length > 0 && removedLabels.length > 0 && ", "}
          {removedLabels.length > 0 && (
            <TruncatedNames
              items={removedLabels.map((l) => l.name)}
              suffix="제거"
            />
          )}
        </>
      );
    }
    case "file_attached": {
      const files =
        (detail.files as
          | { file_id: string; original_name: string }[]
          | undefined) ?? [];
      if (files.length === 0) return "파일 추가";
      return <TruncatedNames items={files.map((f) => f.original_name)} />;
    }
    case "file_detached": {
      const fileName = detail.file_name as string | undefined;
      return fileName ?? "파일 제거";
    }
    case "cr_issue_linked": {
      const issues =
        (detail.linked_issues as
          | { issue_id: string; number: number; title: string }[]
          | undefined) ?? [];
      const crNumber = detail.cr_number as number | undefined;
      const crTitle = detail.cr_title as string | undefined;
      const linkedItems =
        issues.length > 0
          ? issues.map((i) => `#${i.number} ${i.title}`)
          : crNumber != null
            ? [`#${crNumber} ${crTitle ?? ""}`]
            : [];
      if (linkedItems.length === 0) return "이슈 연결";
      return <TruncatedNames items={linkedItems} />;
    }
    case "cr_issue_unlinked": {
      const issues =
        (detail.unlinked_issues as
          | { issue_id: string; number: number; title: string }[]
          | undefined) ?? [];
      const crNumber = detail.cr_number as number | undefined;
      const crTitle = detail.cr_title as string | undefined;
      const unlinkedItems =
        issues.length > 0
          ? issues.map((i) => `#${i.number} ${i.title}`)
          : crNumber != null
            ? [`#${crNumber} ${crTitle ?? ""}`]
            : [];
      if (unlinkedItems.length === 0) return "이슈 해제";
      return <TruncatedNames items={unlinkedItems} />;
    }
    default:
      return ACTIVITY_CONFIG[action]?.state ?? action;
  }
}

const SCOPE_FILTERS: { label: string; value: ActivityScope | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "이슈", value: "issue" },
  { label: "변경 요청", value: "cr" },
  { label: "부품", value: "part" },
  { label: "담당자", value: "assignee" },
  { label: "검토자", value: "reviewer" },
  { label: "라벨", value: "label" },
];

// ============================================================
// 헬퍼
// ============================================================

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) +
    " " +
    d.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatShortDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getInitials(name: string): string {
  return name.slice(0, 1);
}

// ============================================================
// 헤더 (GitHub 스타일 — 컴팩트)
// ============================================================

function ProjectHeader({
  project,
  onEdit,
  onDelete,
}: {
  project: Pick<ProjectDto, "name" | "description">;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-0">
      {/* 브레드크럼 + 프로젝트 이름 + 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/projects")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            프로젝트
          </button>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="font-semibold text-foreground">{project.name}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            편집
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                프로젝트 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 설명 */}
      {project.description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}
    </div>
  );
}

// ============================================================
// 편집 다이얼로그
// ============================================================

function EditProjectDialog({
  open,
  onOpenChange,
  defaultName,
  defaultDescription,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  defaultDescription: string;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);

  function handleOpenChange(v: boolean) {
    if (v) {
      setName(defaultName);
      setDescription(defaultDescription);
    }
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 편집</DialogTitle>
          <DialogDescription>프로젝트 정보를 수정합니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">프로젝트 이름</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">설명 (선택)</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 개요 탭
// ============================================================

function OverviewTab({
  parts,
  projectId,
}: {
  parts: MockProjectPart[];
  projectId: string;
}) {
  const openIssues = MOCK_ISSUES.filter((c) => c.status === "open").length;
  const openPRs = MOCK_PRS.filter((c) => c.status === "open").length;
  const mergedPRs = MOCK_PRS.filter((c) => c.status === "merged").length;
  const { data: activitiesData } = useProjectActivities(projectId, {
    limit: 3,
  });
  const recentActivities = activitiesData?.pages[0]?.items ?? [];
  const activityUsers = activitiesData?.pages[0]?.users ?? {};

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">연결된 부품</p>
              <p className="text-2xl font-bold text-foreground">
                {parts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">열린 이슈</p>
              <p className="text-2xl font-bold text-foreground">{openIssues}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <FilePen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">열린 변경 요청</p>
              <p className="text-2xl font-bold text-foreground">{openPRs}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">반영 완료</p>
              <p className="text-2xl font-bold text-foreground">{mergedPRs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 부품 + 최근 활동 2열 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 최근 부품 */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 부품</h3>
            <span className="text-xs text-muted-foreground">
              {parts.length}건
            </span>
          </div>
          {parts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              연결된 부품이 없습니다
            </div>
          ) : (
            <div className="divide-y">
              {parts.slice(0, 5).map((part) => (
                <div
                  key={part.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <span className="font-mono text-xs font-medium text-primary">
                    {part.part_number}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {part.name ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {part.category}
                  </span>
                </div>
              ))}
              {parts.length > 5 && (
                <div className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                  외 {parts.length - 5}건
                </div>
              )}
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 활동</h3>
          </div>
          <div className="px-4 py-2">
            {recentActivities.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                최근 활동이 없습니다
              </div>
            ) : (
              recentActivities.map((activity) => {
                const config =
                  ACTIVITY_CONFIG[activity.action] ?? DEFAULT_ACTIVITY;
                const scopeInfo = SCOPE_ICON[config.scope] ?? DEFAULT_SCOPE;
                const ScopeIcon = scopeInfo.icon;
                const user = activityUsers[activity.actorId];
                return (
                  <div key={activity.id} className="flex gap-3 py-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <ScopeIcon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground/80">
                        <span className={`font-medium ${config.stateClass}`}>
                          {config.state}
                        </span>
                        {" · "}
                        {getActivitySummary(activity.action, activity.detail)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {user?.fullName ?? activity.actorId.slice(0, 8)} ·{" "}
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 부품 연결 다이얼로그
// ============================================================

function AddPartDialog({
  open,
  onOpenChange,
  projectId,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onAdd: (ids: string[]) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const { data: lookupResponse, isLoading } = useLookupParts(
    {
      project_id: projectId,
      search: debouncedSearch || undefined,
      exclude_linked: true,
      limit: 15,
    },
    { enabled: open },
  );

  const available = lookupResponse?.items ?? [];

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    await onAdd([...selectedIds]);
    setSelectedIds(new Set());
    setSearch("");
    onOpenChange(false);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setSelectedIds(new Set());
      setSearch("");
      setDebouncedSearch("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>부품 연결</DialogTitle>
          <DialogDescription>
            프로젝트에 연결할 부품을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="품번, 품명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size}건 선택됨</Badge>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              선택 해제
            </button>
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                {search
                  ? "검색 결과가 없습니다"
                  : "연결 가능한 부품이 없습니다"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {available.map((part) => (
                <label
                  key={part.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedIds.has(part.id)}
                    onCheckedChange={() => toggleSelect(part.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-primary">
                        {part.part_number}
                      </span>
                    </div>
                    {part.name && (
                      <p className="truncate text-sm text-foreground">
                        {part.name}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            취소
          </Button>
          <Button onClick={handleAdd} disabled={selectedIds.size === 0}>
            연결 ({selectedIds.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 변경 요청 탭 (GitHub Issues/PR 스타일)
// ============================================================

function CRStatusIcon({ cr }: { cr: ChangeRequest }) {
  if (cr.type === "pr" && cr.status === "merged") {
    return (
      <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
    );
  }
  if (cr.type === "pr") {
    return cr.status === "open" ? (
      <FilePen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <FileX className="h-4 w-4 text-red-500 dark:text-red-400" />
    );
  }
  // issue
  return cr.status === "open" ? (
    <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatShortDate(iso);
}

function toIssueStatus(state: string): "open" | "closed" {
  return state.toLowerCase() === "open" ? "open" : "closed";
}

function toIssueAuthor(issue: IssueDto): string {
  if (issue.createdBy) return issue.createdBy.fullName;
  return "삭제된 사용자";
}

interface TimelineSource {
  createdBy: UserSummaryDto | null;
  assignees: { id: string; fullName: string }[];
}

function toDisplayActor(
  id: string | null | undefined,
  users: Record<string, TimelineUserDto>,
  source: TimelineSource,
): TimelineAuthor {
  if (!id) return { name: "삭제된 사용자" };

  const user = users[id];
  if (user)
    return { name: user.fullName, profileImageUrl: user.profileImageUrl };

  if (source.createdBy && id === source.createdBy.id) {
    return {
      name: source.createdBy.fullName,
      profileImageUrl: source.createdBy.profileImageUrl,
    };
  }

  const assignee = source.assignees.find((item) => item.id === id);
  if (assignee) return { name: assignee.fullName };

  return { name: id.slice(0, 8) };
}

/** 백엔드 type 문자열을 프론트 "issue" | "change_request"로 변환 */
function toIssueType(raw?: string): "issue" | "change_request" | undefined {
  if (!raw) return undefined;
  return raw.toUpperCase() === "CHANGE_REQUEST" ? "change_request" : "issue";
}

function toTimelineEvents(
  items: IssueTimelineItemDto[],
  users: Record<string, TimelineUserDto>,
  source: TimelineSource,
): TimelineEvent[] {
  return items.map((item) => {
    if (item.type === "comment") {
      return {
        id: item.id,
        type: "comment",
        author: toDisplayActor(item.authorId, users, source),
        authorId: item.authorId,
        createdAt: item.createdAt,
        content: item.body,
        isModified: item.isModified ?? false,
      };
    }

    const action = item.action.toLowerCase();
    const detail = item.detail ?? {};
    const author = toDisplayActor(item.actorId, users, source);

    // 이슈/CR 생성
    if (action === "issue_created") {
      return {
        id: item.id,
        type: "issue_created",
        author,
        createdAt: item.createdAt,
        issueNumber: detail.number as number | undefined,
        issueTitle: detail.title as string | undefined,
      };
    }

    // 이슈 닫힘
    if (action === "issue_closed") {
      return {
        id: item.id,
        type: "status_change",
        author,
        createdAt: item.createdAt,
        content: "closed",
      };
    }

    // 이슈 재오픈
    if (action === "issue_reopened") {
      return {
        id: item.id,
        type: "status_change",
        author,
        createdAt: item.createdAt,
        content: "open",
      };
    }

    // 이슈 상태 변경
    if (action === "issue_state_changed") {
      const to = (detail.to as string | undefined)?.toLowerCase();
      const isOpen = to === "open";
      return {
        id: item.id,
        type: "status_change",
        author,
        createdAt: item.createdAt,
        content: isOpen ? "open" : "closed",
      };
    }

    // CR 상태 변경 (DRAFT→OPEN, OPEN→CLOSED, OPEN→MERGED 등)
    if (action === "cr_state_changed") {
      const to = (detail.to as string | undefined)?.toLowerCase();
      if (to === "merged") {
        return {
          id: item.id,
          type: "cr_merged",
          author,
          createdAt: item.createdAt,
        };
      }
      return {
        id: item.id,
        type: "cr_state_changed",
        author,
        createdAt: item.createdAt,
        content: `${(detail.from as string) ?? ""} → ${(detail.to as string) ?? ""}`,
      };
    }

    // CR 생성
    if (action === "cr_created") {
      return {
        id: item.id,
        type: "cr_created",
        author,
        createdAt: item.createdAt,
        issueNumber: detail.number as number | undefined,
        issueTitle: detail.title as string | undefined,
      };
    }

    // CR 머지
    if (action === "cr_merged") {
      return {
        id: item.id,
        type: "cr_merged",
        author,
        createdAt: item.createdAt,
        issueNumber: detail.number as number | undefined,
        issueTitle: detail.title as string | undefined,
      };
    }

    // 부품 변경 (added/removed 배열 — 객체 { part_id, part_number })
    if (
      action === "part_changed" ||
      action === "part_added" ||
      action === "part_removed"
    ) {
      const added =
        (detail.added as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      const removed =
        (detail.removed as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      const parts =
        (detail.parts as
          | { part_id: string; part_number: string }[]
          | undefined) ?? [];
      const addedCount =
        added.length || (action === "part_added" ? parts.length : 0);
      const removedCount =
        removed.length || (action === "part_removed" ? parts.length : 0);
      const addedPartNumbers =
        added.length > 0
          ? added.map((p) => p.part_number)
          : action === "part_added" && parts.length > 0
            ? parts.map((p) => p.part_number)
            : undefined;
      const removedPartNumbers =
        removed.length > 0
          ? removed.map((p) => p.part_number)
          : action === "part_removed" && parts.length > 0
            ? parts.map((p) => p.part_number)
            : undefined;
      return {
        id: item.id,
        type: "part_added",
        author,
        createdAt: item.createdAt,
        addedPartCount: addedCount || undefined,
        removedPartCount: removedCount || undefined,
        addedPartNumbers,
        removedPartNumbers,
      };
    }

    // 라벨 변경 (added/removed 배열)
    if (action === "label_changed" || action === "labels_changed") {
      const added =
        (detail.added as { name: string; color: string }[] | undefined) ?? [];
      const removed =
        (detail.removed as { name: string; color: string }[] | undefined) ?? [];
      return {
        id: item.id,
        type: "labels_changed",
        author,
        createdAt: item.createdAt,
        addedLabels: added,
        removedLabels: removed,
      };
    }

    // 담당자 변경 (객체 { user_id, name })
    if (action === "assignee_changed") {
      const added =
        (detail.added as { user_id: string; name: string }[] | undefined) ?? [];
      const removed =
        (detail.removed as { user_id: string; name: string }[] | undefined) ??
        [];
      return {
        id: item.id,
        type: "assigned",
        author,
        createdAt: item.createdAt,
        addedNames: added.length > 0 ? added.map((u) => u.name) : undefined,
        removedNames:
          removed.length > 0 ? removed.map((u) => u.name) : undefined,
      };
    }

    // 검토자 변경 (객체 { user_id, name })
    if (action === "reviewer_changed") {
      const added =
        (detail.added as { user_id: string; name: string }[] | undefined) ?? [];
      const removed =
        (detail.removed as { user_id: string; name: string }[] | undefined) ??
        [];
      return {
        id: item.id,
        type: "reviewer_changed",
        author,
        createdAt: item.createdAt,
        addedNames: added.length > 0 ? added.map((u) => u.name) : undefined,
        removedNames:
          removed.length > 0 ? removed.map((u) => u.name) : undefined,
      };
    }

    // 파일 첨부 (객체 { file_id, original_name })
    if (action === "file_attached") {
      const files =
        (detail.files as
          | { file_id: string; original_name: string }[]
          | undefined) ?? [];
      return {
        id: item.id,
        type: "file_attached",
        author,
        createdAt: item.createdAt,
        fileCount: files.length,
        fileNames:
          files.length > 0 ? files.map((f) => f.original_name) : undefined,
      };
    }

    // 파일 제거
    if (action === "file_detached") {
      const fileName = detail.file_name as string | undefined;
      return {
        id: item.id,
        type: "file_detached",
        author,
        createdAt: item.createdAt,
        fileCount: 1,
        fileNames: fileName ? [fileName] : undefined,
      };
    }

    // CR 이슈 연결
    // CR 타임라인: { linked_issues: [{issue_id, number, title, type}] }
    // 이슈 타임라인: { cr_id, cr_number, cr_title }
    if (action === "cr_issue_linked") {
      const issues =
        (detail.linked_issues as
          | { issue_id: string; number: number; title: string; type?: string }[]
          | undefined) ?? [];
      const crNumber = detail.cr_number as number | undefined;
      const crTitle = detail.cr_title as string | undefined;
      const crType = detail.cr_type as string | undefined;
      const linkedItems =
        issues.length > 0
          ? issues.map((i) => ({
              number: i.number,
              title: i.title,
              type: toIssueType(i.type),
            }))
          : crNumber != null
            ? [
                {
                  number: crNumber,
                  title: crTitle ?? "",
                  type: toIssueType(crType),
                },
              ]
            : undefined;
      return {
        id: item.id,
        type: "cr_issue_linked",
        author,
        createdAt: item.createdAt,
        linkedIssueCount: linkedItems?.length ?? 0,
        linkedIssues: linkedItems,
      };
    }

    // CR 이슈 해제
    if (action === "cr_issue_unlinked") {
      const issues =
        (detail.unlinked_issues as
          | { issue_id: string; number: number; title: string; type?: string }[]
          | undefined) ?? [];
      const crNumber = detail.cr_number as number | undefined;
      const crTitle = detail.cr_title as string | undefined;
      const crType = detail.cr_type as string | undefined;
      const unlinkedItems =
        issues.length > 0
          ? issues.map((i) => ({
              number: i.number,
              title: i.title,
              type: toIssueType(i.type),
            }))
          : crNumber != null
            ? [
                {
                  number: crNumber,
                  title: crTitle ?? "",
                  type: toIssueType(crType),
                },
              ]
            : undefined;
      return {
        id: item.id,
        type: "cr_issue_unlinked",
        author,
        createdAt: item.createdAt,
        linkedIssueCount: unlinkedItems?.length ?? 0,
        linkedIssues: unlinkedItems,
      };
    }

    // 다른 이슈/CR에서 멘션됨
    if (action === "issue_mentioned") {
      const sourceNumber = detail.source_number as number;
      const sourceTitle = detail.source_title as string;
      const sourceType = toIssueType(
        detail.source_issue_type as string | undefined,
      );
      return {
        id: item.id,
        type: "issue_mentioned",
        author,
        createdAt: item.createdAt,
        linkedIssues: [
          { number: sourceNumber, title: sourceTitle, type: sourceType },
        ],
        isComment: (detail.is_comment as boolean | undefined) ?? false,
      };
    }

    if (action.includes("close") || action.includes("reopen")) {
      return {
        id: item.id,
        type: "status_change",
        author,
        createdAt: item.createdAt,
        content: action.includes("reopen") ? "open" : "closed",
      };
    }

    return {
      id: item.id,
      type: "referenced",
      author,
      createdAt: item.createdAt,
      ref: item.action,
    };
  });
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function getAttachmentType(
  fileName: string,
  contentType: string,
): "pdf" | "step" | "dwg" | "xlsx" | "image" | "other" {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedContentType = contentType.toLowerCase();

  if (
    normalizedContentType.includes("pdf") ||
    normalizedFileName.endsWith(".pdf")
  )
    return "pdf";
  if (
    normalizedContentType.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|svg)$/.test(normalizedFileName)
  )
    return "image";
  if (
    normalizedFileName.endsWith(".step") ||
    normalizedFileName.endsWith(".stp")
  )
    return "step";
  if (normalizedFileName.endsWith(".dwg")) return "dwg";
  if (
    normalizedContentType.includes("spreadsheet") ||
    /\.(xlsx?|csv)$/.test(normalizedFileName)
  )
    return "xlsx";

  return "other";
}

function toIssueChangeRequest(
  issue: IssueDto,
  timeline: TimelineEvent[] = [],
): ChangeRequest {
  return {
    id: issue.id,
    number: issue.number,
    type: "issue",
    title: issue.title,
    status: toIssueStatus(issue.state),
    author: toIssueAuthor(issue),
    createdAt: issue.createdAt,
    labels: issue.labels.map((label) => ({
      id: label.id,
      name: label.name,
      colorHex: label.color,
    })),
    assignees: issue.assignees.map((assignee) => ({
      id: assignee.id,
      name: assignee.fullName,
      profileImageUrl: assignee.profileImageUrl,
    })),
    reviewers: [],
    description: issue.body ?? "",
    isModified: issue.isModified ?? false,
    timeline,
    attachments: issue.files.map((file) => ({
      id: file.fileId,
      name: file.originalName,
      size: formatFileSize(file.fileSize),
      type: getAttachmentType(file.originalName, file.contentType),
      uploadedBy: toIssueAuthor(issue),
      uploadedAt: file.createdAt,
    })),
    relatedParts: issue.parts.map((part) => ({
      id: part.id,
      partNumber: part.partNumber,
      name: part.name ?? "이름 없음",
    })),
    commentsCount: issue.commentsCount,
    linkedChanges: issue.linkedChanges.map((lc) => ({
      id: lc.id,
      number: lc.number,
      title: lc.title,
      state: lc.state,
    })),
    linkedIssues: [],
  };
}

function toChangeStatus(
  state: string,
): "draft" | "open" | "closed" | "merged" {
  const lower = state.toLowerCase();
  if (lower === "draft") return "draft";
  if (lower === "open") return "open";
  if (lower === "merged") return "merged";
  return "closed";
}

function toChangeAuthor(change: ChangeDto): string {
  if (change.createdBy) return change.createdBy.fullName;
  return "삭제된 사용자";
}

function toChangeChangeRequest(
  change: ChangeDto,
  timeline: TimelineEvent[] = [],
): ChangeRequest {
  return {
    id: change.id,
    number: change.number,
    type: "pr",
    title: change.title,
    status: toChangeStatus(change.crState),
    author: toChangeAuthor(change),
    createdAt: change.createdAt,
    labels: change.labels.map((label) => ({
      id: label.id,
      name: label.name,
      colorHex: label.color,
    })),
    assignees: change.assignees.map((assignee) => ({
      id: assignee.id,
      name: assignee.fullName,
      profileImageUrl: assignee.profileImageUrl,
    })),
    reviewers: change.reviewers.map((reviewer) => ({
      id: reviewer.id,
      name: reviewer.fullName,
      profileImageUrl: reviewer.profileImageUrl,
    })),
    description: change.body ?? "",
    isModified: change.isModified ?? false,
    timeline,
    attachments: change.files.map((file) => ({
      id: file.fileId,
      name: file.originalName,
      size: formatFileSize(file.fileSize),
      type: getAttachmentType(file.originalName, file.contentType),
      uploadedBy: toChangeAuthor(change),
      uploadedAt: file.createdAt,
    })),
    relatedParts: change.parts.map((part) => ({
      id: part.id,
      partNumber: part.partNumber,
      name: part.name ?? "이름 없음",
    })),
    commentsCount: change.commentsCount,
    linkedChanges: [],
    linkedIssues: change.linkedIssues.map((li) => ({
      id: li.id,
      number: li.number,
      title: li.title,
      state: li.state,
    })),
  };
}

function CRListView({
  items,
  type,
  createLabel,
  createBadgeLabel,
  createDisabled,
  onCreate,
  emptyIcon: EmptyIcon,
  onSelect,
}: {
  items: ChangeRequest[];
  type: ChangeRequestType;
  createLabel: string;
  createBadgeLabel?: string;
  createDisabled?: boolean;
  onCreate?: () => void;
  emptyIcon: React.ElementType;
  onSelect: (cr: ChangeRequest) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");

  const isOpenStatus = (status: string) =>
    status === "open" || status === "draft";
  const openCount = items.filter((c) => isOpenStatus(c.status)).length;
  const closedCount = items.filter((c) => !isOpenStatus(c.status)).length;

  const filtered = useMemo(() => {
    if (statusFilter === "open") {
      return items.filter((c) => isOpenStatus(c.status));
    }
    return items.filter((c) => !isOpenStatus(c.status));
  }, [items, statusFilter]);

  const emptyLabel =
    type === "issue"
      ? statusFilter === "open"
        ? "열린 이슈가 없습니다"
        : "닫힌 이슈가 없습니다"
      : statusFilter === "open"
        ? "열린 변경 요청이 없습니다"
        : "닫힌 변경 요청이 없습니다";

  return (
    <div className="rounded-lg border bg-card">
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStatusFilter("open")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
              statusFilter === "open"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            {openCount} 열림
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors ${
              statusFilter === "closed"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {closedCount} 닫힘
          </button>
        </div>
        <div className="flex items-center gap-2">
          {createBadgeLabel && (
            <Badge variant="secondary" className="text-[10px]">
              {createBadgeLabel}
            </Badge>
          )}
          <Button size="sm" disabled={createDisabled} onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" />
            {createLabel}
          </Button>
        </div>
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((cr) => {
            return (
              <button
                key={cr.id}
                type="button"
                onClick={() => onSelect(cr)}
                className="flex w-full items-start gap-3 px-5 py-3 text-left cursor-pointer transition-colors hover:bg-muted/30"
              >
                <div className="mt-0.5 shrink-0">
                  <CRStatusIcon cr={cr} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {cr.title}
                    </span>
                    {cr.labels.map((label) => (
                      <LabelBadge
                        key={label.name}
                        label={label.name}
                        colorHex={label.colorHex}
                        size="sm"
                      />
                    ))}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>#{cr.number}</span>
                    <span>·</span>
                    <span>
                      {cr.author} 님이 {timeAgo(cr.createdAt)} 열었습니다
                    </span>
                    {cr.assignees.length > 0 && (
                      <>
                        <span>·</span>
                        <div className="flex -space-x-1">
                          {cr.assignees.map((assignee) => (
                            <Avatar
                              key={assignee.id ?? assignee.name}
                              className="h-4 w-4 border border-background"
                            >
                              <AvatarFallback className="text-[8px]">
                                {getInitials(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {cr.commentsCount > 0 && (
                  <div className="mt-1 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {cr.commentsCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewCRView({
  projectId,
  variant,
  onCancel,
  onCreated,
  mutation,
}: {
  projectId: string;
  variant: "issue" | "change";
  onCancel: () => void;
  onCreated: () => void;
  mutation:
    | ReturnType<typeof useCreateProjectIssue>
    | ReturnType<typeof useCreateProjectChange>;
}) {
  const [searchParams] = useSearchParams();
  const issueNumberParam =
    variant === "change" ? searchParams.get("issueNumber") : null;
  const [linkedIssueNumber, setLinkedIssueNumber] = useState<number | null>(
    issueNumberParam ? Number(issueNumberParam) : null,
  );
  const [title, setTitle] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [descriptionText, setDescriptionText] = useState("");

  const labels =
    variant === "issue"
      ? {
          heading: "새 이슈",
          description: "프로젝트에서 추적할 작업 또는 문제를 등록합니다.",
          placeholder: "이슈 제목을 입력하세요",
          descPlaceholder: "이슈 설명을 입력하세요",
          submit: "이슈 생성",
        }
      : {
          heading: "새 변경 요청",
          description: "설계 변경사항을 등록하고 리뷰를 요청합니다.",
          placeholder: "변경 요청 제목을 입력하세요",
          descPlaceholder: "변경 요청 설명을 입력하세요",
          submit: "변경 요청 생성",
        };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const plainBody = descriptionText.trim();

    if (!trimmedTitle) return;

    try {
      const request: Record<string, unknown> = {
        title: trimmedTitle,
        body: plainBody.length > 0 ? descriptionJson : null,
      };
      if (variant === "change" && linkedIssueNumber != null) {
        (request as Record<string, unknown>).issueNumber = linkedIssueNumber;
      }
      await mutation.mutateAsync(
        request as Parameters<typeof mutation.mutateAsync>[0],
      );
      onCreated();
    } catch {
      // 에러 토스트는 mutation onError에서 처리
    }
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          {labels.heading}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {labels.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        {/* 참조 이슈 배지 (변경 요청 생성 시 issueNumber가 있을 때) */}
        {variant === "change" && linkedIssueNumber != null && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5"
            >
              <AlertCircle className="h-3 w-3" />
              참조 이슈 #{linkedIssueNumber}
              <button
                type="button"
                className="ml-0.5 rounded-sm p-0.5 hover:bg-muted"
                onClick={() => setLinkedIssueNumber(null)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cr-title">제목</Label>
          <Input
            id="cr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={labels.placeholder}
            maxLength={500}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>설명</Label>
          <TiptapEditor
            content={descriptionJson ?? ""}
            onChangeJson={(content) =>
              setDescriptionJson(content as Record<string, unknown>)
            }
            onChangeText={setDescriptionText}
            placeholder={labels.descPlaceholder}
            minHeight={220}
            projectId={projectId}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={!title.trim() || mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {labels.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}

function IssuesView({
  projectId,
  issueId,
}: {
  projectId: string;
  issueId?: string;
}) {
  const navigate = useNavigate();
  const isNewIssueRoute = issueId === "new";
  const isDetailIssueRoute = !!issueId && issueId !== "new";
  const {
    data: issuesResponse,
    isLoading,
    isError,
    refetch,
  } = useProjectIssues(
    isNewIssueRoute || isDetailIssueRoute ? undefined : projectId,
  );
  const {
    data: issueDetail,
    isLoading: isIssueDetailLoading,
    isError: isIssueDetailError,
    refetch: refetchIssueDetail,
  } = useProjectIssue(projectId, isDetailIssueRoute ? issueId : undefined);
  const {
    data: timelineResponse,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useIssueTimeline(projectId, isDetailIssueRoute ? issueId : undefined);
  const syncIssueAssigneesMutation = useSyncIssueAssignees(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const syncIssueLabelsMutation = useSyncIssueLabels(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const syncIssuePartsMutation = useSyncIssueParts(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const uploadIssueFilesMutation = useUploadIssueFiles(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const deleteIssueFileMutation = useDeleteIssueFile(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const closeIssueMutation = useCloseIssue(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const reopenIssueMutation = useReopenIssue(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const { data: projectLabels = [] } = useIssueLabels(
    isDetailIssueRoute ? projectId : undefined,
    labelsEnabled,
  );
  const [membersEnabled, setMembersEnabled] = useState(false);
  const { data: projectMembersData } = useProjectMembers(
    projectId,
    isDetailIssueRoute && membersEnabled,
  );
  const projectMembers = projectMembersData?.items ?? [];
  const [partsSearchEnabled, setPartsSearchEnabled] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");
  const { data: searchedPartsData, isFetching: isPartsSearching } =
    useSearchProjectParts(
      projectId,
      partsSearch,
      isDetailIssueRoute && partsSearchEnabled,
    );
  const searchedParts = searchedPartsData?.items ?? [];
  const createCommentMutation = useCreateIssueComment(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const updateIssueCommentMutation = useUpdateIssueComment(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const createIssueMutation = useCreateProjectIssue(projectId);
  const updateIssueMutation = useUpdateIssue(
    projectId,
    isDetailIssueRoute ? issueId : undefined,
  );
  const { user } = useAuthStore();

  const issues = useMemo(
    () =>
      issuesResponse?.items.map((issue) => toIssueChangeRequest(issue)) ?? [],
    [issuesResponse],
  );

  if (isNewIssueRoute) {
    return (
      <NewCRView
        projectId={projectId}
        variant="issue"
        onCancel={() => navigate(`/projects/${projectId}/issues`)}
        onCreated={() => navigate(`/projects/${projectId}/issues`)}
        mutation={createIssueMutation}
      />
    );
  }

  if (isDetailIssueRoute) {
    if (isIssueDetailLoading || isTimelineLoading) {
      return (
        <div className="min-h-full flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (isIssueDetailError || isTimelineError) {
      return (
        <div className="min-h-full flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              이슈 타임라인을 불러오지 못했습니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchIssueDetail();
                refetchTimeline();
              }}
            >
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    if (!issueDetail) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          이슈를 찾을 수 없습니다
        </p>
      );
    }

    return (
      <>
        <ChangeRequestDetail
          key={issueDetail.id}
          cr={toIssueChangeRequest(
            issueDetail,
            toTimelineEvents(
              timelineResponse?.items ?? [],
              timelineResponse?.users ?? {},
              issueDetail,
            ),
          )}
          onBack={() => navigate(`/projects/${projectId}/issues`)}
          onSyncAssignees={(userIds) =>
            syncIssueAssigneesMutation.mutate(userIds)
          }
          availableMembers={projectMembers.map((m) => ({
            id: m.userId,
            name: m.fullName,
            email: m.email,
          }))}
          selectedAssigneeIds={issueDetail.assignees.map((a) => a.id)}
          onRequestMembers={() => setMembersEnabled(true)}
          onSyncLabels={(labelIds) => syncIssueLabelsMutation.mutate(labelIds)}
          onRequestLabels={() => setLabelsEnabled(true)}
          onAddComment={(body) => createCommentMutation.mutate(body)}
          isCommentPending={createCommentMutation.isPending}
          availableLabels={projectLabels.map((label) => ({
            id: label.id,
            name: label.name,
            colorHex: label.color,
          }))}
          selectedLabelIds={issueDetail.labels.map((label) => label.id)}
          onSyncParts={(partIds) => syncIssuePartsMutation.mutate(partIds)}
          onRequestParts={() => setPartsSearchEnabled(true)}
          searchedParts={searchedParts.map((p) => ({
            id: p.id,
            partNumber: p.part_number,
            name: p.name,
          }))}
          selectedPartIds={issueDetail.parts.map((p) => p.id)}
          onPartsSearchChange={setPartsSearch}
          isPartsSearching={isPartsSearching}
          onUploadFiles={(files) => uploadIssueFilesMutation.mutate(files)}
          onDeleteFile={(fileId) => deleteIssueFileMutation.mutate(fileId)}
          isFileUploading={uploadIssueFilesMutation.isPending}
          isMetaUpdating={
            syncIssueAssigneesMutation.isPending ||
            syncIssueLabelsMutation.isPending ||
            syncIssuePartsMutation.isPending
          }
          onCloseIssue={() => closeIssueMutation.mutate()}
          onReopenIssue={() => reopenIssueMutation.mutate()}
          isClosingIssue={closeIssueMutation.isPending}
          isReopeningIssue={reopenIssueMutation.isPending}
          onCreateLinkedChange={() =>
            navigate(
              `/projects/${projectId}/change/new?issueNumber=${issueDetail.number}`,
            )
          }
          onNavigateToChange={(changeNumber) =>
            navigate(`/projects/${projectId}/change/${changeNumber}`)
          }
          onNavigateToIssue={(issueNumber) =>
            navigate(`/projects/${projectId}/issues/${issueNumber}`)
          }
          projectId={projectId}
          onUpdateTitleAndBody={async (title, body) => {
            await updateIssueMutation.mutateAsync({ title, body });
          }}
          onUpdateComment={async (commentId, body) => {
            await updateIssueCommentMutation.mutateAsync({ commentId, body });
          }}
          currentUserId={user?.id}
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            이슈 목록을 불러오지 못했습니다.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CRListView
      items={issues}
      type="issue"
      createLabel="새 이슈"
      onCreate={() => navigate(`/projects/${projectId}/issues/new`)}
      emptyIcon={AlertCircle}
      onSelect={(cr) => navigate(`/projects/${projectId}/issues/${cr.number}`)}
    />
  );
}

function PullRequestsView({
  projectId,
  changeId,
}: {
  projectId: string;
  changeId?: string;
}) {
  const navigate = useNavigate();
  const isNewRoute = changeId === "new";
  const isDetailRoute = !!changeId && changeId !== "new";
  const {
    data: changesResponse,
    isLoading,
    isError,
    refetch,
  } = useProjectChanges(isNewRoute || isDetailRoute ? undefined : projectId);
  const {
    data: changeDetail,
    isLoading: isChangeDetailLoading,
    isError: isChangeDetailError,
    refetch: refetchChangeDetail,
  } = useProjectChange(projectId, isDetailRoute ? changeId : undefined);
  const {
    data: timelineResponse,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useChangeTimeline(projectId, isDetailRoute ? changeId : undefined);
  const syncChangeAssigneesMutation = useSyncChangeAssignees(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const syncChangeReviewersMutation = useSyncChangeReviewers(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const syncChangeLabelsMutation = useSyncChangeLabels(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const syncChangePartsMutation = useSyncChangeParts(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const uploadChangeFilesMutation = useUploadChangeFiles(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const deleteChangeFileMutation = useDeleteChangeFile(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const { data: projectLabels = [] } = useChangeLabels(
    isDetailRoute ? projectId : undefined,
    labelsEnabled,
  );
  const [membersEnabled, setMembersEnabled] = useState(false);
  const { data: projectMembersData } = useProjectMembers(
    projectId,
    isDetailRoute && membersEnabled,
  );
  const projectMembers = projectMembersData?.items ?? [];
  const [partsSearchEnabled, setPartsSearchEnabled] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");
  const { data: searchedPartsData, isFetching: isPartsSearching } =
    useSearchProjectParts(
      projectId,
      partsSearch,
      isDetailRoute && partsSearchEnabled,
    );
  const searchedParts = searchedPartsData?.items ?? [];
  const createCommentMutation = useCreateChangeComment(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const updateChangeCommentMutation = useUpdateChangeComment(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const createChangeMutation = useCreateProjectChange(projectId);
  const updateChangeMutation = useUpdateChange(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const linkChangeIssuesMutation = useLinkChangeIssues(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const unlinkChangeIssuesMutation = useUnlinkChangeIssues(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const closeChangeMutation = useCloseChange(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const mergeChangeMutation = useMergeChange(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const openChangeMutation = useOpenChange(
    projectId,
    isDetailRoute ? changeId : undefined,
  );
  const { data: issuesForLinking } = useProjectIssues(
    isDetailRoute ? projectId : undefined,
  );
  const { user: changeUser } = useAuthStore();

  const changes = useMemo(
    () =>
      changesResponse?.items.map((change) => toChangeChangeRequest(change)) ??
      [],
    [changesResponse],
  );

  if (isNewRoute) {
    return (
      <NewCRView
        projectId={projectId}
        variant="change"
        onCancel={() => navigate(`/projects/${projectId}/change`)}
        onCreated={() => navigate(`/projects/${projectId}/change`)}
        mutation={createChangeMutation}
      />
    );
  }

  if (isDetailRoute) {
    if (isChangeDetailLoading || isTimelineLoading) {
      return (
        <div className="min-h-full flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (isChangeDetailError || isTimelineError) {
      return (
        <div className="min-h-full flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              변경 요청 타임라인을 불러오지 못했습니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchChangeDetail();
                refetchTimeline();
              }}
            >
              다시 시도
            </Button>
          </div>
        </div>
      );
    }

    if (!changeDetail) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          변경 요청을 찾을 수 없습니다
        </p>
      );
    }

    return (
      <ChangeRequestDetail
        key={changeDetail.id}
        cr={toChangeChangeRequest(
          changeDetail,
          toTimelineEvents(
            timelineResponse?.items ?? [],
            timelineResponse?.users ?? {},
            changeDetail,
          ),
        )}
        onBack={() => navigate(`/projects/${projectId}/change`)}
        onSyncAssignees={(userIds) =>
          syncChangeAssigneesMutation.mutate(userIds)
        }
        availableMembers={projectMembers.map((m) => ({
          id: m.userId,
          name: m.fullName,
          email: m.email,
        }))}
        selectedAssigneeIds={changeDetail.assignees.map((a) => a.id)}
        onRequestMembers={() => setMembersEnabled(true)}
        onSyncReviewers={(userIds) =>
          syncChangeReviewersMutation.mutate(userIds)
        }
        selectedReviewerIds={changeDetail.reviewers.map((r) => r.id)}
        onSyncLabels={(labelIds) => syncChangeLabelsMutation.mutate(labelIds)}
        onRequestLabels={() => setLabelsEnabled(true)}
        onAddComment={(body) => createCommentMutation.mutate(body)}
        isCommentPending={createCommentMutation.isPending}
        availableLabels={projectLabels.map((label) => ({
          id: label.id,
          name: label.name,
          colorHex: label.color,
        }))}
        selectedLabelIds={changeDetail.labels.map((label) => label.id)}
        onSyncParts={(partIds) => syncChangePartsMutation.mutate(partIds)}
        onRequestParts={() => setPartsSearchEnabled(true)}
        searchedParts={searchedParts.map((p) => ({
          id: p.id,
          partNumber: p.part_number,
          name: p.name,
        }))}
        selectedPartIds={changeDetail.parts.map((p) => p.id)}
        onPartsSearchChange={setPartsSearch}
        isPartsSearching={isPartsSearching}
        onUploadFiles={(files) => uploadChangeFilesMutation.mutate(files)}
        onDeleteFile={(fileId) => deleteChangeFileMutation.mutate(fileId)}
        isFileUploading={uploadChangeFilesMutation.isPending}
        isMetaUpdating={
          syncChangeAssigneesMutation.isPending ||
          syncChangeReviewersMutation.isPending ||
          syncChangeLabelsMutation.isPending ||
          syncChangePartsMutation.isPending
        }
        onSyncLinkedIssues={(issueIds) => {
          const currentIds = changeDetail.linkedIssues.map((li) => li.id);
          const toLink = issueIds.filter((id) => !currentIds.includes(id));
          const toUnlink = currentIds.filter((id) => !issueIds.includes(id));
          if (toLink.length > 0) linkChangeIssuesMutation.mutate(toLink);
          if (toUnlink.length > 0) unlinkChangeIssuesMutation.mutate(toUnlink);
        }}
        onUnlinkIssue={(issueId) =>
          unlinkChangeIssuesMutation.mutate([issueId])
        }
        availableIssues={(issuesForLinking?.items ?? []).map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          state: issue.state,
        }))}
        linkedIssueIds={changeDetail.linkedIssues.map((li) => li.id)}
        onNavigateToChange={(changeNumber) =>
          navigate(`/projects/${projectId}/change/${changeNumber}`)
        }
        onNavigateToIssue={(issueNumber) =>
          navigate(`/projects/${projectId}/issues/${issueNumber}`)
        }
        projectId={projectId}
        onUpdateTitleAndBody={async (title, body) => {
          await updateChangeMutation.mutateAsync({ title, body });
        }}
        onUpdateComment={async (commentId, body) => {
          await updateChangeCommentMutation.mutateAsync({ commentId, body });
        }}
        currentUserId={changeUser?.id}
        onCloseChange={() => closeChangeMutation.mutate()}
        onMergeChange={() => mergeChangeMutation.mutate()}
        onOpenChange={() => openChangeMutation.mutate()}
        isClosingChange={closeChangeMutation.isPending}
        isMergingChange={mergeChangeMutation.isPending}
        isOpeningChange={openChangeMutation.isPending}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            변경 요청 목록을 불러오지 못했습니다.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CRListView
      items={changes}
      type="pr"
      createLabel="새 변경 요청"
      onCreate={() => navigate(`/projects/${projectId}/change/new`)}
      emptyIcon={FilePen}
      onSelect={(cr) => navigate(`/projects/${projectId}/change/${cr.number}`)}
    />
  );
}

// ============================================================
// 활동 탭
// ============================================================

// 날짜를 "오늘", "어제", "2월 20일" 등으로 그룹 라벨 생성
function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (target.getFullYear() === now.getFullYear()) {
    return `${target.getMonth() + 1}월 ${target.getDate()}일`;
  }
  return `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일`;
}

// 활동 목록을 날짜 그룹으로 분할
function groupActivitiesByDate(
  activities: ActivityDto[],
): { label: string; items: ActivityDto[] }[] {
  const groups: { label: string; items: ActivityDto[] }[] = [];
  for (const activity of activities) {
    const label = getDateGroupLabel(activity.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }
  return groups;
}

function ActivityTab({ projectId }: { projectId: string }) {
  const [scopeFilter, setScopeFilter] = useState<ActivityScope | "all">("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const scope = scopeFilter === "all" ? undefined : [scopeFilter];

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useProjectActivities(projectId, { scope });

  // 모든 페이지의 활동 합치기
  const allActivities = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // 모든 페이지의 users 합치기
  const allUsers = useMemo(() => {
    if (!data) return {} as Record<string, TimelineUserDto>;
    const merged: Record<string, TimelineUserDto> = {};
    for (const page of data.pages) {
      Object.assign(merged, page.users);
    }
    return merged;
  }, [data]);

  // 사용자 필터: users 맵에서 유저 목록 추출
  const userList = useMemo(() => {
    return Object.values(allUsers);
  }, [allUsers]);

  // 사용자 필터 적용
  const filteredActivities = useMemo(() => {
    if (userFilter === "all") return allActivities;
    return allActivities.filter((a) => a.actorId === userFilter);
  }, [allActivities, userFilter]);

  const groupedActivities = useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities],
  );

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="rounded-lg border bg-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">활동 로그</h2>
          {filteredActivities.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {filteredActivities.length}건
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={scopeFilter}
            onValueChange={(v) => setScopeFilter(v as ActivityScope | "all")}
          >
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-7 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 사용자</SelectItem>
              {userList.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 활동 목록 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            해당 활동이 없습니다
          </p>
        </div>
      ) : (
        <div>
          {groupedActivities.map((group) => (
            <div key={group.label}>
              {/* 날짜 그룹 헤더 */}
              <div className="border-b bg-muted/40 px-5 py-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {group.label}
                </span>
              </div>

              {/* 그룹 내 활동 행 */}
              <div className="divide-y divide-border/50">
                {group.items.map((activity) => {
                  const config =
                    ACTIVITY_CONFIG[activity.action] ?? DEFAULT_ACTIVITY;
                  const scopeInfo = SCOPE_ICON[config.scope] ?? DEFAULT_SCOPE;
                  const ScopeIcon = scopeInfo.icon;
                  const user = allUsers[activity.actorId];

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 px-5 py-2.5 transition-colors hover:bg-muted/30"
                    >
                      {/* 시간 */}
                      <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                        {formatTime(activity.createdAt)}
                      </span>

                      {/* scope 뱃지 (아이콘 + 범위) */}
                      <Badge
                        variant="outline"
                        className={`inline-flex w-[88px] shrink-0 items-center justify-center gap-1 text-[10px] ${config.badgeClass}`}
                      >
                        <ScopeIcon className="h-3 w-3" />
                        {scopeInfo.label}
                      </Badge>

                      {/* state 라벨 */}
                      <span
                        className={`w-[52px] shrink-0 text-[11px] font-medium ${config.stateClass}`}
                      >
                        {config.state}
                      </span>

                      {/* 요약 */}
                      <p className="min-w-0 flex-1 truncate text-sm text-foreground/90">
                        {getActivitySummary(activity.action, activity.detail)}
                      </p>

                      {/* 사용자 */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          {user?.profileImageUrl && (
                            <AvatarImage
                              src={user.profileImageUrl}
                              alt={user.fullName}
                            />
                          )}
                          <AvatarFallback className="text-[9px]">
                            {getInitials(user?.fullName ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {user?.fullName ?? activity.actorId.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 무한스크롤 감지 sentinel + 로딩 스피너 */}
          {hasNextPage && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-4"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  불러오는 중...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 메인 컴포넌트
// ============================================================

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useProject(projectId);
  // URL 경로에서 현재 뷰와 상세 번호 파싱
  const basePath = `/projects/${projectId}`;
  const subPath = location.pathname.slice(basePath.length).replace(/^\//, "");
  const pathSegments = subPath.split("/").filter(Boolean);

  type ViewKey =
    | "overview"
    | "parts"
    | "issues"
    | "change"
    | "activity"
    | "settings";
  const VALID_VIEWS = new Set<string>([
    "parts",
    "issues",
    "change",
    "activity",
    "settings",
  ]);
  const activeView: ViewKey = VALID_VIEWS.has(pathSegments[0])
    ? (pathSegments[0] as ViewKey)
    : "overview";

  const [editOpen, setEditOpen] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);

  const { data: projectPartsData, refetch: refetchProjectParts } = useParts(
    { project_id: projectId, offset: 0, limit: 100 },
    {
      enabled: activeView === "overview",
    },
  );

  const parts = useMemo<MockProjectPart[]>(() => {
    return (projectPartsData?.items ?? []).map((part) => ({
      id: part.id,
      part_number: part.part_number,
      name: part.name,
      category: part.category,
    }));
  }, [projectPartsData?.items]);
  const crNumber =
    activeView === "issues" || activeView === "change"
      ? pathSegments[1]
      : undefined;

  if (isProjectLoading) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isProjectError) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            프로젝트 정보를 불러오지 못했습니다.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetchProject()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  // 프로젝트 없음
  if (!project) {
    return (
      <div className="min-h-full">
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/projects")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            프로젝트
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground/50">알 수 없음</span>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-dashed px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Package className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground/50">
            해당하는 프로젝트를 찾을 수 없습니다
          </p>
        </div>
      </div>
    );
  }

  async function handleAddParts(ids: string[]) {
    if (!projectId || ids.length === 0) return;
    try {
      const result = await linkPartsToProject(projectId, ids);
      await Promise.all([
        refetchProjectParts(),
        queryClient.invalidateQueries({ queryKey: ["parts"] }),
        queryClient.invalidateQueries({ queryKey: ["partLookup"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
      toast.success(`${result.linked_count}건의 부품을 연결했습니다`);
    } catch {
      toast.error("부품 연결에 실패했습니다");
    }
  }

  async function handleUnlinkSelected(
    selectedIds: Set<string>,
    clearSelection: () => void,
  ) {
    if (!projectId || selectedIds.size === 0) return;
    try {
      await unlinkPartsFromProject(projectId, [...selectedIds]);
      await Promise.all([
        refetchProjectParts(),
        queryClient.invalidateQueries({ queryKey: ["parts"] }),
        queryClient.invalidateQueries({ queryKey: ["partLookup"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
      clearSelection();
      toast.success("선택한 부품 연결이 해제되었습니다");
    } catch {
      toast.error("부품 연결 해제에 실패했습니다");
    }
  }

  return (
    <div className="min-h-full">
      {/* 헤더 (GitHub 스타일) */}
      <ProjectHeader
        project={project}
        onEdit={() => setEditOpen(true)}
        onDelete={() => navigate("/projects")}
      />

      {/* 네비게이션 바 */}
      <nav className="mt-4 flex items-center gap-1 border-b">
        {(
          [
            { key: "overview", label: "개요", icon: LayoutDashboard },
            {
              key: "parts",
              label: "부품",
              icon: Package,
              count: project.partCount,
            },
            {
              key: "issues",
              label: "이슈",
              icon: AlertCircle,
              count: project.issueCount,
            },
            {
              key: "change",
              label: "변경 요청",
              icon: FilePen,
              count: project.changeCount,
            },
            { key: "activity", label: "활동", icon: Activity },
          ] as const
        )
          .map(({ key, label, icon: Icon, ...rest }) => ({
            key,
            label,
            icon: Icon,
            count: "count" in rest ? rest.count : undefined,
          }))
          .map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() =>
                navigate(key === "overview" ? basePath : `${basePath}/${key}`)
              }
              className={cn(
                "relative inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
                activeView === key
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {count != null && (
                <span className="text-[10px] text-muted-foreground">
                  ({count})
                </span>
              )}
            </button>
          ))}
        <button
          onClick={() => navigate(`${basePath}/settings`)}
          className={cn(
            "relative ml-auto inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
            activeView === "settings"
              ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          설정
        </button>
      </nav>

      {/* 뷰 콘텐츠 */}
      <div className="mt-4">
        {activeView === "overview" && (
          <OverviewTab parts={parts} projectId={projectId!} />
        )}
        {activeView === "parts" && (
          <div>
            <div className="mb-2 flex justify-end">
              <Button size="sm" onClick={() => setAddPartOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                부품 연결
              </Button>
            </div>
            <PartsTableContent
              projectId={projectId}
              onRowClick={(partId) => navigate(`/parts/${partId}`)}
              selectedAction={({ selectedIds, clearSelection }) => (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    handleUnlinkSelected(selectedIds, clearSelection)
                  }
                >
                  프로젝트 연결 해제
                </Button>
              )}
            />
          </div>
        )}
        {activeView === "issues" && (
          <IssuesView projectId={projectId!} issueId={crNumber} />
        )}
        {activeView === "change" && (
          <PullRequestsView projectId={projectId!} changeId={crNumber} />
        )}
        {activeView === "activity" && <ActivityTab projectId={projectId!} />}
        {activeView === "settings" && (
          <ProjectSettingsView
            projectId={projectId!}
            projectName={project.name}
            projectDescription={project.description}
          />
        )}
      </div>

      {/* 편집 다이얼로그 */}
      <EditProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultName={project.name}
        defaultDescription={project.description ?? ""}
        onSave={() => setEditOpen(false)}
      />

      {/* 부품 연결 다이얼로그 */}
      <AddPartDialog
        open={addPartOpen}
        onOpenChange={setAddPartOpen}
        projectId={projectId!}
        onAdd={handleAddParts}
      />
    </div>
  );
}
