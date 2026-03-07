import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Settings,
  X,
} from "lucide-react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Input,
  LabelBadge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  UserAvatar,
} from "@fabbit/ui";
import { FileIcon } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { MemberPickerSection } from "./member-picker-section";
import { PartPickerSection } from "./part-picker-section";

export interface ChangeRequestSidebarUser {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface ChangeRequestSidebarReviewer extends ChangeRequestSidebarUser {
  reviewStatus: string;
  reviewedAt: string | null;
}

export interface ChangeRequestSidebarLabel {
  id: string;
  name: string;
  color: string;
}

export interface ChangeRequestSidebarPart {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface ChangeRequestSidebarFile {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface ChangeRequestSidebarLinkedIssue {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface ChangeRequestSidebarChangeRequest {
  crState: string;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  mergedBy: string | null;
  assignees: ChangeRequestSidebarUser[];
  reviewers: ChangeRequestSidebarReviewer[];
  labels: ChangeRequestSidebarLabel[];
  parts: ChangeRequestSidebarPart[];
  files: ChangeRequestSidebarFile[];
  linkedIssues: ChangeRequestSidebarLinkedIssue[];
}

export interface ChangeRequestSidebarProps {
  changeRequest: ChangeRequestSidebarChangeRequest;
  isAttachingFiles: boolean;
  onAttachFiles: (files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  assigneePicker?: {
    availableMembers: { id: string; name: string; email: string }[];
    selectedIds: string[];
    onSync: (userIds: string[]) => void;
    onRequest: () => void;
    isUpdating?: boolean;
  };
  reviewerPicker?: {
    availableMembers: { id: string; name: string; email: string }[];
    selectedIds: string[];
    onSync: (userIds: string[]) => void;
    onRequest: () => void;
    isUpdating?: boolean;
  };
  labelPicker?: {
    availableLabels: { id: string; name: string; colorHex: string }[];
    selectedIds: string[];
    onSync: (labelIds: string[]) => void;
    onRequest: () => void;
    isUpdating?: boolean;
  };
  partPicker?: {
    searchedParts: { id: string; partNumber: string; name: string | null }[];
    selectedIds: string[];
    onSync: (partIds: string[]) => void;
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  linkedIssuePicker?: {
    availableIssues: { id: string; number: number; title: string; state: string }[];
    selectedIds: string[];
    onSync: (issueIds: string[]) => void;
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  onEditAssignees?: () => void;
  onEditIssues?: () => void;
  onEditLabels?: () => void;
  onEditParts?: () => void;
  onEditReviewers?: () => void;
  onNavigateToIssue: (issueNumber: number) => void;
}

function SectionSettingsButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
    >
      <Settings className="h-3 w-3" />
    </button>
  );
}

function getIssueStateLabel(state: string) {
  return state.toUpperCase() === "OPEN" ? "열림" : "닫힘";
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)}KB`;
  }

  return `${size}B`;
}

export function ChangeRequestSidebar({
  changeRequest,
  isAttachingFiles,
  onAttachFiles,
  onDeleteFile,
  assigneePicker,
  reviewerPicker,
  labelPicker,
  partPicker,
  linkedIssuePicker,
  onEditAssignees,
  onEditIssues,
  onEditLabels,
  onEditParts,
  onEditReviewers,
  onNavigateToIssue,
}: ChangeRequestSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [issuePopoverOpen, setIssuePopoverOpen] = useState(false);
  const [issueQuery, setIssueQuery] = useState("");
  const [draftIssueIds, setDraftIssueIds] = useState<string[]>([]);

  const deletingFile = changeRequest.files.find((file) => file.fileId === deletingFileId) ?? null;

  const filteredIssues = useMemo(() => {
    const items = linkedIssuePicker?.availableIssues ?? [];

    if (!issueQuery.trim()) {
      return items;
    }

    const query = issueQuery.toLowerCase();
    return items.filter((issue) => issue.title.toLowerCase().includes(query) || String(issue.number).includes(query));
  }, [issueQuery, linkedIssuePicker?.availableIssues]);

  return (
    <div className="space-y-5">
      <div>
        {reviewerPicker ? (
          <MemberPickerSection
            label="검토자"
            applyLabel="검토자 적용"
            availableMembers={reviewerPicker.availableMembers}
            selectedIds={reviewerPicker.selectedIds}
            displayItems={changeRequest.reviewers.map((reviewer) => ({
              id: reviewer.userId,
              name: reviewer.fullName,
              profileImageUrl: reviewer.profileImageUrl,
            }))}
            onSync={reviewerPicker.onSync}
            onRequestMembers={reviewerPicker.onRequest}
            isUpdating={reviewerPicker.isUpdating}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">검토자</h3>
              <SectionSettingsButton onClick={onEditReviewers} />
            </div>
            {changeRequest.reviewers.length > 0 ? (
              <div className="mt-2 space-y-2">
                {changeRequest.reviewers.map((reviewer) => (
                  <div key={reviewer.userId} className="flex items-center gap-2">
                    <UserAvatar
                      name={reviewer.fullName}
                      imageUrl={reviewer.profileImageUrl}
                      className="h-6 w-6 text-[10px]"
                    />
                    <span className="text-sm text-foreground">{reviewer.fullName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/50">지정된 검토자 없음</p>
            )}
          </div>
        )}
      </div>

      <div>
        {assigneePicker ? (
          <MemberPickerSection
            label="담당자"
            applyLabel="담당자 적용"
            availableMembers={assigneePicker.availableMembers}
            selectedIds={assigneePicker.selectedIds}
            displayItems={changeRequest.assignees.map((assignee) => ({
              id: assignee.userId,
              name: assignee.fullName,
              profileImageUrl: assignee.profileImageUrl,
            }))}
            onSync={assigneePicker.onSync}
            onRequestMembers={assigneePicker.onRequest}
            isUpdating={assigneePicker.isUpdating}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">담당자</h3>
              <SectionSettingsButton onClick={onEditAssignees} />
            </div>
            {changeRequest.assignees.length > 0 ? (
              <div className="mt-2 space-y-2">
                {changeRequest.assignees.map((assignee) => (
                  <div key={assignee.userId} className="flex items-center gap-2">
                    <UserAvatar
                      name={assignee.fullName}
                      imageUrl={assignee.profileImageUrl}
                      className="h-6 w-6 text-[10px]"
                    />
                    <span className="text-sm text-foreground">{assignee.fullName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/50">지정된 담당자 없음</p>
            )}
          </div>
        )}
      </div>

      <div>
        {labelPicker ? (
          <LabelPickerSection
            availableLabels={labelPicker.availableLabels}
            selectedIds={labelPicker.selectedIds}
            displayLabels={changeRequest.labels.map((label) => ({
              id: label.id,
              name: label.name,
              colorHex: label.color,
            }))}
            onSync={labelPicker.onSync}
            onRequestLabels={labelPicker.onRequest}
            isUpdating={labelPicker.isUpdating}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
              <SectionSettingsButton onClick={onEditLabels} />
            </div>
            {changeRequest.labels.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {changeRequest.labels.map((label) => (
                  <LabelBadge key={label.id} label={label.name} colorHex={label.color} />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/50">연결된 라벨 없음</p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">연결된 이슈</h3>
          {linkedIssuePicker ? (
            <Popover
              open={issuePopoverOpen}
              onOpenChange={(open) => {
                setIssuePopoverOpen(open);

                if (open) {
                  linkedIssuePicker.onRequest();
                  linkedIssuePicker.onSearchChange?.("");
                  setDraftIssueIds(linkedIssuePicker.selectedIds);
                  setIssueQuery("");
                } else {
                  setIssueQuery("");
                }
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">이슈 연결</p>
                  <div className="relative">
                    <Input
                      value={issueQuery}
                      onChange={(event) => {
                        const nextQuery = event.target.value;
                        setIssueQuery(nextQuery);
                        linkedIssuePicker.onSearchChange?.(nextQuery);
                      }}
                      placeholder="번호 또는 제목으로 검색"
                    />
                    {linkedIssuePicker.isSearching ? (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      </div>
                    ) : null}
                  </div>
                  <div className="max-h-48 space-y-1 overflow-auto">
                    {filteredIssues.length === 0 ? (
                      <p className="px-1 py-2 text-xs text-muted-foreground">
                        {issueQuery.trim() ? "검색 결과가 없습니다." : "연결 가능한 이슈가 없습니다."}
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
                              setDraftIssueIds((previous) =>
                                checked ? [...previous, issue.id] : previous.filter((id) => id !== issue.id),
                              );
                            }}
                          />
                          {issue.state.toUpperCase() === "OPEN" ? (
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">
                              #{issue.number} {issue.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{getIssueStateLabel(issue.state)}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={linkedIssuePicker.isUpdating}
                    onClick={() => {
                      linkedIssuePicker.onSync(draftIssueIds);
                      setIssuePopoverOpen(false);
                      setIssueQuery("");
                    }}
                  >
                    이슈 적용
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <SectionSettingsButton onClick={onEditIssues} />
          )}
        </div>
        {changeRequest.linkedIssues.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {changeRequest.linkedIssues.map((issue) => (
              <div
                key={issue.id}
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                {issue.state.toUpperCase() === "OPEN" ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-400" />
                )}
                <button
                  type="button"
                  className="min-w-0 flex-1 cursor-pointer text-left"
                  onClick={() => onNavigateToIssue(issue.number)}
                >
                  <p className="truncate text-xs font-medium text-foreground">
                    #{issue.number} {issue.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{getIssueStateLabel(issue.state)}</p>
                </button>
                {linkedIssuePicker ? (
                  <button
                    type="button"
                    className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                    onClick={(event) => {
                      event.stopPropagation();
                      linkedIssuePicker.onSync(
                        linkedIssuePicker.selectedIds.filter((linkedIssueId) => linkedIssueId !== issue.id),
                      );
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">연결된 이슈 없음</p>
        )}
      </div>

      <div>
        {partPicker ? (
          <PartPickerSection
            searchedParts={partPicker.searchedParts}
            selectedIds={partPicker.selectedIds}
            displayParts={changeRequest.parts.map((part) => ({
              id: part.id,
              partNumber: part.partNumber,
              name: part.name ?? "이름 없음",
            }))}
            onSync={partPicker.onSync}
            onRequestParts={partPicker.onRequest}
            onSearchChange={partPicker.onSearchChange}
            isSearching={partPicker.isSearching}
            isUpdating={partPicker.isUpdating}
          />
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">관련 부품</h3>
              <SectionSettingsButton onClick={onEditParts} />
            </div>
            {changeRequest.parts.length > 0 ? (
              <div className="mt-2 space-y-1.5">
                {changeRequest.parts.map((part) => (
                  <div key={part.id} className="rounded-md px-2 py-1.5">
                    <p className="truncate text-xs font-medium text-foreground">{part.partNumber}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{part.name ?? "이름 없음"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/50">연결된 부품 없음</p>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            첨부파일
            {changeRequest.files.length > 0 ? (
              <span className="ml-1 text-muted-foreground/50">({changeRequest.files.length})</span>
            ) : null}
          </h3>
          <>
            <input
              ref={fileInputRef}
              aria-label="변경 요청 첨부 파일 업로드"
              type="file"
              multiple
              className="hidden"
              disabled={isAttachingFiles}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length > 0) {
                  void onAttachFiles(files);
                }
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              disabled={isAttachingFiles}
              onClick={() => fileInputRef.current?.click()}
            >
              {isAttachingFiles ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </button>
          </>
        </div>
        {changeRequest.files.length > 0 ? (
          <div className="mt-2 space-y-1">
            {changeRequest.files.map((file) => (
              <div
                key={file.fileId}
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <FileIcon name={file.originalName} contentType={file.contentType} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground">{file.originalName}</p>
                  <p className="text-[11px] text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                </div>
                <button
                  type="button"
                  className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                  onClick={() => setDeletingFileId(file.fileId)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">첨부된 파일 없음</p>
        )}
      </div>

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
          setDeletingFileId(null);
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
