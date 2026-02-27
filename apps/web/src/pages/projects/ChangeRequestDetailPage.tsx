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
  Paperclip,
  FileText,
  FileSpreadsheet,
  Image,
  File,
  Box,
  Plus,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import {
  type ChangeRequest,
  type TimelineEvent,
  type CRAttachment,
} from "./changeRequestMock";

// ============================================================
// 헬퍼
// ============================================================

function getInitials(name: string): string {
  return name.slice(0, 1);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
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

function TimelineEventItem({ event }: { event: TimelineEvent }) {
  // 댓글
  if (event.type === "comment") {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(event.author)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
            <span className="text-sm font-medium text-foreground">
              {event.author}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(event.createdAt)}
            </span>
          </div>
          <div className="px-4 py-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {event.content}
          </div>
        </div>
      </div>
    );
  }

  // 리뷰 승인
  if (event.type === "review_approved") {
    return (
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
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
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
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
    return (
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          {isMerged ? (
            <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          )}
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
          {isMerged ? " 님이 변경을 반영했습니다" : " 님이 이슈를 닫았습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 라벨
  if (event.type === "label_added" || event.type === "label_removed") {
    return (
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
          {" 님이 라벨 "}
          <Badge variant="secondary" className="mx-0.5 text-[10px] py-0 px-1.5">
            {event.label}
          </Badge>
          {event.type === "label_added"
            ? "을(를) 추가했습니다"
            : "을(를) 제거했습니다"}
        </p>
        <span className="text-xs text-muted-foreground/60">
          {timeAgo(event.createdAt)}
        </span>
      </div>
    );
  }

  // 담당자 배정
  if (event.type === "assigned") {
    return (
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
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

  // 참조
  if (event.type === "referenced") {
    return (
      <div className="flex items-center gap-3 py-1.5 pl-1">
        <div className="flex h-8 w-8 items-center justify-center">
          <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{event.author}</span>
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
}

export function ChangeRequestDetail({ cr, onBack }: ChangeRequestDetailProps) {
  const backLabel = cr.type === "pr" ? "변경 반영" : "이슈";
  const commentCount = cr.timeline.filter((e) => e.type === "comment").length;

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
              <div className="px-4 py-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {cr.description}
              </div>
            </div>
          </div>

          {/* 타임라인 이벤트 */}
          {cr.timeline.map((event) => (
            <TimelineEventItem key={event.id} event={event} />
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
                placeholder="댓글을 작성하세요..."
                minHeight={100}
              />
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-muted-foreground"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span className="text-xs">파일 첨부</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  {cr.status === "open" && (
                    <Button size="sm" variant="outline">
                      {cr.type === "pr" ? "승인" : "닫기"}
                    </Button>
                  )}
                  <Button size="sm">댓글</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 사이드바 */}
        <div className="hidden w-70 shrink-0 lg:block">
          <div className="space-y-5">
            {/* 담당자 */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                담당자
              </h3>
              <div className="mt-2 space-y-2">
                {cr.assignees.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 라벨 */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                라벨
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cr.labels.map((l) => (
                  <span
                    key={l.name}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${l.color}`}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 유형 */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                유형
              </h3>
              <div className="mt-2 flex items-center gap-1.5">
                <CRStatusIcon cr={cr} size="sm" />
                <span className="text-sm text-foreground">
                  {cr.type === "pr" ? "변경 반영" : "이슈"}
                </span>
              </div>
            </div>

            {/* 생성일 */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                생성일
              </h3>
              <p className="mt-1 text-sm text-foreground">
                {formatFullDate(cr.createdAt)}
              </p>
            </div>

            {/* 관련 부품 */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">
                  관련 부품
                </h3>
                <button className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {cr.relatedParts.length > 0 ? (
                <div className="mt-2 space-y-1.5">
                  {cr.relatedParts.map((part) => (
                    <button
                      key={part.partNumber}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
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
                    </button>
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
                <button className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {cr.attachments.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {cr.attachments.map((file) => (
                    <button
                      key={file.id}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
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
                    </button>
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
