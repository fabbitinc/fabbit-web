import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Paperclip, Search, X } from "lucide-react";
import {
  Button,
  Input,
  Label,
  LabelBadge,
  ScrollArea,
  UserAvatar,
} from "@fabbit/ui";
import { ChangeRichTextEditor } from "@/features/change-shared/components/change-rich-text-editor";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import { normalizeRichTextDocument, type RichTextDocument } from "@/lib/rich-text";

export interface ChangeCreateFormSubmitInput {
  title: string;
  body: RichTextDocument | null;
  assigneeIds: string[];
  reviewerIds: string[];
  labelIds: string[];
  partIds: string[];
  files: File[];
  linkedIssueNumber: number | null;
}

interface ChangeCreateFormProps {
  backHref: string;
  backLabel: string;
  description: string;
  heading: string;
  includeReviewers?: boolean;
  isPending: boolean;
  linkedIssueNumber?: number | null;
  linkedIssueTitle?: string | null;
  submitLabel: string;
  onSubmit: (input: ChangeCreateFormSubmitInput) => Promise<void>;
}

function SelectionSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[24px] border border-border/70 bg-card p-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {children}
    </section>
  );
}

export function ChangeCreateForm({
  backHref,
  backLabel,
  description,
  heading,
  includeReviewers = false,
  isPending,
  linkedIssueNumber: initialLinkedIssueNumber,
  linkedIssueTitle,
  submitLabel,
  onSubmit,
}: ChangeCreateFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<RichTextDocument | null>(null);
  const [linkedIssueNumber, setLinkedIssueNumber] = useState<number | null>(initialLinkedIssueNumber ?? null);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [reviewerSearch, setReviewerSearch] = useState("");
  const [labelSearch, setLabelSearch] = useState("");
  const [partSearch, setPartSearch] = useState("");
  const [debouncedAssigneeSearch, setDebouncedAssigneeSearch] = useState("");
  const [debouncedReviewerSearch, setDebouncedReviewerSearch] = useState("");
  const [debouncedLabelSearch, setDebouncedLabelSearch] = useState("");
  const [debouncedPartSearch, setDebouncedPartSearch] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [reviewerIds, setReviewerIds] = useState<string[]>([]);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [partIds, setPartIds] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedAssigneeSearch(assigneeSearch.trim());
      setDebouncedReviewerSearch(reviewerSearch.trim());
      setDebouncedLabelSearch(labelSearch.trim());
      setDebouncedPartSearch(partSearch.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [assigneeSearch, labelSearch, partSearch, reviewerSearch]);

  const assigneeLookup = useMemberLookupQuery({ search: debouncedAssigneeSearch || undefined, limit: 12 }, true);
  const reviewerLookup = useMemberLookupQuery({ search: debouncedReviewerSearch || undefined, limit: 12 }, includeReviewers);
  const labelLookup = useLabelLookupQuery({ search: debouncedLabelSearch || undefined, limit: 12 }, true);
  const partLookup = usePartLookupQuery({ search: debouncedPartSearch || undefined, limit: 12 }, true);

  return (
    <div className="space-y-4">
      <Button asChild type="button" variant="ghost">
        <a href={backHref}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </a>
      </Button>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="app-panel rounded-[32px] p-6 sm:p-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{heading}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          {linkedIssueNumber != null ? (
            <div className="mt-6 flex items-start justify-between rounded-[24px] border border-border/70 bg-muted/25 px-4 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Linked Issue</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  #{linkedIssueNumber} {linkedIssueTitle ?? ""}
                </p>
              </div>
              <Button size="icon-sm" type="button" variant="ghost" onClick={() => setLinkedIssueNumber(null)}>
                <X className="size-4" />
              </Button>
            </div>
          ) : null}

          <form
            className="mt-6 space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!title.trim()) {
                return;
              }

              await onSubmit({
                title: title.trim(),
                body,
                assigneeIds,
                reviewerIds,
                labelIds,
                partIds,
                files,
                linkedIssueNumber,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="change-create-title">제목</Label>
              <Input
                id="change-create-title"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-create-body">설명</Label>
              <ChangeRichTextEditor
                className="min-h-[320px]"
                content={body ?? undefined}
                placeholder="본문을 입력하세요"
                minHeight={280}
                onChangeJson={(content) => setBody(normalizeRichTextDocument(content))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-create-files">첨부파일</Label>
              <label
                className="flex cursor-pointer items-center justify-center gap-2 rounded-[20px] border border-dashed border-border/80 bg-muted/20 px-4 py-4 text-sm text-muted-foreground"
                htmlFor="change-create-files"
              >
                <Paperclip className="size-4" />
                파일 추가
              </label>
              <Input
                id="change-create-files"
                multiple
                type="file"
                className="hidden"
                onChange={(event) => {
                  const nextFiles = Array.from(event.target.files ?? []);
                  setFiles((current) => [...current, ...nextFiles]);
                  event.target.value = "";
                }}
              />
              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-[18px] border border-border/70 px-3 py-2 text-sm">
                      <span className="truncate text-foreground">{file.name}</span>
                      <Button
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={() => setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
              <Button asChild type="button" variant="outline">
                <a href={backHref}>취소</a>
              </Button>
              <Button disabled={!title.trim() || isPending} type="submit">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitLabel}
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <SelectionSection title="담당자">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="담당자 검색" value={assigneeSearch} onChange={(event) => setAssigneeSearch(event.target.value)} />
            </div>
            <ScrollArea className="h-[180px]">
              <div className="space-y-2 pr-3">
                {assigneeLookup.data?.map((member) => (
                  <button
                    key={member.userId}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-[18px] border px-3 py-2 text-left ${
                      assigneeIds.includes(member.userId) ? "border-primary bg-primary/5" : "border-border/70 bg-background"
                    }`}
                    type="button"
                    onClick={() =>
                      setAssigneeIds((current) =>
                        current.includes(member.userId)
                          ? current.filter((userId) => userId !== member.userId)
                          : [...current, member.userId],
                      )
                    }
                  >
                    <UserAvatar imageUrl={member.profileImageUrl} name={member.fullName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SelectionSection>

          {includeReviewers ? (
            <SelectionSection title="검토자">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-10" placeholder="검토자 검색" value={reviewerSearch} onChange={(event) => setReviewerSearch(event.target.value)} />
              </div>
              <ScrollArea className="h-[180px]">
                <div className="space-y-2 pr-3">
                  {reviewerLookup.data?.map((member) => (
                    <button
                      key={member.userId}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-[18px] border px-3 py-2 text-left ${
                        reviewerIds.includes(member.userId) ? "border-primary bg-primary/5" : "border-border/70 bg-background"
                      }`}
                      type="button"
                      onClick={() =>
                        setReviewerIds((current) =>
                          current.includes(member.userId)
                            ? current.filter((userId) => userId !== member.userId)
                            : [...current, member.userId],
                        )
                      }
                    >
                      <UserAvatar imageUrl={member.profileImageUrl} name={member.fullName} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{member.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </SelectionSection>
          ) : null}

          <SelectionSection title="라벨">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="라벨 검색" value={labelSearch} onChange={(event) => setLabelSearch(event.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {labelLookup.data?.map((label) => (
                <button
                  key={label.id}
                  className={`cursor-pointer rounded-full ${labelIds.includes(label.id) ? "ring-2 ring-primary/40" : ""}`}
                  type="button"
                  onClick={() =>
                    setLabelIds((current) =>
                      current.includes(label.id)
                        ? current.filter((currentId) => currentId !== label.id)
                        : [...current, label.id],
                    )
                  }
                >
                  <LabelBadge colorHex={label.color} label={label.name} size="sm" />
                </button>
              ))}
            </div>
          </SelectionSection>

          <SelectionSection title="부품">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="부품 검색" value={partSearch} onChange={(event) => setPartSearch(event.target.value)} />
            </div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-3">
                {partLookup.data?.map((part) => (
                  <button
                    key={part.id}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-[18px] border px-3 py-2 text-left ${
                      partIds.includes(part.id) ? "border-primary bg-primary/5" : "border-border/70 bg-background"
                    }`}
                    type="button"
                    onClick={() =>
                      setPartIds((current) =>
                        current.includes(part.id)
                          ? current.filter((currentId) => currentId !== part.id)
                          : [...current, part.id],
                      )
                    }
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{part.partNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{part.name || "이름 없음"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </SelectionSection>
        </aside>
      </div>
    </div>
  );
}
