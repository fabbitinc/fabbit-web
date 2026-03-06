import { useRef, useState } from "react";
import {
  File,
  FilePen,
  FileSpreadsheet,
  FileText,
  Image,
  Box,
  Package,
  Plus,
  Settings,
} from "lucide-react";
import { Badge, Button, Checkbox, ConfirmDialog, Input, LabelBadge, Popover, PopoverContent, PopoverTrigger, UserAvatar } from "@fabbit/ui";

// ── 타입 ──────────────────────────────────────────────────

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

export interface IssueSidebarFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "step" | "dwg" | "xlsx" | "image" | "other";
  uploadedBy: string;
  uploadedAt: string;
  url?: string | null;
}

export interface IssueSidebarProps {
  assignees: IssueSidebarUser[];
  labels: IssueSidebarLabel[];
  linkedChanges: IssueSidebarLinkedChange[];
  linkedIssues: { id: string; number: number; title: string; state: string }[];
  relatedParts: IssueSidebarPart[];
  attachments: IssueSidebarFile[];
  /** 담당자 피커 */
  assigneePicker?: {
    availableMembers: { id: string; name: string; email: string }[];
    selectedIds: string[];
    onSync: (userIds: string[]) => void;
    onRequest: () => void;
    isUpdating?: boolean;
  };
  /** 라벨 피커 */
  labelPicker?: {
    availableLabels: { id: string; name: string; colorHex: string }[];
    selectedIds: string[];
    onSync: (labelIds: string[]) => void;
    onRequest: () => void;
    isUpdating?: boolean;
  };
  /** 연결된 변경 요청 피커 */
  linkedChangePicker?: {
    onSync: (ids: string[]) => void;
    onRequest: () => void;
  };
  /** 연결된 이슈 피커 */
  linkedIssuePicker?: {
    onSync: (ids: string[]) => void;
    onRequest: () => void;
  };
  /** 외부 다이얼로그 방식 편집 콜백 (inline picker 대신 사용) */
  onEditAssignees?: () => void;
  onEditLabels?: () => void;
  onEditParts?: () => void;
  onEditLinkedChanges?: () => void;
  onNavigateToChange?: (changeNumber: number) => void;
  onCreateLinkedChange?: () => void;
  onAttachFiles?: (files: File[]) => void;
  onDeleteFile?: (fileId: string) => void;
  isAttachingFiles?: boolean;
}

// ── 파일 아이콘 ──────────────────────────────────────────

function AttachmentIcon({ type }: { type: IssueSidebarFile["type"] }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "pdf": return <FileText className={`${cls} text-red-500`} />;
    case "step": return <Box className={`${cls} text-blue-500`} />;
    case "dwg": return <FilePen className={`${cls} text-amber-500`} />;
    case "xlsx": return <FileSpreadsheet className={`${cls} text-emerald-500`} />;
    case "image": return <Image className={`${cls} text-purple-500`} />;
    default: return <File className={`${cls} text-muted-foreground`} />;
  }
}

// ── 섹션 헤더 버튼 ────────────────────────────────────────

function SectionSettingsButton({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
    >
      <Settings className="h-3 w-3" />
    </button>
  );
}

// ── 담당자 피커 인라인 ────────────────────────────────────

function AssigneePickerInline({
  assignees,
  picker,
}: {
  assignees: IssueSidebarUser[];
  picker?: IssueSidebarProps["assigneePicker"];
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const filtered = (picker?.availableMembers ?? []).filter((m) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">담당자</h3>
        {picker && (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                picker.onRequest();
                setDraftIds(picker.selectedIds);
              } else {
                setQuery("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Settings className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">담당자 추가</p>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="멤버 검색"
                />
                <div className="max-h-48 space-y-1 overflow-auto">
                  {filtered.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">추가 가능한 멤버가 없습니다.</p>
                  ) : (
                    filtered.map((member) => (
                      <label
                        key={member.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(member.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((prev) =>
                              checked ? [...prev, member.id] : prev.filter((id) => id !== member.id),
                            );
                          }}
                        />
                        <UserAvatar name={member.name} className="h-5 w-5 text-[10px]" />
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
                  disabled={picker.isUpdating}
                  onClick={() => {
                    picker.onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  담당자 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {!picker && <SectionSettingsButton />}
      </div>
      <div className="mt-2 space-y-1.5">
        {assignees.map((a) => (
          <div key={a.id ?? a.name} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <UserAvatar name={a.name} imageUrl={a.profileImageUrl} className="h-5 w-5 text-[9px]" />
            <span className="text-xs font-medium text-foreground">{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 라벨 피커 인라인 ─────────────────────────────────────

function LabelPickerInline({
  labels,
  picker,
}: {
  labels: IssueSidebarLabel[];
  picker?: IssueSidebarProps["labelPicker"];
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const filtered = (picker?.availableLabels ?? []).filter((label) => {
    if (!query.trim()) return true;
    return label.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
        {picker && (
          <Popover
            open={popoverOpen}
            onOpenChange={(open) => {
              setPopoverOpen(open);
              if (open) {
                picker.onRequest();
                setDraftIds(picker.selectedIds);
              } else {
                setQuery("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Settings className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">라벨 추가</p>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="라벨 검색"
                />
                <div className="max-h-48 space-y-1 overflow-auto">
                  {filtered.length === 0 ? (
                    <p className="px-1 py-2 text-xs text-muted-foreground">추가 가능한 라벨이 없습니다.</p>
                  ) : (
                    filtered.map((label) => (
                      <label
                        key={label.id}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={draftIds.includes(label.id)}
                          onCheckedChange={(checked) => {
                            setDraftIds((prev) =>
                              checked ? [...prev, label.id] : prev.filter((id) => id !== label.id),
                            );
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
                  disabled={picker.isUpdating}
                  onClick={() => {
                    picker.onSync(draftIds);
                    setPopoverOpen(false);
                    setQuery("");
                  }}
                >
                  라벨 적용
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {!picker && <SectionSettingsButton />}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {labels.map((l) => (
          <LabelBadge key={l.id ?? l.name} label={l.name} colorHex={l.colorHex} />
        ))}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────

export function IssueSidebar({
  assignees,
  labels,
  linkedChanges,
  linkedIssues,
  relatedParts,
  attachments,
  assigneePicker,
  labelPicker,
  onEditAssignees,
  onEditLabels,
  onEditParts,
  onEditLinkedChanges,
  onNavigateToChange,
  onCreateLinkedChange,
  onAttachFiles,
  onDeleteFile,
  isAttachingFiles,
}: IssueSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const deletingFile = attachments.find((f) => f.id === deletingFileId) ?? null;

  return (
    <div className="space-y-5">
      {/* 담당자 */}
      {assigneePicker ? (
        <AssigneePickerInline assignees={assignees} picker={assigneePicker} />
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">담당자</h3>
            <SectionSettingsButton onClick={onEditAssignees} />
          </div>
          <div className="mt-2 space-y-1.5">
            {assignees.map((a) => (
              <div key={a.id ?? a.name} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                <UserAvatar name={a.name} imageUrl={a.profileImageUrl} className="h-5 w-5 text-[9px]" />
                <span className="text-xs font-medium text-foreground">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 라벨 */}
      {labelPicker ? (
        <LabelPickerInline labels={labels} picker={labelPicker} />
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">라벨</h3>
            <SectionSettingsButton onClick={onEditLabels} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <LabelBadge key={l.id ?? l.name} label={l.name} colorHex={l.colorHex} />
            ))}
          </div>
        </div>
      )}

      {/* 연결된 변경 요청 */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">연결된 변경 요청</h3>
          <SectionSettingsButton onClick={onEditLinkedChanges} />
        </div>
        {linkedChanges.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {linkedChanges.map((lc) => {
              const s = lc.state.toLowerCase();
              return (
                <button
                  key={lc.id}
                  type="button"
                  onClick={() => onNavigateToChange?.(lc.number)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted cursor-pointer"
                >
                  <FilePen className={`h-3.5 w-3.5 shrink-0 ${s === "draft" ? "text-gray-500 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">#{lc.number} {lc.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s === "draft" ? "초안" : s === "submitted" || s === "open" ? "제출" : s === "merged" ? "반영" : "닫힘"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">연결된 변경 요청 없음</p>
        )}
        {onCreateLinkedChange && (
          <button type="button" onClick={onCreateLinkedChange} className="mt-2 text-xs text-primary hover:underline cursor-pointer">
            변경 요청 생성
          </button>
        )}
      </div>

      {/* 연결된 이슈 (PR 화면용) */}
      {linkedIssues.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">연결된 이슈</h3>
          </div>
          <div className="mt-2 space-y-1.5">
            {linkedIssues.map((li) => (
              <div key={li.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">#{li.number} {li.title}</p>
                  <p className="text-[11px] text-muted-foreground">{li.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 관련 부품 */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">관련 부품</h3>
          <SectionSettingsButton onClick={onEditParts} />
        </div>
        {relatedParts.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {relatedParts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.partNumber}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{p.name}</p>
                </div>
                {p.category && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] py-0 px-1.5">
                    {p.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">연결된 부품 없음</p>
        )}
      </div>

      {/* 첨부파일 */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            첨부파일
            {attachments.length > 0 && (
              <span className="ml-1 text-muted-foreground/50">({attachments.length})</span>
            )}
          </h3>
          {onAttachFiles && (
            <button
              type="button"
              disabled={isAttachingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
          )}
        </div>
        {onAttachFiles && (
          <input
            ref={fileInputRef}
            aria-label="첨부 파일 업로드"
            type="file"
            multiple
            disabled={isAttachingFiles}
            className="hidden"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length > 0) onAttachFiles(files);
              event.target.value = "";
            }}
          />
        )}
        {attachments.length > 0 ? (
          <div className="mt-2 space-y-1">
            {attachments.map((file) => (
              <div key={file.id} className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted">
                <AttachmentIcon type={file.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground/50">첨부된 파일 없음</p>
        )}
      </div>

      {/* 파일 삭제 확인 */}
      {onDeleteFile && (
        <ConfirmDialog
          open={Boolean(deletingFileId)}
          title="첨부파일을 삭제할까요?"
          description={deletingFile ? `${deletingFile.name} 파일 연결을 해제합니다.` : "선택한 파일 연결을 해제합니다."}
          confirmLabel="삭제"
          cancelLabel="취소"
          variant="destructive"
          onCancel={() => setDeletingFileId(null)}
          onConfirm={() => {
            if (deletingFileId) onDeleteFile(deletingFileId);
            setDeletingFileId(null);
          }}
          onOpenChange={(open) => {
            if (!open) setDeletingFileId(null);
          }}
        />
      )}
    </div>
  );
}
