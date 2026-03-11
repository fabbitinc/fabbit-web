import { useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  TiptapEditor,
  type TiptapEditorProps,
} from "@fabbit/ui";
import { FileIcon } from "./file-icon";
import { LabelPickerSection } from "./label-picker-section";
import { MemberPickerSection } from "./member-picker-section";
import { PartPickerSection } from "./part-picker-section";

export interface ChangeCreateScreenMemberOption {
  email: string;
  id: string;
  name: string;
  profileImageUrl?: string | null;
}

export interface ChangeCreateScreenLabelOption {
  colorHex: string;
  id: string;
  name: string;
}

export interface ChangeCreateScreenPartOption {
  id: string;
  name: string | null;
  partNumber: string;
}

export interface ChangeCreateScreenSubmitInput {
  assigneeIds: string[];
  body: TiptapEditorProps["content"] | null;
  files: File[];
  labelIds: string[];
  linkedIssueNumber: number | null;
  partIds: string[];
  reviewerIds: string[];
  title: string;
}

export interface ChangeCreateScreenProps {
  assigneeOptions?: ChangeCreateScreenMemberOption[];
  backLabel: string;
  description: string;
  editorPlaceholder: string;
  heading: string;
  includeReviewers?: boolean;
  isAssigneeSearching?: boolean;
  isLabelSearching?: boolean;
  isPartSearching?: boolean;
  isPending?: boolean;
  isReviewerSearching?: boolean;
  labelOptions?: ChangeCreateScreenLabelOption[];
  linkedIssueNumber?: number | null;
  linkedIssueTitle?: string | null;
  onAssigneeSearchChange?: (search: string) => void;
  onBack: () => void;
  onCancel?: () => void;
  onLabelSearchChange?: (search: string) => void;
  onRequestAssignees?: () => void;
  onRequestLabels?: () => void;
  onRequestParts?: () => void;
  onRequestReviewers?: () => void;
  onPartSearchChange?: (search: string) => void;
  onReviewerSearchChange?: (search: string) => void;
  onSubmit: (input: ChangeCreateScreenSubmitInput) => Promise<void>;
  partOptions?: ChangeCreateScreenPartOption[];
  reviewerOptions?: ChangeCreateScreenMemberOption[];
  submitLabel: string;
  titlePlaceholder: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChangeCreateScreen({
  assigneeOptions = [],
  backLabel,
  description,
  editorPlaceholder,
  heading,
  includeReviewers = false,
  isAssigneeSearching = false,
  isLabelSearching = false,
  isPartSearching = false,
  isPending = false,
  isReviewerSearching = false,
  labelOptions = [],
  linkedIssueNumber: initialLinkedIssueNumber,
  linkedIssueTitle,
  onAssigneeSearchChange,
  onBack,
  onCancel,
  onLabelSearchChange,
  onRequestAssignees,
  onRequestLabels,
  onRequestParts,
  onRequestReviewers,
  onPartSearchChange,
  onReviewerSearchChange,
  onSubmit,
  partOptions = [],
  reviewerOptions = [],
  submitLabel,
  titlePlaceholder,
}: ChangeCreateScreenProps) {
  const [title, setTitle] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<TiptapEditorProps["content"] | null>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [linkedIssueNumber, setLinkedIssueNumber] = useState<number | null>(initialLinkedIssueNumber ?? null);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [reviewerIds, setReviewerIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memberCacheRef = useRef<Map<string, ChangeCreateScreenMemberOption>>(new Map());
  const labelCacheRef = useRef<Map<string, ChangeCreateScreenLabelOption>>(new Map());
  const partCacheRef = useRef<Map<string, ChangeCreateScreenPartOption>>(new Map());

  for (const member of [...assigneeOptions, ...reviewerOptions]) {
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
        {backLabel}
      </button>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{heading}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
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
                reviewerIds,
                labelIds,
                partIds,
                files,
                linkedIssueNumber,
              });
            }}
          >
            {linkedIssueNumber != null ? (
              <div className="flex items-start justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    참조 이슈
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    #{linkedIssueNumber} {linkedIssueTitle ?? ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setLinkedIssueNumber(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="change-create-screen-title">제목</Label>
              <Input
                id="change-create-screen-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={titlePlaceholder}
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
                placeholder={editorPlaceholder}
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onCancel ?? onBack}>
                취소
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {submitLabel}
              </Button>
            </div>
          </form>
        </div>

        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="space-y-5">
            {includeReviewers ? (
              <MemberPickerSection
                label="검토자"
                applyLabel="검토자 적용"
                availableMembers={reviewerOptions.map((member) => ({
                  id: member.id,
                  name: member.name,
                  email: member.email,
                }))}
                selectedIds={reviewerIds}
                displayItems={reviewerIds
                  .map((id) => memberCacheRef.current.get(id))
                  .filter((member): member is ChangeCreateScreenMemberOption => Boolean(member))
                  .map((member) => ({
                    id: member.id,
                    name: member.name,
                    profileImageUrl: member.profileImageUrl,
                  }))}
                onSync={setReviewerIds}
                onRequestMembers={onRequestReviewers}
                onSearchChange={onReviewerSearchChange}
                isSearching={isReviewerSearching}
              />
            ) : null}

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
                .filter((member): member is ChangeCreateScreenMemberOption => Boolean(member))
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
                .filter((label): label is ChangeCreateScreenLabelOption => Boolean(label))}
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
                .filter((part): part is ChangeCreateScreenPartOption => Boolean(part))
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
