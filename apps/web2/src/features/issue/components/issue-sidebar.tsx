import { useRef, useState, type ReactNode } from "react";
import {
  FileText,
  GitPullRequestArrow,
  Paperclip,
  Package,
  Plus,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Badge, Button, ConfirmDialog, LabelBadge, UserAvatar } from "@fabbit/ui";
import type { IssueDetailModel } from "@/features/issue/types/issue-model";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

interface IssueSidebarProps {
  issue: IssueDetailModel;
  isAttachingFiles: boolean;
  onAttachFiles: (files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onEditAssignees: () => void;
  onEditChanges: () => void;
  onEditLabels: () => void;
  onEditParts: () => void;
  onNavigateToChange: (changeNumber: number) => void;
  onCreateLinkedChange: () => void;
}

export function IssueSidebar({
  issue,
  isAttachingFiles,
  onAttachFiles,
  onDeleteFile,
  onEditAssignees,
  onEditChanges,
  onEditLabels,
  onEditParts,
  onNavigateToChange,
  onCreateLinkedChange,
}: IssueSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const deletingFile = issue.files.find((file) => file.fileId === deletingFileId) ?? null;

  return (
    <div className="space-y-4">
      <SidebarSection
        title="개요"
        description="이슈의 핵심 메타데이터를 확인합니다."
        icon={<FileText className="size-4" />}
      >
        <div className="grid gap-3 rounded-[20px] border border-border/70 bg-muted/20 px-4 py-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">State</p>
            <div className="mt-2">
              <Badge variant={issue.state === "CLOSED" ? "neutral" : "accent"}>
                {issue.state === "CLOSED" ? "닫힘" : "열림"}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Comments</p>
            <p className="mt-2 font-medium text-foreground">{issue.commentsCount}개</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Created</p>
            <p className="mt-2 font-medium text-foreground">{formatDateTime(issue.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Updated</p>
            <p className="mt-2 font-medium text-foreground">{formatDateTime(issue.updatedAt)}</p>
          </div>
        </div>
      </SidebarSection>

      <SidebarSection
        title="담당자"
        description="이 이슈를 담당하는 멤버입니다."
        icon={<Users className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditAssignees}>
            편집
          </Button>
        }
      >
        {issue.assignees.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            아직 지정된 담당자가 없습니다.
          </p>
        ) : (
          issue.assignees.map((assignee) => (
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
        title="라벨"
        description="이슈 분류와 우선순위를 표시합니다."
        icon={<Tag className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditLabels}>
            편집
          </Button>
        }
      >
        {issue.labels.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 라벨이 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {issue.labels.map((label) => (
              <LabelBadge key={label.id} colorHex={label.color} label={label.name} size="sm" />
            ))}
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        title="관련 부품"
        description="이슈와 연관된 부품 목록입니다."
        icon={<Package className="size-4" />}
        action={
          <Button size="sm" type="button" variant="outline" onClick={onEditParts}>
            편집
          </Button>
        }
      >
        {issue.parts.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 부품이 없습니다.
          </p>
        ) : (
          issue.parts.map((part) => (
            <div key={part.id} className="rounded-[18px] border border-border/70 bg-card px-3 py-3">
              <p className="truncate text-sm font-medium text-foreground">{part.partNumber}</p>
              <p className="truncate text-xs text-muted-foreground">{part.name ?? "이름 없음"}</p>
            </div>
          ))
        )}
      </SidebarSection>

      <SidebarSection
        title="연결된 변경 요청"
        description="기존 변경 요청을 연결하거나 새 요청을 생성합니다."
        icon={<GitPullRequestArrow className="size-4" />}
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" type="button" variant="outline" onClick={onEditChanges}>
              편집
            </Button>
            <Button size="sm" type="button" onClick={onCreateLinkedChange}>
              <Plus className="size-4" />
              생성
            </Button>
          </div>
        }
      >
        {issue.linkedChanges.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 변경 요청이 없습니다.
          </p>
        ) : (
          issue.linkedChanges.map((change) => (
            <button
              key={change.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-[18px] border border-border/70 bg-card px-3 py-3 text-left"
              onClick={() => onNavigateToChange(change.number)}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">#{change.number} {change.title}</p>
                <p className="truncate text-xs text-muted-foreground">{change.crState}</p>
              </div>
              <Badge variant={change.crState === "MERGED" ? "success" : "outline"}>{change.crState}</Badge>
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

        {issue.files.length === 0 ? (
          <p className="rounded-[18px] border border-border/70 bg-muted/20 px-3 py-3 text-sm text-muted-foreground">
            연결된 첨부파일이 없습니다.
          </p>
        ) : (
          issue.files.map((file) => (
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
