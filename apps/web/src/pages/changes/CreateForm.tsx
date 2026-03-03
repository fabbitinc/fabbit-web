import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

export interface CreateFormSubmitData {
  title: string;
  body: Record<string, unknown> | null;
  assigneeIds: string[];
  reviewerIds: string[];
  labelIds: string[];
  partIds: string[];
  files: File[];
  issueNumber: number | null;
}

interface CreateFormProps {
  backTo: string;
  backLabel: string;
  heading: string;
  description: string;
  titlePlaceholder: string;
  editorPlaceholder: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (data: CreateFormSubmitData) => Promise<string | void>;
  /** 사이드바 렌더 함수. assigneeIds/labelIds/partIds getter를 받아 ReactNode를 반환. */
  sidebar?: ReactNode;
  /** 사이드바에서 선택한 상태를 부모에 노출하기 위한 ref */
  sidebarStateRef?: React.RefObject<{
    assigneeIds: string[];
    reviewerIds: string[];
    labelIds: string[];
    partIds: string[];
    files: File[];
  } | null>;
  /** 연결된 이슈 번호 (변경 요청 생성 시) */
  linkedIssueNumber?: number | null;
  /** 연결된 이슈 제목 */
  linkedIssueTitle?: string;
}

export function CreateForm({
  backTo,
  backLabel,
  heading,
  description,
  titlePlaceholder,
  editorPlaceholder,
  submitLabel,
  isPending,
  onSubmit,
  sidebar,
  sidebarStateRef,
  linkedIssueNumber: initialLinkedIssueNumber,
  linkedIssueTitle,
}: CreateFormProps) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [descriptionJson, setDescriptionJson] = useState<Record<string, unknown> | null>(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [linkedIssueNumber, setLinkedIssueNumber] = useState<number | null>(initialLinkedIssueNumber ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const plainBody = descriptionText.trim();

    if (!trimmedTitle) return;

    const sidebarState = sidebarStateRef?.current;

    try {
      const redirectTo = await onSubmit({
        title: trimmedTitle,
        body: plainBody.length > 0 ? descriptionJson : null,
        assigneeIds: sidebarState?.assigneeIds ?? [],
        reviewerIds: sidebarState?.reviewerIds ?? [],
        labelIds: sidebarState?.labelIds ?? [],
        partIds: sidebarState?.partIds ?? [],
        files: sidebarState?.files ?? [],
        issueNumber: linkedIssueNumber,
      });
      navigate(redirectTo ?? backTo);
    } catch {
      // 에러 토스트는 mutation onError에서 처리
    }
  }

  return (
    <div className="mx-auto max-w-[1160px] space-y-4">
      <button
        onClick={() => navigate(backTo)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>

      <div className={sidebar ? "flex gap-6" : ""}>
        {/* 왼쪽: 메인 폼 */}
        <div className="min-w-0 flex-1 rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{heading}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
            {/* 참조 이슈 */}
            {linkedIssueNumber != null && (
              <div className="flex items-start justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    참조 이슈
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-foreground">
                    #{linkedIssueNumber} {linkedIssueTitle}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setLinkedIssueNumber(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label>제목</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                maxLength={500}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>설명</Label>
              <TiptapEditor
                content={descriptionJson ?? ""}
                onChangeJson={(content) => setDescriptionJson(content as Record<string, unknown>)}
                onChangeText={setDescriptionText}
                placeholder={editorPlaceholder}
                minHeight={220}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(backTo)}>
                취소
              </Button>
              <Button type="submit" disabled={!title.trim() || isPending}>
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </form>
        </div>

        {/* 오른쪽: 사이드바 */}
        {sidebar && (
          <div className="hidden w-70 shrink-0 lg:block">
            <div className="space-y-5">{sidebar}</div>
          </div>
        )}
      </div>
    </div>
  );
}
