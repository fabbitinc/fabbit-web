import type { ReactNode } from "react";
import {
  CheckCircle2,
  FileCheck,
  FilePen,
  LinkIcon,
  MessageSquare,
  Package,
  Paperclip,
  Tag,
  Unlink,
  UserPlus,
  XCircle,
} from "lucide-react";
import { LabelBadge, Tooltip, TooltipContent, TooltipTrigger, UserAvatar } from "@fabbit/ui";
import {
  EngineeringChangeStatusIcon,
  IssueStatusIcon,
} from "./work-item-status";

// ── 타입 ──────────────────────────────────────────────────

export type TimelineEventType =
  | "comment"
  | "review_approved"
  | "review_changes_requested"
  | "status_change"
  | "labels_changed"
  | "assigned"
  | "reviewer_changed"
  | "referenced"
  | "issue_created"
  | "cr_created"
  | "cr_merged"
  | "cr_state_changed"
  | "part_added"
  | "part_removed"
  | "file_attached"
  | "file_detached"
  | "cr_issue_linked"
  | "cr_issue_unlinked"
  | "cr_changed"
  | "issue_mentioned";

export interface TimelineEventAuthor {
  name: string;
  profileImageUrl?: string | null;
}

export interface TimelineEventData {
  id: string;
  type: TimelineEventType;
  author: TimelineEventAuthor;
  createdAtLabel: string;
  content?: string | Record<string, unknown> | null;
  assignee?: string;
  addedNames?: string[];
  removedNames?: string[];
  ref?: string;
  issueNumber?: number;
  issueTitle?: string;
  addedPartCount?: number;
  removedPartCount?: number;
  addedPartNumbers?: string[];
  removedPartNumbers?: string[];
  fileCount?: number;
  fileNames?: string[];
  linkedIssueCount?: number;
  linkedIssues?: { number: number; title: string; type?: "issue" | "engineering_change" }[];
  isComment?: boolean;
  addedLabels?: { name: string; color: string }[];
  removedLabels?: { name: string; color: string }[];
}

export interface TimelineEventItemProps {
  event: TimelineEventData;
  onNavigate?: (number: number, type: "issue" | "engineering_change") => void;
}

// ── 내부 헬퍼 ────────────────────────────────────────────

function ActivityAuthor({ author }: { author: TimelineEventAuthor }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle font-medium text-foreground">
      <UserAvatar name={author.name} imageUrl={author.profileImageUrl} className="h-4 w-4 text-[8px]" />
      {author.name}
    </span>
  );
}

function TruncatedNames({ items, suffix }: { items: string[]; suffix?: string }) {
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

function ClickableIssueLink({
  item,
  onNavigate,
  block,
}: {
  item: { number: number; title: string; type?: "issue" | "engineering_change" };
  onNavigate?: (number: number, type: "issue" | "engineering_change") => void;
  block?: boolean;
}) {
  const issueType = item.type ?? "issue";
  const blockCls = block ? "block truncate" : "";
  if (!onNavigate) {
    return <span className={`font-medium text-foreground ${blockCls}`}>{item.title}</span>;
  }
  return (
    <button
      type="button"
      className={`cursor-pointer font-medium text-primary hover:underline ${blockCls}`}
      onClick={() => onNavigate(item.number, issueType)}
    >
      #{item.number} {item.title}
    </button>
  );
}

function EventRow({ icon, children, timestamp }: { icon: ReactNode; children: ReactNode; timestamp: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 ml-11">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</div>
      <p className="flex-1 text-sm text-muted-foreground">{children}</p>
      <span className="text-xs text-muted-foreground/60">{timestamp}</span>
    </div>
  );
}

function LinkedBlock({ icon, children, timestamp, linkedIssues, onNavigate }: {
  icon: ReactNode;
  children: ReactNode;
  timestamp: string;
  linkedIssues?: TimelineEventData["linkedIssues"];
  onNavigate?: TimelineEventItemProps["onNavigate"];
}) {
  return (
    <div className="py-1.5 ml-11">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</div>
        <p className="flex-1 text-sm text-muted-foreground">{children}</p>
        <span className="text-xs text-muted-foreground/60">{timestamp}</span>
      </div>
      {linkedIssues && linkedIssues.length > 0 && (
        <div className="mt-1 ml-7 space-y-0.5">
          {linkedIssues.map((i) => (
            <ClickableIssueLink key={i.number} item={i} onNavigate={onNavigate} block />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────

export function TimelineEventItem({ event, onNavigate }: TimelineEventItemProps) {
  const { type, author, createdAtLabel: ts } = event;

  // 리뷰 승인
  if (type === "review_approved") {
    return (
      <EventRow icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 승인했습니다"}
        {event.content && <span className="text-muted-foreground/70"> — {event.content as string}</span>}
      </EventRow>
    );
  }

  // 리뷰 변경
  if (type === "review_changes_requested") {
    return (
      <EventRow icon={<XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 변경을 요청했습니다"}
        {event.content && <span className="text-muted-foreground/70"> — {event.content as string}</span>}
      </EventRow>
    );
  }

  // 이슈 상태 변경
  if (type === "status_change") {
    const isReopened = event.content === "open";
    return (
      <EventRow
        icon={isReopened
          ? <IssueStatusIcon state="OPEN" className="h-4 w-4" />
          : <IssueStatusIcon state="CLOSED" className="h-4 w-4" />}
        timestamp={ts}
      >
        <ActivityAuthor author={author} />
        {isReopened ? " 님이 이슈를 다시 열었습니다" : " 님이 이슈를 닫았습니다"}
      </EventRow>
    );
  }

  // CR 상태 변경
  if (type === "cr_state_changed") {
    const detail = event.content as { from?: string; to?: string } | null;
    const from = detail?.from?.toUpperCase() ?? "";
    const to = detail?.to?.toUpperCase() ?? "";
    const targetState = to || "SUBMITTED";

    let message: string;

    if (from === "CLOSED" && to === "SUBMITTED") {
      message = " 님이 변경관리를 다시 제출했습니다";
    } else if (to === "DRAFT") {
      message = " 님이 변경관리를 초안 상태로 변경했습니다";
    } else if (to === "SUBMITTED") {
      message = " 님이 변경관리를 제출했습니다";
    } else if (to === "MERGED") {
      message = " 님이 변경관리를 반영했습니다";
    } else if (to === "CLOSED") {
      message = " 님이 변경관리를 닫았습니다";
    } else {
      message = " 님이 변경관리 상태를 변경했습니다";
    }

    return (
      <EventRow icon={<EngineeringChangeStatusIcon state={targetState} className="h-4 w-4" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {message}
      </EventRow>
    );
  }

  // 이슈 생성
  if (type === "issue_created") {
    return (
      <EventRow icon={<FilePen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />} timestamp={ts}>
        <ActivityAuthor author={author} /> 님이 이슈를 생성했습니다
      </EventRow>
    );
  }

  // CR 생성
  if (type === "cr_created") {
    return (
      <EventRow icon={<FilePen className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 변경관리를 생성했습니다"}
        {event.issueTitle && (
          <span className="text-muted-foreground/70"> — #{event.issueNumber} {event.issueTitle}</span>
        )}
      </EventRow>
    );
  }

  // CR 머지
  if (type === "cr_merged") {
    return (
      <EventRow icon={<EngineeringChangeStatusIcon state="MERGED" className="h-4 w-4" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 변경관리를 반영했습니다"}
        {event.issueTitle && <span className="text-muted-foreground/70"> — {event.issueTitle}</span>}
      </EventRow>
    );
  }

  // 부품 변경
  if (type === "part_added" || type === "part_removed") {
    return (
      <EventRow icon={<Package className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 부품을 변경했습니다"}
        {(event.addedPartCount ?? 0) > 0 && (
          <span className="ml-1">
            {event.addedPartNumbers
              ? <TruncatedNames items={event.addedPartNumbers} suffix="추가" />
              : <><span className="font-medium text-foreground">{event.addedPartCount}건</span> 추가</>}
          </span>
        )}
        {(event.removedPartCount ?? 0) > 0 && (
          <span className="ml-1">
            {event.removedPartNumbers
              ? <TruncatedNames items={event.removedPartNumbers} suffix="제거" />
              : <><span className="font-medium text-foreground">{event.removedPartCount}건</span> 제거</>}
          </span>
        )}
      </EventRow>
    );
  }

  // 라벨 변경
  if (type === "labels_changed") {
    const added = event.addedLabels ?? [];
    const removed = event.removedLabels ?? [];
    return (
      <div className="flex items-center gap-2 py-1.5 ml-11">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 text-sm text-muted-foreground">
          <ActivityAuthor author={author} />
          {" 님이 라벨을 변경했습니다"}
          {added.length > 0 && (
            <span className="ml-1.5">
              {added.map((l) => (
                <LabelBadge key={l.name} label={l.name} colorHex={l.color} className="mx-0.5" />
              ))}
              {" 추가"}
            </span>
          )}
          {removed.length > 0 && (
            <span className="ml-1.5">
              {removed.map((l) => (
                <LabelBadge key={l.name} label={l.name} colorHex={l.color} className="mx-0.5 line-through opacity-60" />
              ))}
              {" 제거"}
            </span>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground/60">{ts}</span>
      </div>
    );
  }

  // 담당자 변경
  if (type === "assigned") {
    return (
      <EventRow icon={<UserPlus className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 담당자를 변경했습니다"}
        {event.addedNames && event.addedNames.length > 0 && (
          <span className="ml-1"><span className="font-medium text-foreground">{event.addedNames.join(", ")}</span> 추가</span>
        )}
        {event.removedNames && event.removedNames.length > 0 && (
          <span className="ml-1"><span className="font-medium text-foreground">{event.removedNames.join(", ")}</span> 제거</span>
        )}
      </EventRow>
    );
  }

  // 검토자 변경
  if (type === "reviewer_changed") {
    return (
      <EventRow icon={<UserPlus className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 검토자를 변경했습니다"}
        {event.addedNames && event.addedNames.length > 0 && (
          <span className="ml-1"><span className="font-medium text-foreground">{event.addedNames.join(", ")}</span> 추가</span>
        )}
        {event.removedNames && event.removedNames.length > 0 && (
          <span className="ml-1"><span className="font-medium text-foreground">{event.removedNames.join(", ")}</span> 제거</span>
        )}
      </EventRow>
    );
  }

  // 파일 추가
  if (type === "file_attached") {
    return (
      <EventRow icon={<Paperclip className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 파일을 추가했습니다 "}
        {event.fileNames && event.fileNames.length > 0
          ? <TruncatedNames items={event.fileNames} />
          : <span className="font-medium text-foreground">{event.fileCount ?? 1}건</span>}
      </EventRow>
    );
  }

  // 파일 제거
  if (type === "file_detached") {
    return (
      <EventRow icon={<Paperclip className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 파일을 제거했습니다 "}
        {event.fileNames && event.fileNames.length > 0 && <TruncatedNames items={event.fileNames} />}
      </EventRow>
    );
  }

  // 변경관리 연결/해제 (이슈 → Engineering Change)
  if (type === "cr_changed") {
    const isRemoval = (event.linkedIssueCount ?? 0) < 0;
    return (
      <LinkedBlock
        icon={isRemoval
          ? <Unlink className="h-3.5 w-3.5 text-muted-foreground" />
          : <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />}
        timestamp={ts}
        linkedIssues={event.linkedIssues}
        onNavigate={onNavigate}
      >
        <ActivityAuthor author={author} />
        {isRemoval ? " 님이 변경관리를 해제했습니다" : " 님이 변경관리를 연결했습니다"}
      </LinkedBlock>
    );
  }

  // CR 이슈 연결
  if (type === "cr_issue_linked") {
    return (
      <LinkedBlock
        icon={<LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />}
        timestamp={ts}
        linkedIssues={event.linkedIssues}
        onNavigate={onNavigate}
      >
        <ActivityAuthor author={author} /> 님이 연결했습니다
      </LinkedBlock>
    );
  }

  // CR 이슈 해제
  if (type === "cr_issue_unlinked") {
    return (
      <LinkedBlock
        icon={<Unlink className="h-3.5 w-3.5 text-muted-foreground" />}
        timestamp={ts}
        linkedIssues={event.linkedIssues}
        onNavigate={onNavigate}
      >
        <ActivityAuthor author={author} /> 님이 해제했습니다
      </LinkedBlock>
    );
  }

  // 다른 이슈/CR에서 멘션됨
  if (type === "issue_mentioned") {
    const source = event.linkedIssues?.[0];
    return (
      <EventRow icon={<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        {source && <ClickableIssueLink item={source} onNavigate={onNavigate} />}
        {event.isComment ? " 의 댓글에서 언급했습니다" : " 의 본문에서 언급했습니다"}
      </EventRow>
    );
  }

  // 참조
  if (type === "referenced") {
    return (
      <EventRow icon={<FileCheck className="h-3.5 w-3.5 text-muted-foreground" />} timestamp={ts}>
        <ActivityAuthor author={author} />
        {" 님이 "}
        <span className="font-medium text-primary">{event.ref}</span>
        {" 을(를) 참조했습니다"}
      </EventRow>
    );
  }

  return null;
}
