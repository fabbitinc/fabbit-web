import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Settings,
  X,
} from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TiptapEditor,
  type TiptapEditorProps,
} from "@fabbit/ui";
import { FileIcon } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { MemberPickerSection } from "./member-picker-section";
import { PartPickerSection } from "./part-picker-section";
import { getIssueStatusConfig, IssueStatusIcon } from "./work-item-status";

export interface IssueCreateScreenMemberOption {
  email: string;
  id: string;
  name: string;
  profileImageUrl?: string | null;
}

export interface IssueCreateScreenLabelOption {
  colorHex: string;
  id: string;
  name: string;
}

export interface IssueCreateScreenPartOption {
  id: string;
  name: string | null;
  partNumber: string;
}

export interface IssueCreateScreenChangeOption {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface IssueCreateScreenSubmitInput {
  assigneeIds: string[];
  body: TiptapEditorProps["content"] | null;
  files: File[];
  labelIds: string[];
  linkedEngineeringChangeIds: string[];
  partIds: string[];
  title: string;
}

export interface IssueCreateScreenProps {
  assigneeOptions?: IssueCreateScreenMemberOption[];
  changeOptions?: IssueCreateScreenChangeOption[];
  isAssigneeSearching?: boolean;
  isChangeSearching?: boolean;
  isLabelSearching?: boolean;
  isPartSearching?: boolean;
  isPending?: boolean;
  labelOptions?: IssueCreateScreenLabelOption[];
  onAssigneeSearchChange?: (search: string) => void;
  onBack: () => void;
  onCancel?: () => void;
  onChangeSearchChange?: (search: string) => void;
  onLabelSearchChange?: (search: string) => void;
  onRequestAssignees?: () => void;
  onRequestChanges?: () => void;
  onRequestLabels?: () => void;
  onRequestParts?: () => void;
  onPartSearchChange?: (search: string) => void;
  onSubmit: (input: IssueCreateScreenSubmitInput) => Promise<void>;
  partOptions?: IssueCreateScreenPartOption[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function IssueCreateScreen({
  assigneeOptions = [],
  changeOptions = [],
  isAssigneeSearching = false,
  isChangeSearching = false,
  isLabelSearching = false,
  isPartSearching = false,
  isPending = false,
  labelOptions = [],
  onAssigneeSearchChange,
  onBack,
  onCancel,
  onChangeSearchChange,
  onLabelSearchChange,
  onRequestAssignees,
  onRequestChanges,
  onRequestLabels,
  onRequestParts,
  onPartSearchChange,
  onSubmit,
  partOptions = [],
}: IssueCreateScreenProps) {
  const [title, setTitle] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<TiptapEditorProps["content"] | null>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [linkedChangeIds, setLinkedChangeIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberCacheRef = useRef<Map<string, IssueCreateScreenMemberOption>>(new Map());
  const labelCacheRef = useRef<Map<string, IssueCreateScreenLabelOption>>(new Map());
  const partCacheRef = useRef<Map<string, IssueCreateScreenPartOption>>(new Map());

  for (const member of assigneeOptions) {
    memberCacheRef.current.set(member.id, member);
  }

  for (const label of labelOptions) {
    labelCacheRef.current.set(label.id, label);
  }

  for (const part of partOptions) {
    partCacheRef.current.set(part.id, part);
  }

  return (
    <div className="mx-auto max-w-[1160px] space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        이슈 목록
      </button>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">새 이슈</h2>
            <p className="mt-1 text-xs text-muted-foreground">추적할 작업 또는 문제를 등록합니다.</p>
          </div>

          <form
            className="space-y-4 px-5 py-4"
            onSubmit={async (event) => {
              event.preventDefault();

              const trimmedTitle = title.trim();
              if (!trimmedTitle) {
                return;
              }

              await onSubmit({
                title: trimmedTitle,
                body: descriptionText.trim().length > 0 ? descriptionJson : null,
                assigneeIds,
                labelIds,
                linkedEngineeringChangeIds: linkedChangeIds,
                partIds,
                files,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="issue-create-screen-title">제목</Label>
              <Input
                id="issue-create-screen-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="이슈 제목을 입력하세요"
                maxLength={500}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>설명</Label>
              <TiptapEditor
                content={descriptionJson ?? ""}
                onChangeJson={(content) => setDescriptionJson(content)}
                onChangeText={setDescriptionText}
                placeholder="이슈 설명을 입력하세요"
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel ?? onBack}>
                취소
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                이슈 생성
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="space-y-5">
            <MemberPickerSection
              label="담당자"
              applyLabel="담당자 적용"
              availableMembers={assigneeOptions.map((member) => ({
                id: member.id,
                name: member.name,
                email: member.email,
              }))}
              selectedIds={assigneeIds}
              displayItems={assigneeIds
                .map((id) => memberCacheRef.current.get(id))
                .filter((member): member is IssueCreateScreenMemberOption => Boolean(member))
                .map((member) => ({
                  id: member.id,
                  name: member.name,
                  profileImageUrl: member.profileImageUrl,
                }))}
              onSync={setAssigneeIds}
              onRequestMembers={onRequestAssignees}
              onSearchChange={onAssigneeSearchChange}
              isSearching={isAssigneeSearching}
            />

            <LabelPickerSection
              availableLabels={labelOptions}
              selectedIds={labelIds}
              displayLabels={labelIds
                .map((id) => labelCacheRef.current.get(id))
                .filter((label): label is IssueCreateScreenLabelOption => Boolean(label))}
              onSync={setLabelIds}
              onRequestLabels={onRequestLabels}
              onSearchChange={onLabelSearchChange}
              isSearching={isLabelSearching}
            />

            <PartPickerSection
              searchedParts={partOptions}
              selectedIds={partIds}
              displayParts={partIds
                .map((id) => partCacheRef.current.get(id))
                .filter((part): part is IssueCreateScreenPartOption => Boolean(part))
                .map((part) => ({
                  id: part.id,
                  partNumber: part.partNumber,
                  name: part.name ?? "",
                }))}
              onSync={setPartIds}
              onRequestParts={onRequestParts}
              onSearchChange={onPartSearchChange}
              isSearching={isPartSearching}
            />

            <LinkedChangePickerSection
              changeOptions={changeOptions}
              selectedIds={linkedChangeIds}
              onSync={setLinkedChangeIds}
              onRequest={onRequestChanges}
              onSearchChange={onChangeSearchChange}
              isSearching={isChangeSearching}
            />

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">
                  첨부파일
                  {files.length > 0 ? (
                    <span className="ml-1 text-muted-foreground/50">({files.length})</span>
                  ) : null}
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const selectedFiles = Array.from(event.target.files ?? []);
                    if (selectedFiles.length > 0) {
                      setFiles((previous) => [...previous, ...selectedFiles]);
                    }
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {files.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                    >
                      <FileIcon name={file.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-foreground">{file.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                        onClick={() => {
                          setFiles((previous) =>
                            previous.filter((_, previousIndex) => previousIndex !== index),
                          );
                        }}
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
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 연결된 변경관리 피커 ── */

function LinkedChangePickerSection({
  changeOptions,
  selectedIds,
  onSync,
  onRequest,
  onSearchChange,
  isSearching,
}: {
  changeOptions: IssueCreateScreenChangeOption[];
  selectedIds: string[];
  onSync: (ids: string[]) => void;
  onRequest?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const changeCacheRef = useRef<Map<string, IssueCreateScreenChangeOption>>(new Map());

  for (const change of changeOptions) {
    changeCacheRef.current.set(change.id, change);
  }

  const filteredChanges = useMemo(() => {
    if (!query.trim()) return changeOptions;
    const q = query.toLowerCase();
    return changeOptions.filter(
      (c) => c.title.toLowerCase().includes(q) || String(c.number).includes(q),
    );
  }, [query, changeOptions]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">연결된 변경관리</h3>
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open);
            if (open) {
              onRequest?.();
              onSearchChange?.("");
              setDraftIds(selectedIds);
              setQuery("");
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
              <p className="text-xs font-medium text-foreground">변경관리 연결</p>
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearchChange?.(e.target.value);
                  }}
                  placeholder="번호 또는 제목으로 검색"
                />
                {isSearching ? (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  </div>
                ) : null}
              </div>
              <div className="max-h-48 space-y-1 overflow-auto">
                {filteredChanges.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    {query.trim() ? "검색 결과가 없습니다." : "연결 가능한 변경관리가 없습니다."}
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
                          setDraftIds((prev) =>
                            checked ? [...prev, change.id] : prev.filter((id) => id !== change.id),
                          );
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          #{change.number} {change.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {getIssueStatusConfig(change.state).label}
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
                onClick={() => {
                  onSync(draftIds);
                  setPopoverOpen(false);
                  setQuery("");
                }}
              >
                변경관리 적용
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {selectedIds.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {selectedIds.map((id) => {
            const change = changeCacheRef.current.get(id);
            if (!change) return null;
            return (
              <div key={id} className="rounded-md px-2 py-1.5">
                <p className="truncate text-xs font-medium text-foreground">
                  #{change.number} {change.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {getIssueStatusConfig(change.state).label}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">연결된 변경관리 없음</p>
      )}
    </div>
  );
}
