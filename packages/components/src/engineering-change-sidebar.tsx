import { useMemo, useRef, useState } from "react";
import {
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@fabbit/ui";
import { AffectedItemPickerSection, type AffectedItemPickerSectionProps } from "./affected-item-picker-section";
import { FileIcon } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { IssueStatusIcon, getIssueStatusConfig } from "./work-item-status";

export interface EngineeringChangeSidebarUser {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface EngineeringChangeSidebarReviewer extends EngineeringChangeSidebarUser {
  reviewStatus: string;
  reviewedAt: string | null;
}

export interface EngineeringChangeSidebarLabel {
  id: string;
  name: string;
  color: string;
}

export interface EngineeringChangeSidebarFile {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface EngineeringChangeSidebarLinkedIssue {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface EngineeringChangeSidebarEngineeringChange {
  engineeringChangeState: string;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  mergedBy: string | null;
  assignees: EngineeringChangeSidebarUser[];
  reviewers: EngineeringChangeSidebarReviewer[];
  labels: EngineeringChangeSidebarLabel[];
  files: EngineeringChangeSidebarFile[];
  linkedIssues: EngineeringChangeSidebarLinkedIssue[];
}

export interface EngineeringChangeSidebarProps {
  engineeringChange: EngineeringChangeSidebarEngineeringChange;
  isAttachingFiles: boolean;
  onAttachFiles: (files: File[]) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  labelPicker?: {
    availableLabels: { id: string; name: string; colorHex: string }[];
    selectedIds: string[];
    onSync: (labelIds: string[]) => void;
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  affectedItemPicker?: {
    searchedItems: AffectedItemPickerSectionProps["searchedItems"];
    displayItems: AffectedItemPickerSectionProps["displayItems"];
    onSync: NonNullable<AffectedItemPickerSectionProps["onSync"]>;
    onItemTypeChange?: AffectedItemPickerSectionProps["onItemTypeChange"];
    onNavigateToItem?: AffectedItemPickerSectionProps["onNavigateToItem"];
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
  onEditIssues?: () => void;
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

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)}KB`;
  }

  return `${size}B`;
}

export function EngineeringChangeSidebar({
  engineeringChange,
  affectedItemPicker,
  isAttachingFiles,
  onAttachFiles,
  onDeleteFile,
  labelPicker,
  linkedIssuePicker,
  onEditIssues,
  onNavigateToIssue,
}: EngineeringChangeSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [issuePopoverOpen, setIssuePopoverOpen] = useState(false);
  const [issueQuery, setIssueQuery] = useState("");
  const [draftIssueIds, setDraftIssueIds] = useState<string[]>([]);

  const deletingFile = engineeringChange.files.find((file) => file.fileId === deletingFileId) ?? null;

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
      {labelPicker ? (
        <LabelPickerSection
          availableLabels={labelPicker.availableLabels}
          selectedIds={labelPicker.selectedIds}
          displayLabels={engineeringChange.labels.map((label) => ({
            id: label.id,
            name: label.name,
            colorHex: label.color,
          }))}
          onSync={labelPicker.onSync}
          onRequestLabels={labelPicker.onRequest}
          onSearchChange={labelPicker.onSearchChange}
          isSearching={labelPicker.isSearching}
          isUpdating={labelPicker.isUpdating}
        />
      ) : null}

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
                          <IssueStatusIcon
                            state={issue.state}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">
                              #{issue.number} {issue.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {getIssueStatusConfig(issue.state).label}
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
        {engineeringChange.linkedIssues.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {engineeringChange.linkedIssues.map((issue) => (
              <div
                key={issue.id}
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                <IssueStatusIcon
                  state={issue.state}
                  className="h-3.5 w-3.5 shrink-0"
                />
                <button
                  type="button"
                  className="min-w-0 flex-1 cursor-pointer text-left"
                  onClick={() => onNavigateToIssue(issue.number)}
                >
                  <p className="truncate text-xs font-medium text-foreground">
                    #{issue.number} {issue.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {getIssueStatusConfig(issue.state).label}
                  </p>
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

      {affectedItemPicker ? (
        <AffectedItemPickerSection
          searchedItems={affectedItemPicker.searchedItems}
          displayItems={affectedItemPicker.displayItems}
          onSync={affectedItemPicker.onSync}
          onItemTypeChange={affectedItemPicker.onItemTypeChange}
          onNavigateToItem={affectedItemPicker.onNavigateToItem}
          onRequest={affectedItemPicker.onRequest}
          onSearchChange={affectedItemPicker.onSearchChange}
          isSearching={affectedItemPicker.isSearching}
          isUpdating={affectedItemPicker.isUpdating}
        />
      ) : null}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            첨부파일
            {engineeringChange.files.length > 0 ? (
              <span className="ml-1 text-muted-foreground/50">({engineeringChange.files.length})</span>
            ) : null}
          </h3>
          <>
            <input
              ref={fileInputRef}
              aria-label="변경관리 첨부 파일 업로드"
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
        {engineeringChange.files.length > 0 ? (
          <div className="mt-2 space-y-1">
            {engineeringChange.files.map((file) => (
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
