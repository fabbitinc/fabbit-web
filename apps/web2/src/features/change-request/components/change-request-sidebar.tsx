import { useRef, useState, type ReactNode } from "react";
import {
  Eye,
  GitPullRequestArrow,
  Paperclip,
  Package,
  Plus,
  Tag,
  Trash2,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { Badge, Button, ConfirmDialog, LabelBadge, UserAvatar } from "@fabbit/ui";
import type { ChangeRequestDetailModel } from "@/features/change-request/types/change-request-model";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChangeRequestStateLabel(state: string) {
  const stateLabelMap: Record<string, string> = {
    DRAFT: "초안",
    OPEN: "열림",
    SUBMITTED: "제출됨",
    MERGED: "반영됨",
    CLOSED: "닫힘",
  };

  return stateLabelMap[state] ?? state;
}

function getReviewStatusLabel(status: string) {
  const reviewStatusMap: Record<string, string> = {
    PENDING: "대기",
    COMMENTED: "의견 남김",
    APPROVED: "승인",
    CHANGES_REQUESTED: "수정 요청",
  };

  return reviewStatusMap[status] ?? status;
}

function getReviewStatusVariant(status: string): "outline" | "neutral" | "accent" | "success" {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "CHANGES_REQUESTED") {
    return "neutral";
  }

  if (status === "PENDING") {
    return "outline";
  }

  return "accent";
}

function SidebarSection({
  title,
  description,
  icon,
  action,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="app-panel rounded-[28px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-muted/70 p-2 text-muted-foreground">{icon}</div>
          <div>
            <p className="font-medium text-foreground">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

interface ChangeRequestSidebarProps {
  changeRequest: ChangeRequestDetailModel;
  isAttachingFiles: boolean;
  onAttachFiles: (files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEditAssignees: () => void;
  onEditIssues: () => void;
  onEditLabels: () => void;
  onEditParts: () => void;
  onEditReviewers: () => void;
  onNavigateToIssue: (issueNumber: number) => void;
}

export function ChangeRequestSidebar({
  changeRequest,
  isAttachingFiles,
  onAttachFiles,
  onDeleteFile,
  onEditAssignees,
  onEditIssues,
  onEditLabels,
  onEditParts,
  onEditReviewers,
  onNavigateToIssue,
}: ChangeRequestSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const deletingFile = changeRequest.files.find((file) => file.fileId === deletingFileId) ?? null;

  return (
    <div className="space-y-4">
      <SidebarSection
        title="개요"
        description="변경 요청의 상태와 주요 메타데이터를 확인합니다."
        icon={<Eye className="size-4" />}
      >
        <div className="grid gap-3 rounded-[20px] border border-border/70 bg-muted/20 px-4 py-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">State</p>
            <div className="mt-2">
              <Badge
                variant={
                  changeRequest.crState === "MERGED"
                    ? "success"
                    : changeRequest.crState === "CLOSED"
                      ? "neutral"
                      : "accent"
                }
              >
                {getChangeRequestStateLabel(changeRequest.crState)}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Comments</p>
            <p className="mt-2 font-medium text-foreground">{changeRequest.commentsCount}개</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</p>
            <p className="mt-2 font-medium text-foreground">{formatDateTime(changeRequest.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
            <p className="mt-2 font-medium text-foreground">{formatDateTime(changeRequest.updatedAt)}</p>
          </div>
          {changeRequest.mergedAt ? (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Merged</p>
              <p className="mt-2 font-medium text-foreground">
                {formatDateTime(changeRequest.mergedAt)}
                {changeRequest.mergedBy ? ` · ${changeRequest.mergedBy}` : ""}
              </p>
            </div>
          ) : null}
        </div>
      </SidebarSection>

      <SidebarSection
        title="담당자"
        description="변경 요청 실행을 담당하는 멤버입니다."
        icon={<Users className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditAssignees}>
            편집
          </Button>
        }
      >
        {changeRequest.assignees.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            아직 지정된 담당자가 없습니다.
          </p>
        ) : (
          changeRequest.assignees.map((assignee) => (
            <div key={assignee.userId} className="flex items-center gap-3 rounded-[18px] border border-border/70 bg-card px-3 py-3">
              <UserAvatar imageUrl={assignee.profileImageUrl} name={assignee.fullName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{assignee.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{assignee.email}</p>
              </div>
            </div>
          ))
        )}
      </SidebarSection>

      <SidebarSection
        title="검토자"
        description="제출된 변경을 검토하는 멤버입니다."
        icon={<UserRoundCheck className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditReviewers}>
            편집
          </Button>
        }
      >
        {changeRequest.reviewers.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            아직 지정된 검토자가 없습니다.
          </p>
        ) : (
          changeRequest.reviewers.map((reviewer) => (
            <div key={reviewer.userId} className="rounded-[18px] border border-border/70 bg-card px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar imageUrl={reviewer.profileImageUrl} name={reviewer.fullName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{reviewer.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{reviewer.email}</p>
                  </div>
                </div>
                <Badge variant={getReviewStatusVariant(reviewer.reviewStatus)}>
                  {getReviewStatusLabel(reviewer.reviewStatus)}
                </Badge>
              </div>
              {reviewer.reviewedAt ? (
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(reviewer.reviewedAt)}</p>
              ) : null}
            </div>
          ))
        )}
      </SidebarSection>

      <SidebarSection
        title="라벨"
        description="변경 요청 분류와 우선순위를 표시합니다."
        icon={<Tag className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditLabels}>
            편집
          </Button>
        }
      >
        {changeRequest.labels.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 라벨이 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {changeRequest.labels.map((label) => (
              <LabelBadge key={label.id} colorHex={label.color} label={label.name} size="sm" />
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        title="관련 부품"
        description="변경 요청과 연관된 부품 목록입니다."
        icon={<Package className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditParts}>
            편집
          </Button>
        }
      >
        {changeRequest.parts.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 부품이 없습니다.
          </p>
        ) : (
          changeRequest.parts.map((part) => (
            <div key={part.id} className="rounded-[18px] border border-border/70 bg-card px-3 py-3">
              <p className="truncate text-sm font-medium text-foreground">{part.partNumber}</p>
              <p className="truncate text-xs text-muted-foreground">{part.name ?? "이름 없음"}</p>
            </div>
          ))
        )}
      </SidebarSection>

      <SidebarSection
        title="연결된 이슈"
        description="변경 요청과 연결된 이슈를 관리합니다."
        icon={<GitPullRequestArrow className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditIssues}>
            편집
          </Button>
        }
      >
        {changeRequest.linkedIssues.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 이슈가 없습니다.
          </p>
        ) : (
          changeRequest.linkedIssues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-[18px] border border-border/70 bg-card px-3 py-3 text-left"
              onClick={() => onNavigateToIssue(issue.number)}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">#{issue.number} {issue.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {issue.state === "CLOSED" ? "닫힘" : "열림"}
                </p>
              </div>
              <Badge variant={issue.state === "CLOSED" ? "neutral" : "accent"}>
                {issue.state === "CLOSED" ? "닫힘" : "열림"}
              </Badge>
            </button>
          ))
        )}
      </SidebarSection>

      <SidebarSection
        title="첨부파일"
        description="업로드한 파일을 연결하거나 제거합니다."
        icon={<Paperclip className="size-4" />}
        action={
          <Button
            disabled={isAttachingFiles}
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-4" />
            추가
          </Button>
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0) {
              void onAttachFiles(files);
            }
            event.target.value = "";
          }}
        />

        {changeRequest.files.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 첨부파일이 없습니다.
          </p>
        ) : (
          changeRequest.files.map((file) => (
            <div key={file.fileId} className="flex items-center justify-between gap-3 rounded-[18px] border border-border/70 bg-card px-3 py-3">
              <div className="min-w-0">
                {file.fileUrl ? (
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {file.originalName}
                  </a>
                ) : (
                  <p className="truncate text-sm font-medium text-foreground">{file.originalName}</p>
                )}
                <p className="truncate text-xs text-muted-foreground">{formatDateTime(file.createdAt)}</p>
              </div>
              <Button size="icon-sm" type="button" variant="ghost" onClick={() => setDeletingFileId(file.fileId)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </SidebarSection>

      <ConfirmDialog
        open={Boolean(deletingFileId)}
        title="첨부파일을 삭제할까요?"
        description={deletingFile ? `${deletingFile.originalName} 파일 연결을 해제합니다.` : "선택한 파일 연결을 해제합니다."}
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setDeletingFileId(null)}
        onConfirm={() => {
          if (!deletingFileId) {
            return;
          }

          void onDeleteFile(deletingFileId);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingFileId(null);
          }
        }}
      />
    </div>
  );
}
