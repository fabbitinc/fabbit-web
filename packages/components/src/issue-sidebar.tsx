import { useRef, useState } from "react";
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
import { FileIcon, type FileIconKind } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { MemberPickerSection } from "./member-picker-section";
import { PartPickerSection } from "./part-picker-section";
import {
  ChangeRequestStatusIcon,
  getChangeRequestStatusConfig,
} from "./work-item-status";

export interface IssueSidebarUser {
  id?: string;
  name: string;
  email?: string;
  profileImageUrl?: string | null;
}

export interface IssueSidebarLabel {
  id?: string;
  name: string;
  colorHex: string;
}

export interface IssueSidebarPart {
  id: string;
  partNumber: string;
  name: string;
  category?: string;
}

export interface IssueSidebarLinkedChange {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface IssueSidebarLinkedIssue {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface IssueSidebarFile {
  id: string;
  name: string;
  size: string;
  type: FileIconKind;
  uploadedBy: string;
  uploadedAt: string;
  url?: string | null;
}

export interface IssueSidebarChangeLookupItem {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface IssueSidebarProps {
  assignees: IssueSidebarUser[];
  attachments: IssueSidebarFile[];
  labels: IssueSidebarLabel[];
  linkedChanges: IssueSidebarLinkedChange[];
  linkedIssues?: IssueSidebarLinkedIssue[];
  relatedParts: IssueSidebarPart[];
  assigneePicker?: {
    availableMembers: { id: string; name: string; email: string }[];
    selectedIds: string[];
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    onSync: (userIds: string[]) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  labelPicker?: {
    availableLabels: { id: string; name: string; colorHex: string }[];
    selectedIds: string[];
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    onSync: (labelIds: string[]) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  linkedChangePicker?: {
    availableChanges: IssueSidebarChangeLookupItem[];
    selectedIds: string[];
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    onSync: (ids: string[]) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  partPicker?: {
    searchedParts: { id: string; partNumber: string; name: string | null }[];
    selectedIds: string[];
    onRequest: () => void;
    onSearchChange?: (search: string) => void;
    onSync: (partIds: string[]) => void;
    isSearching?: boolean;
    isUpdating?: boolean;
  };
  onAttachFiles?: (files: File[]) => void;
  onCreateLinkedChange?: () => void;
  onDeleteFile?: (fileId: string) => void;
  onEditAssignees?: () => void;
  onEditLabels?: () => void;
  onEditLinkedChanges?: () => void;
  onEditParts?: () => void;
  onNavigateToChange?: (changeNumber: number) => void;
  onNavigateToPart?: (partId: string) => void;
  isAttachingFiles?: boolean;
}

async function downloadAttachment(file: IssueSidebarFile) {
  if (!file.url) {
    return;
  }

  try {
    const pathname = new URL(file.url, window.location.origin).pathname;
    const filename = decodeURIComponent(pathname.split("/").pop() || file.name);
    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error("첨부파일 다운로드에 실패했습니다.");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    const anchor = document.createElement("a");
    anchor.href = file.url;
    anchor.download = file.name;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  }
}

function SectionSettingsButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) {
    return null;
  }

  return (
    <button
      type="button"
      className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
      onClick={onClick}
    >
      <Settings className="h-3 w-3" />
    </button>
  );
}

function LinkedChangesSection({
  linkedChanges,
  picker,
  onCreateLinkedChange,
  onEdit,
  onNavigateToChange,
}: {
  linkedChanges: IssueSidebarLinkedChange[];
  picker?: IssueSidebarProps["linkedChangePicker"];
  onCreateLinkedChange?: () => void;
  onEdit?: () => void;
  onNavigateToChange?: (changeNumber: number) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const filteredChanges = (picker?.availableChanges ?? []).filter((change) => {
    if (!query.trim()) return true;

    const normalizedQuery = query.toLowerCase();
    return (
      change.title.toLowerCase().includes(normalizedQuery) ||
      String(change.number).includes(normalizedQuery)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">연결된 변경 요청</h3>
        {picker ? (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);

              if (open) {
                picker.onRequest();
                picker.onSearchChange?.("");
                setDraftIds(picker.selectedIds);
              } else {
                setQuery("");
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
                <p className="text-xs font-medium text-foreground">변경 요청 연결</p>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(event) => {
                      const nextQuery = event.target.value;
                      setQuery(nextQuery);
                      picker.onSearchChange?.(nextQuery);
                    }}
                    placeholder="번호 또는 제목으로 검색"
                  />
                  {picker.isSearching ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                  ) : null}
                </div>
                <div className="max-h-48 space-y-1 overflow-auto">
                  {filteredChanges.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">
                      {query.trim() ? "검색 결과가 없습니다." : "연결 가능한 변경 요청이 없습니다."}
                    </p>
                  ) : (
                    filteredChanges.map((change) => (
                      <label
                        key={change.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(change.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((previous) =>
                              checked
                                ? [...previous, change.id]
                                : previous.filter((id) => id !== change.id),
                            );
                          }}
                        />
                        <ChangeRequestStatusIcon
                          state={change.state}
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">
                            #{change.number} {change.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {getChangeRequestStatusConfig(change.state).label}
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
                  disabled={picker.isUpdating}
                  onClick={() => {
                    picker.onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  변경 요청 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <SectionSettingsButton onClick={onEdit} />
        )}
      </div>

      {linkedChanges.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {linkedChanges.map((change) => (
            <div
              key={change.id}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <ChangeRequestStatusIcon
                state={change.state}
                className="h-3.5 w-3.5 shrink-0"
              />
              <button
                type="button"
                className="min-w-0 flex-1 cursor-pointer text-left"
                onClick={() => onNavigateToChange?.(change.number)}
              >
                <p className="truncate text-xs font-medium text-foreground">
                  #{change.number} {change.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {getChangeRequestStatusConfig(change.state).label}
                </p>
              </button>
              {picker ? (
                <button
                  type="button"
                  className="hidden shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                  onClick={(event) => {
                    event.stopPropagation();
                    picker.onSync((picker.selectedIds ?? linkedChanges.map((item) => item.id)).filter((id) => id !== change.id));
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">연결된 변경 요청 없음</p>
      )}

      {onCreateLinkedChange ? (
        <button
          type="button"
          className="mt-2 cursor-pointer text-xs text-primary hover:underline"
          onClick={onCreateLinkedChange}
        >
          변경 요청 생성
        </button>
      ) : null}
    </div>
  );
}

export function IssueSidebar({
  assignees,
  attachments,
  labels,
  linkedChanges,
  partPicker,
  relatedParts,
  assigneePicker,
  labelPicker,
  linkedChangePicker,
  onAttachFiles,
  onCreateLinkedChange,
  onDeleteFile,
  onEditAssignees,
  onEditLabels,
  onEditLinkedChanges,
  onEditParts,
  onNavigateToChange,
  onNavigateToPart,
  isAttachingFiles = false,
}: IssueSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const deletingFile = attachments.find((file) => file.id === deletingFileId) ?? null;

  return (
    <div className="space-y-5">
      {assigneePicker ? (
        <MemberPickerSection
          label="담당자"
          applyLabel="담당자 적용"
          availableMembers={assigneePicker.availableMembers}
          selectedIds={assigneePicker.selectedIds}
          displayItems={assignees}
          onSync={assigneePicker.onSync}
          onRequestMembers={assigneePicker.onRequest}
          onSearchChange={assigneePicker.onSearchChange}
          isSearching={assigneePicker.isSearching}
          isUpdating={assigneePicker.isUpdating}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">담당자</h3>
            <SectionSettingsButton onClick={onEditAssignees} />
          </div>
          <div className="mt-2 space-y-2">
            {assignees.map((assignee) => (
              <div key={assignee.id ?? assignee.name} className="text-sm text-foreground">
                {assignee.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {labelPicker ? (
        <LabelPickerSection
          availableLabels={labelPicker.availableLabels}
          selectedIds={labelPicker.selectedIds}
          displayLabels={labels}
          onSync={labelPicker.onSync}
          onRequestLabels={labelPicker.onRequest}
          onSearchChange={labelPicker.onSearchChange}
          isSearching={labelPicker.isSearching}
          isUpdating={labelPicker.isUpdating}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
            <SectionSettingsButton onClick={onEditLabels} />
          </div>
        </div>
      )}

      <LinkedChangesSection
        linkedChanges={linkedChanges}
        picker={linkedChangePicker}
        onCreateLinkedChange={onCreateLinkedChange}
        onEdit={onEditLinkedChanges}
        onNavigateToChange={onNavigateToChange}
      />

      {partPicker ? (
        <PartPickerSection
          searchedParts={partPicker.searchedParts}
          selectedIds={partPicker.selectedIds}
          displayParts={relatedParts}
          onSync={partPicker.onSync}
          onRequestParts={partPicker.onRequest}
          onNavigateToPart={onNavigateToPart}
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
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            첨부파일
            {attachments.length > 0 ? <span className="ml-1 text-muted-foreground/50">({attachments.length})</span> : null}
          </h3>
          {onAttachFiles ? (
            <>
              <input
                ref={fileInputRef}
                aria-label="첨부 파일 업로드"
                type="file"
                multiple
                disabled={isAttachingFiles}
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);

                  if (files.length > 0) {
                    onAttachFiles(files);
                  }

                  event.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isAttachingFiles}
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
              >
                {isAttachingFiles ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              </button>
            </>
          ) : null}
        </div>

        {attachments.length > 0 ? (
          <div className="mt-2 space-y-1">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                {file.url ? (
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`${file.name} 다운로드`}
                    onClick={() => {
                      void downloadAttachment(file);
                    }}
                  >
                    <FileIcon kind={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-foreground">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground">{file.size}</p>
                    </div>
                  </button>
                ) : (
                  <>
                    <FileIcon kind={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-foreground">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground">{file.size}</p>
                    </div>
                  </>
                )}
                {onDeleteFile ? (
                  <button
                    type="button"
                    className="hidden shrink-0 cursor-pointer rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                    onClick={() => setDeletingFileId(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">첨부된 파일 없음</p>
        )}
      </div>

      {onDeleteFile ? (
        <ConfirmDialog
          open={Boolean(deletingFileId)}
          title="첨부파일을 삭제할까요?"
          description={deletingFile ? `${deletingFile.name} 파일 연결을 해제합니다.` : "선택한 파일 연결을 해제합니다."}
          confirmLabel="삭제"
          cancelLabel="취소"
          variant="destructive"
          onCancel={() => setDeletingFileId(null)}
          onConfirm={() => {
            if (deletingFileId) {
              onDeleteFile(deletingFileId);
            }
            setDeletingFileId(null);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingFileId(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}
