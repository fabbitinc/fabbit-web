import { useState, useRef, useCallback } from "react";
import type { Content } from "@tiptap/react";
import {
  CheckCircle2,
  XCircle,
  FilePen,
  FileCheck,
  FileX,
  MessageSquare,
  Tag,
  UserPlus,
  Package,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { LabelBadge } from "@fabbit/ui";
import {
  type ChangeRequest,
  type TimelineEvent,
  type TimelineAuthor,
  type CRAttachment,
} from "./changeRequestMock";

// ============================================================
// 헬퍼
// ============================================================

function getInitials(name: string): string {
  return name.slice(0, 1);
}

function ActivityAuthor({ author }: { author: TimelineAuthor }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle font-medium text-foreground">
      <Avatar className="h-4 w-4">
        {author.profileImageUrl && (
          <AvatarImage src={author.profileImageUrl} alt={author.name} />
        )}
        <AvatarFallback className="text-[8px]">
          {getInitials(author.name)}
        </AvatarFallback>
      </Avatar>
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
  open: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  merged:
    "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-400",
  closed:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400",
} as const;

const STATUS_LABEL = {
  open: "열림",
  merged: "반영됨",
  closed: "닫힘",
} as const;

// ============================================================
// 타임라인 이벤트 아이템
// ============================================================

function TimelineEventItem({
  event,
}: {
  event: TimelineEvent;
}) {
  // 댓글
  if (event.type === "comment") {
    const isRichContent = event.content && typeof event.content === "object";
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar className="h-8 w-8 shrink-0">
            {event.author.profileImageUrl && (
              <AvatarImage src={event.author.profileImageUrl} alt={event.author.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(event.author.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
            <span className="text-sm font-medium text-foreground">
              {event.author.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(event.createdAt)}
            </span>
          </div>
          {isRichContent ? (
            <div className="px-4 py-3">
              <TiptapEditor
                content={event.content as Content}
                editable={false}
                hideToolbar
                minHeight={0}
                className="border-0 bg-transparent"
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

  // 상태 변경
  if (event.type === "status_change") {
    const isMerged = event.content === "merged";
    const isReopened = event.content === "open";
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          {isMerged ? (
            <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          ) : isReopened ? (
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          )}
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {isMerged
            ? " 님이 변경을 반영했습니다"
            : isReopened
              ? " 님이 이슈를 다시 열었습니다"
              : " 님이 이슈를 닫았습니다"}
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
            <span className="text-muted-foreground/70"> — {event.issueTitle}</span>
          )}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 부품 연결
  if (event.type === "part_added") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 부품 "}
          <span className="font-medium text-foreground">{event.partCount ?? 0}건</span>
          을 연결했습니다
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 부품 해제
  if (event.type === "part_removed") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Package className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 부품 "}
          <span className="font-medium text-foreground">{event.partCount ?? 0}건</span>
          을 해제했습니다
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

  // 담당자 배정
  if (event.type === "assigned") {
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={event.author} />
          {" 님이 "}
          <span className="font-medium text-foreground">{event.assignee}</span>
          {" 님을 담당자로 배정했습니다"}
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
          {" 님이 "}
          <span className="font-medium text-foreground">{event.assignee}</span>
          {" 님을 검토자로 변경했습니다"}
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
}: ChangeRequestDetailProps) {
  const backLabel = cr.type === "pr" ? "변경 반영" : "이슈";
  const commentCount = cr.timeline.filter((e) => e.type === "comment").length;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>([]);
  const [reviewerPopoverOpen, setReviewerPopoverOpen] = useState(false);
  const [reviewerQuery, setReviewerQuery] = useState("");
  const [draftReviewerIds, setDraftReviewerIds] = useState<string[]>([]);
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [draftLabelIds, setDraftLabelIds] = useState<string[]>([]);
  const [partPopoverOpen, setPartPopoverOpen] = useState(false);
  const [partQuery, setPartQuery] = useState("");
  const [draftPartIds, setDraftPartIds] = useState<string[]>([]);
  const partDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const handlePartQueryChange = useCallback((value: string) => {
    setPartQuery(value);
    if (partDebounceRef.current) clearTimeout(partDebounceRef.current);
    partDebounceRef.current = setTimeout(() => {
      onPartsSearchChange?.(value);
    }, 300);
  }, [onPartsSearchChange]);
  const [commentEditorKey, setCommentEditorKey] = useState(0);
  const commentJsonRef = useRef<Content | null>(null);
  const commentTextRef = useRef("");

  const filteredMembers = availableMembers.filter((m) => {
    if (!memberQuery.trim()) return true;
    const q = memberQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const filteredReviewerMembers = availableMembers.filter((m) => {
    if (!reviewerQuery.trim()) return true;
    const q = reviewerQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const filteredLabels = availableLabels.filter((label) => {
    if (!labelQuery.trim()) return true;
    return label.name.toLowerCase().includes(labelQuery.toLowerCase());
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
        <h2 className="text-xl font-bold text-foreground">
          {cr.title}
          <span className="ml-2 font-normal text-muted-foreground">
            #{cr.number}
          </span>
        </h2>

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

      {/* 콘텐츠 영역: 2컬럼 (타임라인 | 사이드바) */}
      <div className="mt-6 flex gap-6">
        {/* 왼쪽: 타임라인 */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* 본문 (첫 번째 댓글) */}
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {getInitials(cr.author)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 rounded-lg border bg-card">
              <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
                <span className="text-sm font-medium text-foreground">
                  {cr.author}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(cr.createdAt)}
                </span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  작성자
                </Badge>
              </div>
              <div className="px-4 py-3">
                <TiptapEditor
                  content={cr.description}
                  editable={false}
                  hideToolbar
                  minHeight={0}
                  className="border-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* 타임라인 이벤트 */}
          {cr.timeline.map((event) => (
            <TimelineEventItem
              key={event.id}
              event={event}
            />
          ))}

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
                  {cr.status === "open" && (
                    <Button size="sm" variant="outline">
                      {cr.type === "pr" ? "승인" : "이슈 닫기"}
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
            {/* 검토자 — 변경 반영(pr)에서만 표시 */}
            {cr.type === "pr" && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-muted-foreground">검토자</h3>
                  {onSyncReviewers && (
                    <Popover
                      open={reviewerPopoverOpen}
                      onOpenChange={(open) => {
                        setReviewerPopoverOpen(open);
                        if (open) {
                          onRequestMembers?.();
                          setDraftReviewerIds(selectedReviewerIds);
                        } else {
                          setReviewerQuery("");
                        }
                      }}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="end">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-foreground">검토자 추가</p>
                          <Input
                            value={reviewerQuery}
                            onChange={(e) => setReviewerQuery(e.target.value)}
                            placeholder="멤버 검색"
                          />
                          <div className="max-h-48 space-y-1 overflow-auto">
                            {filteredReviewerMembers.length === 0 ? (
                              <p className="px-1 py-2 text-xs text-muted-foreground">추가 가능한 멤버가 없습니다.</p>
                            ) : (
                              filteredReviewerMembers.map((member) => (
                                <label
                                  key={member.id}
                                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                                >
                                  <Checkbox
                                    checked={draftReviewerIds.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      setDraftReviewerIds((prev) => {
                                        if (checked) return [...prev, member.id];
                                        return prev.filter((id) => id !== member.id);
                                      });
                                    }}
                                  />
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-foreground">{member.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
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
                              onSyncReviewers(draftReviewerIds);
                              setReviewerPopoverOpen(false);
                              setReviewerQuery("");
                            }}
                          >
                            검토자 적용
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="mt-2 space-y-2">
                  {cr.reviewers.map((reviewer) => (
                    <div key={reviewer.id ?? reviewer.name} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        {reviewer.profileImageUrl && (
                          <AvatarImage src={reviewer.profileImageUrl} alt={reviewer.name} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(reviewer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{reviewer.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 담당자 */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">담당자</h3>
                {onSyncAssignees && (
                  <Popover
                    open={memberPopoverOpen}
                    onOpenChange={(open) => {
                      setMemberPopoverOpen(open);
                      if (open) {
                        onRequestMembers?.();
                        setDraftAssigneeIds(selectedAssigneeIds);
                      } else {
                        setMemberQuery("");
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" align="end">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">담당자 추가</p>
                        <Input
                          value={memberQuery}
                          onChange={(e) => setMemberQuery(e.target.value)}
                          placeholder="멤버 검색"
                        />
                        <div className="max-h-48 space-y-1 overflow-auto">
                          {filteredMembers.length === 0 ? (
                            <p className="px-1 py-2 text-xs text-muted-foreground">추가 가능한 멤버가 없습니다.</p>
                          ) : (
                            filteredMembers.map((member) => (
                              <label
                                key={member.id}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                              >
                                <Checkbox
                                  checked={draftAssigneeIds.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    setDraftAssigneeIds((prev) => {
                                      if (checked) return [...prev, member.id];
                                      return prev.filter((id) => id !== member.id);
                                    });
                                  }}
                                />
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm text-foreground">{member.name}</p>
                                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
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
                            onSyncAssignees(draftAssigneeIds);
                            setMemberPopoverOpen(false);
                            setMemberQuery("");
                          }}
                        >
                          담당자 적용
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {cr.assignees.map((assignee) => (
                  <div key={assignee.id ?? assignee.name} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {assignee.profileImageUrl && (
                        <AvatarImage src={assignee.profileImageUrl} alt={assignee.name} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{assignee.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 라벨 */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
                {onSyncLabels && (
                  <Popover
                    open={labelPopoverOpen}
                    onOpenChange={(open) => {
                      setLabelPopoverOpen(open);
                      if (open) {
                        onRequestLabels?.();
                        setDraftLabelIds(selectedLabelIds);
                      } else {
                        setLabelQuery("");
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" align="end">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">라벨 추가</p>
                        <Input
                          value={labelQuery}
                          onChange={(e) => setLabelQuery(e.target.value)}
                          placeholder="라벨 검색"
                        />
                        <div className="max-h-48 space-y-1 overflow-auto">
                          {filteredLabels.length === 0 ? (
                            <p className="px-1 py-2 text-xs text-muted-foreground">추가 가능한 라벨이 없습니다.</p>
                          ) : (
                            filteredLabels.map((label) => (
                              <label
                                key={label.id}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                              >
                                <Checkbox
                                  checked={draftLabelIds.includes(label.id)}
                                  onCheckedChange={(checked) => {
                                    setDraftLabelIds((prev) => {
                                      if (checked) return [...prev, label.id];
                                      return prev.filter((id) => id !== label.id);
                                    });
                                  }}
                                />
                                <LabelBadge label={label.name} colorHex={label.colorHex} size="sm" />
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
                            onSyncLabels?.(draftLabelIds);
                            setLabelPopoverOpen(false);
                            setLabelQuery("");
                          }}
                        >
                          라벨 적용
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cr.labels.map((l) => (
                  <LabelBadge key={l.id ?? l.name} label={l.name} colorHex={l.colorHex} size="md" />
                ))}
              </div>
            </div>

            {/* 관련 부품 */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">
                  관련 부품
                </h3>
                {onSyncParts && (
                  <Popover
                    open={partPopoverOpen}
                    onOpenChange={(open) => {
                      setPartPopoverOpen(open);
                      if (open) {
                        onRequestParts?.();
                        setDraftPartIds(selectedPartIds);
                        setPartQuery("");
                        onPartsSearchChange?.("");
                      } else {
                        setPartQuery("");
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="end">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-foreground">부품 추가</p>
                        <div className="relative">
                          <Input
                            value={partQuery}
                            onChange={(e) => handlePartQueryChange(e.target.value)}
                            placeholder="부품번호 또는 이름으로 검색"
                          />
                          {isPartsSearching && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="max-h-48 space-y-1 overflow-auto">
                          {searchedParts.length === 0 ? (
                            <p className="px-1 py-2 text-xs text-muted-foreground">
                              {partQuery.trim() ? "검색 결과가 없습니다." : "프로젝트에 연결된 부품이 없습니다."}
                            </p>
                          ) : (
                            searchedParts.map((part) => (
                              <label
                                key={part.id}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                              >
                                <Checkbox
                                  checked={draftPartIds.includes(part.id)}
                                  onCheckedChange={(checked) => {
                                    setDraftPartIds((prev) => {
                                      if (checked) return [...prev, part.id];
                                      return prev.filter((id) => id !== part.id);
                                    });
                                  }}
                                />
                                <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium text-foreground">
                                    {part.partNumber}
                                  </p>
                                  {part.name && (
                                    <p className="truncate text-[11px] text-muted-foreground">
                                      {part.name}
                                    </p>
                                  )}
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
                            onSyncParts(draftPartIds);
                            setPartPopoverOpen(false);
                            setPartQuery("");
                          }}
                        >
                          부품 적용
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {cr.relatedParts.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {cr.relatedParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5"
                    >
                      <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {part.partNumber}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {part.name}
                        </p>
                      </div>
                      {part.category && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px] py-0 px-1.5"
                        >
                          {part.category}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground/50">
                  연결된 부품 없음
                </p>
              )}
            </div>

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
                        <button
                          type="button"
                          className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                          onClick={() => onDeleteFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
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
    </div>
  );
}
