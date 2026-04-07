import { useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TiptapEditor,
  type TiptapEditorProps,
  UserAvatar,
} from "@fabbit/ui";
import type { AffectedItemSearchItem, AffectedItemType } from "./affected-item-picker-section";
import { FileIcon } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { MemberPickerSection } from "./member-picker-section";
import { IssueStatusIcon, getIssueStatusConfig } from "./work-item-status";

/* ── 공개 타입 ── */

export interface EcCreateMemberOption {
  email: string;
  id: string;
  name: string;
  profileImageUrl?: string | null;
}

export interface EcCreateLabelOption {
  colorHex: string;
  id: string;
  name: string;
}

export type EcCreateCompletionPolicy = "ALL_MUST_APPROVE" | "ANY_ONE_APPROVES" | "MIN_N_APPROVES";
export type EcCreateStageType = "REVIEW" | "APPROVAL" | "RELEASE";

export interface EcCreateStageInput {
  stageType: EcCreateStageType;
  completionPolicy: EcCreateCompletionPolicy;
  minApprovals?: number | null;
  assigneeIds: string[];
}

export interface EcCreateAffectedItemInput {
  targetId: string;
  itemType: AffectedItemType;
}

export interface EcCreateIssueOption {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface EcCreateSubmitInput {
  title: string;
  body: TiptapEditorProps["content"] | null;
  labelIds: string[];
  linkedIssueIds: string[];
  files: File[];
  stages: EcCreateStageInput[];
  affectedItems: EcCreateAffectedItemInput[];
}

export interface EngineeringChangeCreateScreenProps {
  /** 라벨 */
  labelOptions?: EcCreateLabelOption[];
  isLabelSearching?: boolean;
  onLabelSearchChange?: (search: string) => void;
  onRequestLabels?: () => void;

  /** 연결된 이슈 */
  issueOptions?: EcCreateIssueOption[];
  isIssueSearching?: boolean;
  onIssueSearchChange?: (search: string) => void;
  onRequestIssues?: () => void;

  /** 워크플로우 멤버 검색 */
  memberOptions?: EcCreateMemberOption[];
  isMemberSearching?: boolean;
  onMemberSearchChange?: (search: string) => void;
  onRequestMembers?: () => void;

  /** 변경 대상 부품 검색 */
  affectedItemSearchItems?: AffectedItemSearchItem[];
  isAffectedItemSearching?: boolean;
  onAffectedItemSearchChange?: (search: string) => void;
  onAffectedItemTypeChange?: (itemType: "REVISION_RELEASE" | "LIFECYCLE_CHANGE") => void;
  onRequestAffectedItems?: () => void;

  isPending?: boolean;
  onBack: () => void;
  onCancel?: () => void;
  onSubmit: (input: EcCreateSubmitInput) => Promise<void>;
}

const STAGE_CONFIG: { type: EcCreateStageType; label: string; assigneeLabel: string }[] = [
  { type: "REVIEW", label: "검토", assigneeLabel: "검토자" },
  { type: "APPROVAL", label: "승인", assigneeLabel: "승인자" },
  { type: "RELEASE", label: "릴리즈", assigneeLabel: "릴리즈 담당" },
];

const COMPLETION_POLICY_LABELS: Record<EcCreateCompletionPolicy, string> = {
  ALL_MUST_APPROVE: "전원 승인",
  ANY_ONE_APPROVES: "1인 승인",
  MIN_N_APPROVES: "최소 N인",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── 메인 컴포넌트 ── */

export function EngineeringChangeCreateScreen({
  labelOptions = [],
  isLabelSearching = false,
  onLabelSearchChange,
  onRequestLabels,
  issueOptions = [],
  isIssueSearching = false,
  onIssueSearchChange,
  onRequestIssues,
  memberOptions = [],
  isMemberSearching = false,
  onMemberSearchChange,
  onRequestMembers,
  affectedItemSearchItems = [],
  isAffectedItemSearching = false,
  onAffectedItemSearchChange,
  onAffectedItemTypeChange,
  onRequestAffectedItems,
  isPending = false,
  onBack,
  onCancel,
  onSubmit,
}: EngineeringChangeCreateScreenProps) {
  const [title, setTitle] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<TiptapEditorProps["content"] | null>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [linkedIssueIds, setLinkedIssueIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [stages, setStages] = useState<EcCreateStageInput[]>(
    STAGE_CONFIG.map((cfg) => ({
      stageType: cfg.type,
      completionPolicy: "ALL_MUST_APPROVE",
      minApprovals: null,
      assigneeIds: [],
    })),
  );
  const [affectedItems, setAffectedItems] = useState<EcCreateAffectedItemInput[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelCacheRef = useRef<Map<string, EcCreateLabelOption>>(new Map());
  const memberCacheRef = useRef<Map<string, EcCreateMemberOption>>(new Map());

  for (const label of labelOptions) {
    labelCacheRef.current.set(label.id, label);
  }
  for (const member of memberOptions) {
    memberCacheRef.current.set(member.id, member);
  }

  const updateStage = (stageType: EcCreateStageType, patch: Partial<EcCreateStageInput>) => {
    setStages((prev) =>
      prev.map((s) => (s.stageType === stageType ? { ...s, ...patch } : s)),
    );
  };

  return (
    <div className="mx-auto max-w-[1160px] space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        변경관리 목록
      </button>

      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const trimmedTitle = title.trim();
          if (!trimmedTitle) return;

          await onSubmit({
            title: trimmedTitle,
            body: descriptionText.trim().length > 0 ? descriptionJson : null,
            labelIds,
            linkedIssueIds,
            files,
            stages,
            affectedItems,
          });
        }}
      >

      {/* ── 워크플로우 단계 설정 (상세 화면과 동일 위치: 본문 위) ── */}
      <WorkflowStagesEditor
        stages={stages}
        memberOptions={memberOptions}
        isMemberSearching={isMemberSearching}
        onMemberSearchChange={onMemberSearchChange}
        onRequestMembers={onRequestMembers}
        memberCacheRef={memberCacheRef}
        onUpdateStage={updateStage}
      />

      <div className="mt-4 flex gap-6">
        {/* ── 본문 영역 ── */}
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">새 변경관리</h2>
            <p className="mt-1 text-xs text-muted-foreground">설계 변경사항을 등록하고 리뷰를 요청합니다.</p>
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="ec-create-screen-title">제목</Label>
              <Input
                id="ec-create-screen-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="변경관리 제목을 입력하세요"
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
                placeholder="변경관리 설명을 입력하세요"
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel ?? onBack}>
                취소
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                변경관리 생성
              </Button>
            </div>
          </div>
        </div>

        {/* ── 사이드바 ── */}
        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="space-y-5">
            <LabelPickerSection
              availableLabels={labelOptions}
              selectedIds={labelIds}
              displayLabels={labelIds
                .map((id) => labelCacheRef.current.get(id))
                .filter((label): label is EcCreateLabelOption => Boolean(label))}
              onSync={setLabelIds}
              onRequestLabels={onRequestLabels}
              onSearchChange={onLabelSearchChange}
              isSearching={isLabelSearching}
            />

            <LinkedIssuePickerSection
              issueOptions={issueOptions}
              selectedIds={linkedIssueIds}
              onSync={setLinkedIssueIds}
              onRequest={onRequestIssues}
              onSearchChange={onIssueSearchChange}
              isSearching={isIssueSearching}
            />

            <AffectedItemsCreateSection
              items={affectedItems}
              searchedItems={affectedItemSearchItems}
              isSearching={isAffectedItemSearching}
              onSearchChange={onAffectedItemSearchChange}
              onItemTypeChange={onAffectedItemTypeChange}
              onRequest={onRequestAffectedItems}
              onSync={setAffectedItems}
            />

            {/* 첨부파일 */}
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
                        <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex"
                        onClick={() => {
                          setFiles((prev) => prev.filter((_, i) => i !== index));
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

      </form>
    </div>
  );
}

/* ── 워크플로우 단계 편집기 ── */

interface WorkflowStagesEditorProps {
  stages: EcCreateStageInput[];
  memberOptions: EcCreateMemberOption[];
  isMemberSearching: boolean;
  onMemberSearchChange?: (search: string) => void;
  onRequestMembers?: () => void;
  memberCacheRef: React.RefObject<Map<string, EcCreateMemberOption>>;
  onUpdateStage: (stageType: EcCreateStageType, patch: Partial<EcCreateStageInput>) => void;
}

function WorkflowStagesEditor({
  stages,
  memberOptions,
  isMemberSearching,
  onMemberSearchChange,
  onRequestMembers,
  memberCacheRef,
  onUpdateStage,
}: WorkflowStagesEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((p) => !p);
          }
        }}
        className="cursor-pointer rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-0">
              {stages.map((stage, index) => {
                const config = STAGE_CONFIG.find((c) => c.type === stage.stageType)!;
                const hasAssignees = stage.assigneeIds.length > 0;

                return (
                  <div key={stage.stageType} className="flex min-w-0 flex-1 items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                          hasAssignees
                            ? "border-primary bg-background text-primary"
                            : "border-muted-foreground/30 bg-background text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${hasAssignees ? "text-foreground" : "text-muted-foreground"}`}>
                          {config.label}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {hasAssignees ? `${stage.assigneeIds.length}명 지정` : "미지정"}
                        </p>
                      </div>
                    </div>
                    {index < stages.length - 1 ? (
                      <div className="mx-4 h-px flex-1 bg-muted-foreground/30" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-3">
          {stages.map((stage) => {
            const config = STAGE_CONFIG.find((c) => c.type === stage.stageType)!;
            return (
              <WorkflowStageCard
                key={stage.stageType}
                stage={stage}
                config={config}
                memberOptions={memberOptions}
                isMemberSearching={isMemberSearching}
                onMemberSearchChange={onMemberSearchChange}
                onRequestMembers={onRequestMembers}
                memberCacheRef={memberCacheRef}
                onUpdateStage={onUpdateStage}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ── 워크플로우 단계 카드 ── */

function WorkflowStageCard({
  stage,
  config,
  memberOptions,
  isMemberSearching,
  onMemberSearchChange,
  onRequestMembers,
  memberCacheRef,
  onUpdateStage,
}: {
  stage: EcCreateStageInput;
  config: { type: EcCreateStageType; label: string; assigneeLabel: string };
  memberOptions: EcCreateMemberOption[];
  isMemberSearching: boolean;
  onMemberSearchChange?: (search: string) => void;
  onRequestMembers?: () => void;
  memberCacheRef: React.RefObject<Map<string, EcCreateMemberOption>>;
  onUpdateStage: (stageType: EcCreateStageType, patch: Partial<EcCreateStageInput>) => void;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{config.label}</p>
        <div className="flex items-center gap-1.5">
          {stage.completionPolicy === "MIN_N_APPROVES" ? (
            <>
              <span className="text-xs text-muted-foreground">최소</span>
              <Input
                type="number"
                min={1}
                max={stage.assigneeIds.length || 10}
                value={stage.minApprovals ?? 1}
                onChange={(e) =>
                  onUpdateStage(stage.stageType, { minApprovals: Number(e.target.value) || 1 })
                }
                className="h-7 w-14 text-center text-xs"
              />
              <span className="text-xs text-muted-foreground">인</span>
            </>
          ) : null}
          <Select
            value={stage.completionPolicy}
            onValueChange={(value) =>
              onUpdateStage(stage.stageType, {
                completionPolicy: value as EcCreateCompletionPolicy,
                minApprovals: value === "MIN_N_APPROVES" ? (stage.minApprovals ?? 1) : null,
              })
            }
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPLETION_POLICY_LABELS).map(([value, policyLabel]) => (
                <SelectItem key={value} value={value}>{policyLabel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{config.assigneeLabel}</span>
          <MemberPickerSection
            label=""
            applyLabel={`${config.assigneeLabel} 추가`}
            availableMembers={memberOptions.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
            }))}
            selectedIds={stage.assigneeIds}
            displayItems={[]}
            onSync={(ids) => onUpdateStage(stage.stageType, { assigneeIds: ids })}
            onRequestMembers={onRequestMembers}
            onSearchChange={onMemberSearchChange}
            isSearching={isMemberSearching}
          />
        </div>
        {stage.assigneeIds.length > 0 ? (
          <div className="divide-y divide-border/50">
            {stage.assigneeIds.map((id) => {
              const member = memberCacheRef.current?.get(id);
              if (!member) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-2 py-2">
                  <div className="flex items-center gap-2">
                    <UserAvatar name={member.name} imageUrl={member.profileImageUrl} className="h-6 w-6 text-[10px]" />
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      onUpdateStage(stage.stageType, {
                        assigneeIds: stage.assigneeIds.filter((aid) => aid !== id),
                      })
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{config.assigneeLabel}를 추가하세요</p>
        )}
      </div>
    </div>
  );
}

/* ── 변경 대상 부품 (생성용) ── */

function AffectedItemsCreateSection({
  items,
  searchedItems,
  isSearching,
  onSearchChange,
  onItemTypeChange,
  onRequest,
  onSync,
}: {
  items: EcCreateAffectedItemInput[];
  searchedItems: AffectedItemSearchItem[];
  isSearching?: boolean;
  onSearchChange?: (search: string) => void;
  onItemTypeChange?: (itemType: "REVISION_RELEASE" | "LIFECYCLE_CHANGE") => void;
  onRequest?: () => void;
  onSync: (items: EcCreateAffectedItemInput[]) => void;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftItemType, setDraftItemType] = useState<"REVISION_RELEASE" | "LIFECYCLE_CHANGE">("REVISION_RELEASE");
  const [draftItems, setDraftItems] = useState<Map<string, AffectedItemType>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  /** 검색 결과에서 선택된 항목의 표시 정보를 캐시 */
  const itemCacheRef = useRef<Map<string, AffectedItemSearchItem>>(new Map());

  for (const item of searchedItems) {
    itemCacheRef.current.set(item.id, item);
  }

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange],
  );

  const handleApply = () => {
    const result = Array.from(draftItems.entries()).map(([targetId, itemType]) => ({
      targetId,
      itemType,
    }));
    onSync(result);
    setPopoverOpen(false);
    setQuery("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">
          변경 대상 부품
          {items.length > 0 ? (
            <span className="ml-1 text-muted-foreground/50">({items.length})</span>
          ) : null}
        </h3>
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open);
            if (open) {
              onRequest?.();
              setDraftItemType("REVISION_RELEASE");
              onItemTypeChange?.("REVISION_RELEASE");
              setQuery("");
              onSearchChange?.("");
              const initial = new Map<string, AffectedItemType>();
              for (const item of items) {
                initial.set(item.targetId, item.itemType);
              }
              setDraftItems(initial);
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
              <p className="text-xs font-medium text-foreground">변경 대상 부품</p>
              <div className="flex gap-1.5">
                <Button
                  variant={draftItemType === "REVISION_RELEASE" ? "default" : "outline"}
                  size="xs"
                  onClick={() => {
                    setDraftItemType("REVISION_RELEASE");
                    onItemTypeChange?.("REVISION_RELEASE");
                    setQuery("");
                    onSearchChange?.("");
                  }}
                >
                  <FileText className="h-3 w-3" />
                  리비전 릴리즈
                </Button>
                <Button
                  variant={draftItemType === "LIFECYCLE_CHANGE" ? "default" : "outline"}
                  size="xs"
                  onClick={() => {
                    setDraftItemType("LIFECYCLE_CHANGE");
                    onItemTypeChange?.("LIFECYCLE_CHANGE");
                    setQuery("");
                    onSearchChange?.("");
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                  Lifecycle 변경
                </Button>
              </div>
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="품번 또는 이름으로 검색"
                />
                {isSearching ? (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  </div>
                ) : null}
              </div>
              <div className="max-h-48 space-y-1 overflow-auto">
                {searchedItems.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    {query.trim() ? "검색 결과가 없습니다." : "품번 또는 이름을 입력하여 검색하세요."}
                  </p>
                ) : (
                  searchedItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                    >
                      <Checkbox
                        checked={draftItems.has(item.id)}
                        onCheckedChange={(checked) => {
                          setDraftItems((prev) => {
                            const next = new Map(prev);
                            if (checked) {
                              next.set(item.id, draftItemType);
                            } else {
                              next.delete(item.id);
                            }
                            return next;
                          });
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {item.partNumber}
                          {item.revisionCode ? ` (Rev ${item.revisionCode})` : ""}
                        </p>
                        {item.name ? (
                          <p className="truncate text-[11px] text-muted-foreground">{item.name}</p>
                        ) : null}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <Button type="button" size="sm" className="w-full" onClick={handleApply}>
                적용
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {items.length > 0 ? (
        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const cached = itemCacheRef.current.get(item.targetId);
            return (
              <div
                key={item.targetId}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
              >
                {item.itemType === "LIFECYCLE_CHANGE" ? (
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {cached?.partNumber ?? item.targetId}
                    {cached?.revisionCode ? ` (Rev ${cached.revisionCode})` : ""}
                  </p>
                  {cached?.name ? (
                    <p className="truncate text-[11px] text-muted-foreground">{cached.name}</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">변경 대상 없음</p>
      )}
    </div>
  );
}

/* ── 연결된 이슈 피커 (생성용) ── */

function LinkedIssuePickerSection({
  issueOptions,
  selectedIds,
  onSync,
  onRequest,
  onSearchChange,
  isSearching,
}: {
  issueOptions: EcCreateIssueOption[];
  selectedIds: string[];
  onSync: (ids: string[]) => void;
  onRequest?: () => void;
  onSearchChange?: (search: string) => void;
  isSearching?: boolean;
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const issueCacheRef = useRef<Map<string, EcCreateIssueOption>>(new Map());

  for (const issue of issueOptions) {
    issueCacheRef.current.set(issue.id, issue);
  }

  const filteredIssues = useMemo(() => {
    if (!query.trim()) return issueOptions;
    const q = query.toLowerCase();
    return issueOptions.filter(
      (i) => i.title.toLowerCase().includes(q) || String(i.number).includes(q),
    );
  }, [query, issueOptions]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">연결된 이슈</h3>
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
              <p className="text-xs font-medium text-foreground">이슈 연결</p>
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
                {filteredIssues.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    {query.trim() ? "검색 결과가 없습니다." : "연결 가능한 이슈가 없습니다."}
                  </p>
                ) : (
                  filteredIssues.map((issue) => (
                    <label
                      key={issue.id}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted"
                    >
                      <Checkbox
                        checked={draftIds.includes(issue.id)}
                        onCheckedChange={(checked) => {
                          setDraftIds((prev) =>
                            checked ? [...prev, issue.id] : prev.filter((id) => id !== issue.id),
                          );
                        }}
                      />
                      <IssueStatusIcon state={issue.state} className="h-3.5 w-3.5 shrink-0" />
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
                onClick={() => {
                  onSync(draftIds);
                  setPopoverOpen(false);
                  setQuery("");
                }}
              >
                이슈 적용
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {selectedIds.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {selectedIds.map((id) => {
            const issue = issueCacheRef.current.get(id);
            if (!issue) return null;
            return (
              <div key={id} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <IssueStatusIcon state={issue.state} className="h-3.5 w-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    #{issue.number} {issue.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {getIssueStatusConfig(issue.state).label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground/50">연결된 이슈 없음</p>
      )}
    </div>
  );
}
