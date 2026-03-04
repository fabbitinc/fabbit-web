import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { Content } from "@tiptap/react";
import {
  CheckCircle2,
  XCircle,
  FilePen,
  FileCheck,
  FileX,
  Paperclip,
  MessageSquare,
  Tag,
  UserPlus,
  Package,
  LinkIcon,
  Unlink,
  FileText,
  FileSpreadsheet,
  Image,
  File,
  Box,
  Plus,
  ArrowLeft,
  AlertCircle,
  Loader2,
  X,
  Pencil,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { LabelBadge } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import {
  MemberPickerSection,
  LabelPickerSection,
  PartPickerSection,
} from "@/components/sidebar-pickers";
import {
  type ChangeRequest,
  type TimelineEvent,
  type TimelineAuthor,
  type CRAttachment,
  type LinkedChangeBadge,
  type LinkedIssueBadge,
} from "./changeRequestMock";
import { MOCK_CR_CHANGES } from "./changeRequestMock";
import { ChangesDiffTab } from "./ChangesDiffTab";

// ============================================================
// 헬퍼
// ============================================================

/** 목록이 여러 개일 때 "첫번째 외 N개" + 툴팁으로 나머지를 보여주는 컴포넌트 */
export function TruncatedNames({
  items,
  suffix,
}: {
  items: string[];
  suffix?: string;
}) {
  if (items.length === 0) return null;

  return (
    <>
      <span className="font-medium text-foreground">{items[0]}</span>
      {items.length > 1 && (
        <>
          {" "}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help border-b border-dashed border-muted-foreground/40 font-medium text-foreground">
                외 {items.length - 1}개
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6} hideArrow>
              {items.slice(1).map((item) => (
                <div key={item}>{item}</div>
              ))}
            </TooltipContent>
          </Tooltip>
        </>
      )}
      {suffix && <> {suffix}</>}
    </>
  );
}

function ActivityAuthor({ author }: { author: TimelineAuthor }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle font-medium text-foreground">
      <UserAvatar
        name={author.name}
        imageUrl={author.profileImageUrl}
        className="h-4 w-4 text-[8px]"
      />
      {author.name}
    </span>
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
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// ============================================================
// 상태 아이콘
// ============================================================

function CRStatusIcon({
  cr,
  size = "sm",
}: {
  cr: ChangeRequest;
  size?: "sm" | "lg";
}) {
  const cls = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  if (cr.type === "pr" && cr.status === "merged") {
    return (
      <FileCheck className={`${cls} text-purple-600 dark:text-purple-400`} />
    );
  }
  if (cr.type === "pr") {
    if (cr.status === "draft") {
      return <FilePen className={`${cls} text-gray-500 dark:text-gray-400`} />;
    }
    return cr.status === "open" ? (
      <FilePen className={`${cls} text-emerald-600 dark:text-emerald-400`} />
    ) : (
      <FileX className={`${cls} text-red-500 dark:text-red-400`} />
    );
  }
  return cr.status === "open" ? (
    <AlertCircle className={`${cls} text-emerald-600 dark:text-emerald-400`} />
  ) : (
    <CheckCircle2 className={`${cls} text-purple-600 dark:text-purple-400`} />
  );
}

// ============================================================
// 첨부파일 아이콘
// ============================================================

function AttachmentIcon({ type }: { type: CRAttachment["type"] }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "pdf":
      return <FileText className={`${cls} text-red-500`} />;
    case "step":
      return <Box className={`${cls} text-blue-500`} />;
    case "dwg":
      return <FilePen className={`${cls} text-amber-500`} />;
    case "xlsx":
      return <FileSpreadsheet className={`${cls} text-emerald-500`} />;
    case "image":
      return <Image className={`${cls} text-purple-500`} />;
    default:
      return <File className={`${cls} text-muted-foreground`} />;
  }
}

const STATUS_BADGE_STYLE = {
  draft:
    "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400",
  open: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  merged:
    "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-400",
  closed:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
} as const;

const STATUS_LABEL = {
  draft: "초안",
  open: "열림",
  merged: "반영됨",
  closed: "닫힘",
} as const;

// ============================================================
// 타임라인 이벤트 아이템
// ============================================================

/** 댓글 타임라인 아이템 (편집 기능 포함) */
function TimelineCommentItem({
  event,
  canEdit,
  onUpdate,
  onIssueMentionClick,
}: {
  event: TimelineEvent;
  canEdit: boolean;
  onUpdate?: (
    commentId: string,
    body: Record<string, unknown>,
  ) => Promise<void>;
  onIssueMentionClick?: (
    issueNumber: number,
    issueType: "issue" | "change_request",
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editBodyRef = useRef<Record<string, unknown> | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const isRichContent = event.content && typeof event.content === "object";

  if (isEditing) {
    return (
      <div>
        <TiptapEditor
          key={editorKey}
          content={isRichContent ? (event.content as Content) : undefined}
          editable
          minHeight={80}
          onChangeJson={(json) => {
            editBodyRef.current = json as Record<string, unknown>;
          }}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            취소
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={async () => {
              const body = editBodyRef.current;
              if (!body || !onUpdate) return;
              setIsSaving(true);
              try {
                await onUpdate(event.id, body);
                setIsEditing(false);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving && (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            )}
            저장
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <UserAvatar
          name={event.author.name}
          imageUrl={event.author.profileImageUrl}
          className="h-8 w-8 shrink-0"
        />
      </div>
      <div className="min-w-0 flex-1 rounded-lg border bg-card">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            {event.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {timeAgo(event.createdAt)}
          </span>
          {event.isModified && (
            <span className="text-xs text-muted-foreground">· 수정됨</span>
          )}
          {canEdit && onUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6 shrink-0"
              onClick={() => {
                editBodyRef.current = null;
                setEditorKey((k) => k + 1);
                setIsEditing(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>
        {isRichContent ? (
          <div className="px-4 py-3">
            <TiptapEditor
              content={event.content as Content}
              editable={false}
              hideToolbar
              minHeight={0}
              className="border-0 bg-transparent"
              onIssueMentionClick={onIssueMentionClick}
            />
          </div>
        ) : (
          <div className="px-4 py-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {typeof event.content === "string" ? event.content : null}
          </div>
        )}
      </div>
    </div>
  );
}

/** 타임라인 내 클릭 가능한 이슈/CR 링크 */
function ClickableIssueLink({
  item,
  onNavigate,
  block,
}: {
  item: { number: number; title: string; type?: "issue" | "change_request" };
  onNavigate?: (number: number, type: "issue" | "change_request") => void;
  /** true이면 block + truncate 스타일 (목록 항목용) */
  block?: boolean;
}) {
  const issueType = item.type ?? "issue";
  const blockCls = block ? "block truncate" : "";
  if (!onNavigate) {
    return (
      <span className={cn("font-medium text-foreground", blockCls)}>
        {item.title}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer font-medium text-primary hover:underline",
        blockCls,
      )}
      onClick={() => onNavigate(item.number, issueType)}
    >
      {item.title}
    </button>
  );
}

function TimelineEventItem({
  event,
  onNavigate,
}: {
  event: TimelineEvent;
  onNavigate?: (number: number, type: "issue" | "change_request") => void;
}) {
  // 리뷰 승인
  if (event.type === "review_approved") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 승인했습니다"}
          {event.content && (
            <span className="text-muted-foreground/70"> — {event.content}</span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 리뷰 변경 요청
  if (event.type === "review_changes_requested") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 변경을 요청했습니다"}
          {event.content && (
            <span className="text-muted-foreground/70"> — {event.content}</span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 이슈 상태 변경
  if (event.type === "status_change") {
    const isReopened = event.content === "open";
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {isReopened ? (
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          )}
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {isReopened
            ? " 님이 이슈를 다시 열었습니다"
            : " 님이 이슈를 닫았습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // CR 상태 변경
  if (event.type === "cr_state_changed") {
    const detail = event.content as { from?: string; to?: string } | null;
    const from = detail?.from?.toUpperCase() ?? "";
    const to = detail?.to?.toUpperCase() ?? "";

    let message: string;
    let icon: React.ReactNode;

    if (from === "CLOSED" && to === "SUBMITTED") {
      message = " 님이 변경 요청을 다시 제출했습니다";
      icon = (
        <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    } else if (to === "DRAFT") {
      message = " 님이 변경 요청을 초안상태로 변경했습니다";
      icon = <FilePen className="h-4 w-4 text-muted-foreground" />;
    } else if (to === "SUBMITTED") {
      message = " 님이 변경 요청을 제출했습니다";
      icon = <FilePen className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    } else if (to === "MERGED") {
      message = " 님이 변경 요청을 반영했습니다";
      icon = (
        <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      );
    } else if (to === "CLOSED") {
      message = " 님이 변경 요청을 닫았습니다";
      icon = (
        <CheckCircle2 className="h-4 w-4 text-red-500 dark:text-red-400" />
      );
    } else {
      message = " 님이 변경 요청 상태를 변경했습니다";
      icon = <FilePen className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }

    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {icon}
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {message}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 이슈/CR 생성
  if (event.type === "issue_created") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <FilePen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 이슈를 생성했습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // CR 생성
  if (event.type === "cr_created") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <FilePen className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 변경 요청을 생성했습니다"}
          {event.issueTitle && (
            <span className="text-muted-foreground/70">
              {" "}
              — #{event.issueNumber} {event.issueTitle}
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // CR 머지
  if (event.type === "cr_merged") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 변경 요청을 반영했습니다"}
          {event.issueTitle && (
            <span className="text-muted-foreground/70">
              {" "}
              — {event.issueTitle}
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 부품 변경
  if (event.type === "part_added" || event.type === "part_removed") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 부품을 변경했습니다"}
          {(event.addedPartCount ?? 0) > 0 && (
            <span className="ml-1">
              {event.addedPartNumbers ? (
                <TruncatedNames items={event.addedPartNumbers} suffix="추가" />
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {event.addedPartCount}건
                  </span>{" "}
                  추가
                </>
              )}
            </span>
          )}
          {(event.removedPartCount ?? 0) > 0 && (
            <span className="ml-1">
              {event.removedPartNumbers ? (
                <TruncatedNames
                  items={event.removedPartNumbers}
                  suffix="제거"
                />
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {event.removedPartCount}건
                  </span>{" "}
                  제거
                </>
              )}
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 라벨 변경 (added/removed 배열)
  if (event.type === "labels_changed") {
    const added = event.addedLabels ?? [];
    const removed = event.removedLabels ?? [];
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 라벨을 변경했습니다"}
          {added.length > 0 && (
            <span className="ml-1.5">
              {added.map((l) => (
                <LabelBadge
                  key={l.name}
                  label={l.name}
                  colorHex={l.color}
                  design="soft-4"
                  className="mx-0.5"
                />
              ))}
              {" 추가"}
            </span>
          )}
          {removed.length > 0 && (
            <span className="ml-1.5">
              {removed.map((l) => (
                <LabelBadge
                  key={l.name}
                  label={l.name}
                  colorHex={l.color}
                  design="soft-4"
                  className="mx-0.5 line-through opacity-60"
                />
              ))}
              {" 제거"}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 담당자 변경
  if (event.type === "assigned") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 담당자를 변경했습니다"}
          {event.addedNames && event.addedNames.length > 0 && (
            <span className="ml-1">
              <span className="font-medium text-foreground">
                {event.addedNames.join(", ")}
              </span>{" "}
              추가
            </span>
          )}
          {event.removedNames && event.removedNames.length > 0 && (
            <span className="ml-1">
              <span className="font-medium text-foreground">
                {event.removedNames.join(", ")}
              </span>{" "}
              제거
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 검토자 변경
  if (event.type === "reviewer_changed") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 검토자를 변경했습니다"}
          {event.addedNames && event.addedNames.length > 0 && (
            <span className="ml-1">
              <span className="font-medium text-foreground">
                {event.addedNames.join(", ")}
              </span>{" "}
              추가
            </span>
          )}
          {event.removedNames && event.removedNames.length > 0 && (
            <span className="ml-1">
              <span className="font-medium text-foreground">
                {event.removedNames.join(", ")}
              </span>{" "}
              제거
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 파일 추가
  if (event.type === "file_attached") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 파일을 추가했습니다 "}
          {event.fileNames && event.fileNames.length > 0 ? (
            <TruncatedNames items={event.fileNames} />
          ) : (
            <span className="font-medium text-foreground">
              {event.fileCount ?? 1}건
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 파일 제거
  if (event.type === "file_detached") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 파일을 제거했습니다 "}
          {event.fileNames && event.fileNames.length > 0 && (
            <TruncatedNames items={event.fileNames} />
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 변경 요청 연결/해제 (이슈 → CR)
  if (event.type === "cr_changed") {
    const isRemoval = (event.linkedIssueCount ?? 0) < 0;
    const IconComp = isRemoval ? Unlink : LinkIcon;
    const label = isRemoval
      ? "변경 요청을 해제했습니다"
      : "변경 요청을 연결했습니다";
    return (
      <div className="py-1.5 ml-11">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="flex-1 text-sm text-muted-foreground">
            <ActivityAuthor author={event.author} />
            {" 님이 "}
            {label}
          </p>
          <span className="text-xs text-muted-foreground/60">
            {timeAgo(event.createdAt)}
          </span>
        </div>
        {event.linkedIssues && event.linkedIssues.length > 0 && (
          <div className="mt-1 ml-7 space-y-0.5">
            {event.linkedIssues.map((i) => (
              <ClickableIssueLink
                key={i.number}
                item={i}
                onNavigate={onNavigate}
                block
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // CR 이슈 연결
  if (event.type === "cr_issue_linked") {
    return (
      <div className="py-1.5 ml-11">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="flex-1 text-sm text-muted-foreground">
            <ActivityAuthor author={event.author} />
            {" 님이 연결했습니다"}
          </p>
          <span className="text-xs text-muted-foreground/60">
            {timeAgo(event.createdAt)}
          </span>
        </div>
        {event.linkedIssues && event.linkedIssues.length > 0 && (
          <div className="mt-1 ml-7 space-y-0.5">
            {event.linkedIssues.map((i) => (
              <ClickableIssueLink
                key={i.number}
                item={i}
                onNavigate={onNavigate}
                block
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // CR 이슈 해제
  if (event.type === "cr_issue_unlinked") {
    return (
      <div className="py-1.5 ml-11">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <Unlink className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="flex-1 text-sm text-muted-foreground">
            <ActivityAuthor author={event.author} />
            {" 님이 해제했습니다"}
          </p>
          <span className="text-xs text-muted-foreground/60">
            {timeAgo(event.createdAt)}
          </span>
        </div>
        {event.linkedIssues && event.linkedIssues.length > 0 && (
          <div className="mt-1 ml-7 space-y-0.5">
            {event.linkedIssues.map((i) => (
              <ClickableIssueLink
                key={i.number}
                item={i}
                onNavigate={onNavigate}
                block
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 다른 이슈/CR에서 멘션됨
  if (event.type === "issue_mentioned") {
    const source = event.linkedIssues?.[0];
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          {source && (
            <ClickableIssueLink item={source} onNavigate={onNavigate} />
          )}
          {event.isComment
            ? " 의 댓글에서 언급했습니다"
            : " 의 본문에서 언급했습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 참조
  if (event.type === "referenced") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 "}
          <span className="font-medium text-primary">{event.ref}</span>
          {" 을(를) 참조했습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  return null;
}

// ============================================================
// 변경 요청 상세 뷰 (탭 내 임베딩용)
// ============================================================

export interface ChangeRequestDetailProps {
  cr: ChangeRequest;
  onBack: () => void;
  onSyncAssignees?: (userIds: string[]) => void;
  availableMembers?: { id: string; name: string; email: string }[];
  selectedAssigneeIds?: string[];
  onRequestMembers?: () => void;
  onSyncReviewers?: (userIds: string[]) => void;
  selectedReviewerIds?: string[];
  onSyncLabels?: (labelIds: string[]) => void;
  onAddComment?: (body: Record<string, unknown>) => void;
  isCommentPending?: boolean;
  availableLabels?: { id: string; name: string; colorHex: string }[];
  selectedLabelIds?: string[];
  onRequestLabels?: () => void;
  onSyncParts?: (partIds: string[]) => void;
  onRequestParts?: () => void;
  searchedParts?: { id: string; partNumber: string; name: string | null }[];
  selectedPartIds?: string[];
  onPartsSearchChange?: (search: string) => void;
  isPartsSearching?: boolean;
  onUploadFiles?: (files: File[]) => void;
  onDeleteFile?: (fileId: string) => void;
  isFileUploading?: boolean;
  isMetaUpdating?: boolean;
  onCloseIssue?: () => void;
  onReopenIssue?: () => void;
  isClosingIssue?: boolean;
  isReopeningIssue?: boolean;
  onCloseChange?: () => void;
  onMergeChange?: () => void;
  onSubmitChange?: () => void;
  onReopenChange?: () => void;
  isClosingChange?: boolean;
  isMergingChange?: boolean;
  isSubmittingChange?: boolean;
  isReopeningChange?: boolean;
  /** 이슈 → CR 생성 네비게이션 */
  onCreateLinkedChange?: () => void;
  /** 이슈 → 변경 요청 연결 동기화 */
  onSyncLinkedChanges?: (crIds: string[]) => void;
  /** 변경 요청 lookup 결과 */
  availableChanges?: {
    id: string;
    number: number;
    title: string;
    crState: string;
  }[];
  /** 현재 연결된 CR ID 목록 */
  linkedChangeIds?: string[];
  /** 변경 요청 lookup lazy fetch 트리거 */
  onRequestChanges?: () => void;
  /** CR → 이슈 연결 동기화 */
  onSyncLinkedIssues?: (issueIds: string[]) => void;
  /** CR → 개별 이슈 해제 */
  onUnlinkIssue?: (issueId: string) => void;
  /** 이슈 연결 Popover 데이터 */
  availableIssues?: {
    id: string;
    number: number;
    title: string;
    state: string;
  }[];
  linkedIssueIds?: string[];
  onRequestIssues?: () => void;
  /** 연결된 변경 요청 클릭 시 이동 */
  onNavigateToChange?: (changeNumber: number) => void;
  /** 연결된 이슈 클릭 시 이동 */
  onNavigateToIssue?: (issueNumber: number) => void;
  /** 제목/본문 수정 콜백 (Promise 반환) */
  onUpdateTitleAndBody?: (
    title: string,
    body: Record<string, unknown> | null,
  ) => Promise<void>;
  /** 댓글 수정 콜백 (Promise 반환) */
  onUpdateComment?: (
    commentId: string,
    body: Record<string, unknown>,
  ) => Promise<void>;
  /** 현재 로그인 사용자 ID */
  currentUserId?: string;
}

export function ChangeRequestDetail({
  cr,
  onBack,
  onSyncAssignees,
  availableMembers = [],
  selectedAssigneeIds = [],
  onRequestMembers,
  onSyncReviewers,
  selectedReviewerIds = [],
  onSyncLabels,
  onAddComment,
  isCommentPending,
  availableLabels = [],
  selectedLabelIds = [],
  onRequestLabels,
  onSyncParts,
  onRequestParts,
  searchedParts = [],
  selectedPartIds = [],
  onPartsSearchChange,
  isPartsSearching,
  onUploadFiles,
  onDeleteFile,
  isFileUploading,
  isMetaUpdating,
  onCloseIssue,
  onReopenIssue,
  isClosingIssue,
  isReopeningIssue,
  onCloseChange,
  onMergeChange,
  onSubmitChange,
  onReopenChange,
  isClosingChange,
  isMergingChange,
  isSubmittingChange,
  isReopeningChange,
  onCreateLinkedChange,
  onSyncLinkedChanges,
  availableChanges = [],
  linkedChangeIds = [],
  onRequestChanges,
  onSyncLinkedIssues,
  onUnlinkIssue,
  availableIssues = [],
  linkedIssueIds = [],
  onRequestIssues,
  onNavigateToChange,
  onNavigateToIssue,
  onUpdateTitleAndBody,
  onUpdateComment,
  currentUserId,
}: ChangeRequestDetailProps) {
  const backLabel = cr.type === "pr" ? "변경 요청" : "이슈";
  const commentCount = cr.timeline.filter((e) => e.type === "comment").length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 멘션 클릭 시 type별 네비게이션 분기
  const handleMentionClick = useCallback(
    (number: number, issueType: "issue" | "change_request") => {
      if (issueType === "change_request") {
        onNavigateToChange?.(number);
      } else {
        onNavigateToIssue?.(number);
      }
    },
    [onNavigateToIssue, onNavigateToChange],
  );

  // 탭 상태 (pr 타입에서만 사용)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: "conversation" | "changes" =
    cr.type === "pr" && searchParams.get("tab") === "changes"
      ? "changes"
      : "conversation";

  const setActiveTab = useCallback(
    (tab: "conversation" | "changes") => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "conversation") {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  // 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(cr.title);
  const editBodyJsonRef = useRef<Record<string, unknown> | null>(null);
  const [editBodyEditorKey, setEditBodyEditorKey] = useState(0);
  const [issuePopoverOpen, setIssuePopoverOpen] = useState(false);
  const [issueQuery, setIssueQuery] = useState("");
  const [draftIssueIds, setDraftIssueIds] = useState<string[]>([]);
  const [changePopoverOpen, setChangePopoverOpen] = useState(false);
  const [changeQuery, setChangeQuery] = useState("");
  const [draftChangeIds, setDraftChangeIds] = useState<string[]>([]);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const commentJsonRef = useRef<Content | null>(null);
  const commentTextRef = useRef("");

  const filteredIssues = availableIssues.filter((issue) => {
    if (!issueQuery.trim()) return true;
    const q = issueQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) || String(issue.number).includes(q)
    );
  });

  const filteredChanges = availableChanges.filter((c) => {
    if (!changeQuery.trim()) return true;
    const q = changeQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || String(c.number).includes(q);
  });

  return (
    <div className="mx-auto max-w-[1160px]">
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel} 목록
      </button>

      {/* 타이틀 */}
      <div>
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={500}
            className="text-xl font-bold"
            autoFocus
          />
        ) : (
          <h2 className="text-xl font-bold text-foreground">
            {cr.title}
            <span className="ml-2 font-normal text-muted-foreground">
              #{cr.number}
            </span>
          </h2>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={STATUS_BADGE_STYLE[cr.status]}>
            <CRStatusIcon cr={cr} size="sm" />
            {STATUS_LABEL[cr.status]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{cr.author}</span>
            {" 님이 "}
            {formatFullDate(cr.createdAt)}
            {" 에 열었습니다"}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            댓글 {commentCount}개
          </span>
        </div>
      </div>

      {/* PR 타입 탭 바 */}
      {cr.type === "pr" && (
        <div className="mt-5 flex gap-1 border-b">
          {(
            [
              { key: "conversation", label: "대화" },
              { key: "changes", label: "변경 내용" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* 변경 내용 탭 */}
      {cr.type === "pr" && activeTab === "changes" && (
        <div className="mt-6">
          <ChangesDiffTab
            changes={MOCK_CR_CHANGES[cr.id] ?? MOCK_CR_CHANGES["cr1"]}
          />
        </div>
      )}

      {/* 콘텐츠 영역: 2컬럼 (타임라인 | 사이드바) */}
      {(cr.type !== "pr" || activeTab === "conversation") && (
        <div className="mt-6 flex gap-6">
          {/* 왼쪽: 타임라인 */}
          <div className="min-w-0 flex-1 space-y-4">
            {/* 본문 (첫 번째 댓글) */}
            {isEditing ? (
              <div>
                <TiptapEditor
                  key={editBodyEditorKey}
                  content={cr.description}
                  editable
                  minHeight={100}
                  onChangeJson={(json) => {
                    editBodyJsonRef.current = json as Record<string, unknown>;
                  }}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSaving || !editTitle.trim()}
                    onClick={async () => {
                      const bodyToSave =
                        editBodyJsonRef.current ??
                        (typeof cr.description === "object"
                          ? (cr.description as Record<string, unknown>)
                          : null);
                      setIsSaving(true);
                      try {
                        await onUpdateTitleAndBody?.(
                          editTitle.trim(),
                          bodyToSave,
                        );
                        setIsEditing(false);
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                  >
                    {isSaving && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <UserAvatar name={cr.author} className="h-8 w-8 shrink-0" />
                <div className="min-w-0 flex-1 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
                    <span className="text-sm font-medium text-foreground">
                      {cr.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(cr.createdAt)}
                    </span>
                    {cr.isModified && (
                      <span className="text-xs text-muted-foreground">
                        · 수정됨
                      </span>
                    )}
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      작성자
                    </Badge>
                    {onUpdateTitleAndBody && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          setEditTitle(cr.title);
                          editBodyJsonRef.current = null;
                          setEditBodyEditorKey((k) => k + 1);
                          setIsEditing(true);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <TiptapEditor
                      content={cr.description}
                      editable={false}
                      hideToolbar
                      minHeight={0}
                      className="border-0 bg-transparent"
                      onIssueMentionClick={handleMentionClick}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 타임라인 이벤트 */}
            {cr.timeline.map((event) =>
              event.type === "comment" ? (
                <TimelineCommentItem
                  key={event.id}
                  event={event}
                  canEdit={!!currentUserId && event.authorId === currentUserId}
                  onUpdate={onUpdateComment}
                  onIssueMentionClick={handleMentionClick}
                />
              ) : (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  onNavigate={handleMentionClick}
                />
              ),
            )}

            {/* 구분선 */}
            <div className="border-t" />

            {/* 댓글 입력 */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">나</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <TiptapEditor
                  key={commentEditorKey}
                  placeholder="댓글을 작성하세요..."
                  minHeight={100}
                  onChangeJson={(json) => {
                    commentJsonRef.current = json;
                  }}
                  onChangeText={(text) => {
                    commentTextRef.current = text;
                  }}
                />
                <div className="mt-3 flex items-center justify-between">
                  <div />
                  <div className="flex gap-2">
                    {cr.type === "issue" &&
                      cr.status === "open" &&
                      onCloseIssue && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isClosingIssue}
                          onClick={onCloseIssue}
                        >
                          {isClosingIssue ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          이슈 닫기
                        </Button>
                      )}
                    {cr.type === "issue" &&
                      cr.status === "closed" &&
                      onReopenIssue && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReopeningIssue}
                          onClick={onReopenIssue}
                        >
                          {isReopeningIssue ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          이슈 다시 열기
                        </Button>
                      )}
                    {/* CR(변경 요청) 상태별 버튼 */}
                    {cr.type === "pr" &&
                      cr.status === "draft" &&
                      onCloseChange && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isClosingChange}
                          onClick={onCloseChange}
                        >
                          {isClosingChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          변경 요청 닫기
                        </Button>
                      )}
                    {cr.type === "pr" &&
                      cr.status === "draft" &&
                      onSubmitChange && (
                        <Button
                          size="sm"
                          disabled={isSubmittingChange}
                          onClick={onSubmitChange}
                        >
                          {isSubmittingChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileCheck className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          제출
                        </Button>
                      )}
                    {cr.type === "pr" &&
                      cr.status === "open" &&
                      onCloseChange && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isClosingChange}
                          onClick={onCloseChange}
                        >
                          {isClosingChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          변경 요청 닫기
                        </Button>
                      )}
                    {cr.type === "pr" &&
                      cr.status === "open" &&
                      onMergeChange && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isMergingChange}
                          onClick={onMergeChange}
                        >
                          {isMergingChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          변경 반영
                        </Button>
                      )}
                    {cr.type === "pr" &&
                      cr.status === "closed" &&
                      onReopenChange && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isReopeningChange}
                          onClick={onReopenChange}
                        >
                          {isReopeningChange ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          다시 제출
                        </Button>
                      )}
                    <Button
                      size="sm"
                      disabled={isCommentPending}
                      onClick={() => {
                        const json = commentJsonRef.current;
                        const text = commentTextRef.current;
                        if (!text.trim() || !json || !onAddComment) return;
                        onAddComment(json as Record<string, unknown>);
                        commentJsonRef.current = null;
                        commentTextRef.current = "";
                        setCommentEditorKey((k) => k + 1);
                      }}
                    >
                      댓글
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="hidden w-70 shrink-0 lg:block">
            <div className="space-y-5">
              {/* 검토자 — 변경 요청(pr)에서만 표시 */}
              {cr.type === "pr" && (
                <MemberPickerSection
                  label="검토자"
                  applyLabel="검토자 적용"
                  availableMembers={availableMembers}
                  selectedIds={selectedReviewerIds}
                  displayItems={cr.reviewers}
                  onSync={onSyncReviewers}
                  onRequestMembers={onRequestMembers}
                  isUpdating={isMetaUpdating}
                />
              )}

              {/* 담당자 */}
              <MemberPickerSection
                label="담당자"
                applyLabel="담당자 적용"
                availableMembers={availableMembers}
                selectedIds={selectedAssigneeIds}
                displayItems={cr.assignees}
                onSync={onSyncAssignees}
                onRequestMembers={onRequestMembers}
                isUpdating={isMetaUpdating}
              />

              {/* 라벨 */}
              <LabelPickerSection
                availableLabels={availableLabels}
                selectedIds={selectedLabelIds}
                displayLabels={cr.labels}
                onSync={onSyncLabels}
                onRequestLabels={onRequestLabels}
                isUpdating={isMetaUpdating}
              />

              {/* 변경 요청 — 이슈에서만 표시 */}
              {cr.type === "issue" && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      연결된 변경 요청
                    </h3>
                    {onSyncLinkedChanges && (
                      <Popover
                        open={changePopoverOpen}
                        onOpenChange={(open) => {
                          setChangePopoverOpen(open);
                          if (open) {
                            onRequestChanges?.();
                            setDraftChangeIds(linkedChangeIds);
                          } else {
                            setChangeQuery("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Settings className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="end">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">
                              변경 요청 연결
                            </p>
                            <Input
                              value={changeQuery}
                              onChange={(e) => setChangeQuery(e.target.value)}
                              placeholder="번호 또는 제목으로 검색"
                            />
                            <div className="max-h-48 space-y-1 overflow-auto">
                              {filteredChanges.length === 0 ? (
                                <p className="px-1 py-2 text-xs text-muted-foreground">
                                  {changeQuery.trim()
                                    ? "검색 결과가 없습니다."
                                    : "연결 가능한 변경 요청이 없습니다."}
                                </p>
                              ) : (
                                filteredChanges.map((c) => {
                                  const cs = c.crState.toLowerCase();
                                  return (
                                    <label
                                      key={c.id}
                                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                                    >
                                      <Checkbox
                                        checked={draftChangeIds.includes(c.id)}
                                        onCheckedChange={(checked) => {
                                          setDraftChangeIds((prev) => {
                                            if (checked) return [...prev, c.id];
                                            return prev.filter(
                                              (id) => id !== c.id,
                                            );
                                          });
                                        }}
                                      />
                                      {cs === "merged" ? (
                                        <FileCheck className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                                      ) : cs === "closed" ? (
                                        <FileX className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
                                      ) : (
                                        <FilePen className={`h-3.5 w-3.5 shrink-0 ${cs === "draft" ? "text-gray-500 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-foreground">
                                          #{c.number} {c.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {cs === "draft"
                                            ? "초안"
                                            : cs === "submitted" || cs === "open"
                                              ? "제출"
                                              : cs === "merged"
                                                ? "반영"
                                                : "닫힘"}
                                        </p>
                                      </div>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              className="w-full"
                              disabled={isMetaUpdating}
                              onClick={() => {
                                onSyncLinkedChanges(draftChangeIds);
                                setChangePopoverOpen(false);
                                setChangeQuery("");
                              }}
                            >
                              변경 요청 적용
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  {cr.linkedChanges.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {cr.linkedChanges.map((lc) => {
                        const s = lc.state.toLowerCase();
                        return (
                          <button
                            key={lc.id}
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted cursor-pointer"
                            onClick={() => onNavigateToChange?.(lc.number)}
                          >
                            {s === "merged" ? (
                              <FileCheck className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                            ) : s === "closed" ? (
                              <FileX className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
                            ) : (
                              <FilePen className={`h-3.5 w-3.5 shrink-0 ${s === "draft" ? "text-gray-500 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-foreground">
                                #{lc.number} {lc.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {s === "draft"
                                  ? "초안"
                                  : s === "submitted" || s === "open"
                                    ? "제출"
                                    : s === "merged"
                                      ? "반영"
                                      : "닫힘"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground/50">
                      연결된 변경 요청 없음
                    </p>
                  )}
                  {onCreateLinkedChange && (
                    <button
                      type="button"
                      className="mt-2 text-xs text-primary hover:underline cursor-pointer"
                      onClick={onCreateLinkedChange}
                    >
                      변경 요청 생성
                    </button>
                  )}
                </div>
              )}

              {/* 연결된 이슈 — CR(pr)에서만 표시 */}
              {cr.type === "pr" && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      연결된 이슈
                    </h3>
                    {onSyncLinkedIssues && (
                      <Popover
                        open={issuePopoverOpen}
                        onOpenChange={(open) => {
                          setIssuePopoverOpen(open);
                          if (open) {
                            onRequestIssues?.();
                            setDraftIssueIds(linkedIssueIds);
                          } else {
                            setIssueQuery("");
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Settings className="h-3 w-3" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3" align="end">
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-foreground">
                              이슈 연결
                            </p>
                            <Input
                              value={issueQuery}
                              onChange={(e) => setIssueQuery(e.target.value)}
                              placeholder="번호 또는 제목으로 검색"
                            />
                            <div className="max-h-48 space-y-1 overflow-auto">
                              {filteredIssues.length === 0 ? (
                                <p className="px-1 py-2 text-xs text-muted-foreground">
                                  {issueQuery.trim()
                                    ? "검색 결과가 없습니다."
                                    : "연결 가능한 이슈가 없습니다."}
                                </p>
                              ) : (
                                filteredIssues.map((issue) => (
                                  <label
                                    key={issue.id}
                                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                                  >
                                    <Checkbox
                                      checked={draftIssueIds.includes(issue.id)}
                                      onCheckedChange={(checked) => {
                                        setDraftIssueIds((prev) => {
                                          if (checked)
                                            return [...prev, issue.id];
                                          return prev.filter(
                                            (id) => id !== issue.id,
                                          );
                                        });
                                      }}
                                    />
                                    {issue.state.toLowerCase() === "open" ? (
                                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium text-foreground">
                                        #{issue.number} {issue.title}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {issue.state.toLowerCase() === "open"
                                          ? "열림"
                                          : "닫힘"}
                                      </p>
                                    </div>
                                  </label>
                                ))
                              )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              className="w-full"
                              disabled={isMetaUpdating}
                              onClick={() => {
                                onSyncLinkedIssues(draftIssueIds);
                                setIssuePopoverOpen(false);
                                setIssueQuery("");
                              }}
                            >
                              이슈 적용
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  {cr.linkedIssues.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {cr.linkedIssues.map((li) => {
                        const s = li.state.toLowerCase();
                        return (
                          <div
                            key={li.id}
                            className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                          >
                            {s === "open" ? (
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" />
                            )}
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left cursor-pointer"
                              onClick={() => onNavigateToIssue?.(li.number)}
                            >
                              <p className="truncate text-xs font-medium text-foreground">
                                #{li.number} {li.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {s === "open" ? "열림" : "닫힘"}
                              </p>
                            </button>
                            {onUnlinkIssue && (
                              <button
                                type="button"
                                className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUnlinkIssue(li.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground/50">
                      연결된 이슈 없음
                    </p>
                  )}
                </div>
              )}

              {/* 관련 부품 */}
              <PartPickerSection
                searchedParts={searchedParts}
                selectedIds={selectedPartIds}
                displayParts={cr.relatedParts}
                onSync={onSyncParts}
                onRequestParts={onRequestParts}
                onSearchChange={onPartsSearchChange}
                isSearching={isPartsSearching}
                isUpdating={isMetaUpdating}
              />

              {/* 첨부파일 */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    첨부파일
                    {cr.attachments.length > 0 && (
                      <span className="ml-1 text-muted-foreground/50">
                        ({cr.attachments.length})
                      </span>
                    )}
                  </h3>
                  {onUploadFiles && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length > 0) onUploadFiles(files);
                          e.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                        disabled={isFileUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isFileUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </button>
                    </>
                  )}
                </div>
                {cr.attachments.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {cr.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                      >
                        <AttachmentIcon type={file.type} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-foreground">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {file.size}
                          </p>
                        </div>
                        {onDeleteFile && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="hidden shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  첨부파일 삭제
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  &ldquo;{file.name}&rdquo; 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                  취소
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => onDeleteFile(file.id)}
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground/50">
                    첨부된 파일 없음
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
