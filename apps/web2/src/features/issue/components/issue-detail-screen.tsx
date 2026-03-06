import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { Badge, Button, ConfirmDialog, Input, UserAvatar } from "@fabbit/ui";
import { uploadFiles } from "@/api/file.api";
import { useAuthStore } from "@/features/auth";
import { ChangeRichTextEditor } from "@/features/change-shared";
import { useChangeLookupQuery } from "@/features/change-shared/hooks/use-change-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import type {
  LookupChangeModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";
import { IssueSelectionDialog } from "@/features/issue/components/issue-selection-dialog";
import { IssueSidebar } from "@/features/issue/components/issue-sidebar";
import { IssueTimelineSection } from "@/features/issue/components/issue-timeline-section";
import { useAddIssueFilesAction } from "@/features/issue/hooks/use-add-issue-files-action";
import { useCloseIssueAction } from "@/features/issue/hooks/use-close-issue-action";
import { useCreateIssueCommentAction } from "@/features/issue/hooks/use-create-issue-comment-action";
import { useDeleteIssueCommentAction } from "@/features/issue/hooks/use-delete-issue-comment-action";
import { useDeleteIssueFileAction } from "@/features/issue/hooks/use-delete-issue-file-action";
import { useIssueDetailQuery } from "@/features/issue/hooks/use-issue-detail-query";
import { useIssueTimelineQuery } from "@/features/issue/hooks/use-issue-timeline-query";
import { useReopenIssueAction } from "@/features/issue/hooks/use-reopen-issue-action";
import { useSyncIssueAssigneesAction } from "@/features/issue/hooks/use-sync-issue-assignees-action";
import { useSyncIssueChangesAction } from "@/features/issue/hooks/use-sync-issue-changes-action";
import { useSyncIssueLabelsAction } from "@/features/issue/hooks/use-sync-issue-labels-action";
import { useSyncIssuePartsAction } from "@/features/issue/hooks/use-sync-issue-parts-action";
import { useUpdateIssueAction } from "@/features/issue/hooks/use-update-issue-action";
import { useUpdateIssueCommentAction } from "@/features/issue/hooks/use-update-issue-comment-action";
import { normalizeRichTextDocument, type RichTextDocument } from "@/lib/rich-text";

type SelectionDialogKind = "assignees" | "labels" | "parts" | "changes";
type SelectionDialogItem = LookupMemberModel | LookupLabelModel | LookupPartModel | LookupChangeModel;

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getIssueStateLabel(state: string) {
  return state === "CLOSED" ? "닫힘" : "열림";
}

interface IssueDetailScreenProps {
  issueNumber: number;
}

export function IssueDetailScreen({ issueNumber }: IssueDetailScreenProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const issueQuery = useIssueDetailQuery(issueNumber);
  const timelineQuery = useIssueTimelineQuery(issueNumber);
  const updateIssueAction = useUpdateIssueAction(issueNumber);
  const syncAssigneesAction = useSyncIssueAssigneesAction(issueNumber);
  const syncLabelsAction = useSyncIssueLabelsAction(issueNumber);
  const syncPartsAction = useSyncIssuePartsAction(issueNumber);
  const syncChangesAction = useSyncIssueChangesAction(issueNumber);
  const createCommentAction = useCreateIssueCommentAction(issueNumber);
  const updateCommentAction = useUpdateIssueCommentAction(issueNumber);
  const deleteCommentAction = useDeleteIssueCommentAction(issueNumber);
  const addIssueFilesAction = useAddIssueFilesAction(issueNumber);
  const deleteIssueFileAction = useDeleteIssueFileAction(issueNumber);
  const closeIssueAction = useCloseIssueAction(issueNumber);
  const reopenIssueAction = useReopenIssueAction(issueNumber);

  const issue = issueQuery.data;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<RichTextDocument | null>(null);
  const [dialogKind, setDialogKind] = useState<SelectionDialogKind | null>(null);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selectedDialogIds, setSelectedDialogIds] = useState<string[]>([]);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const deferredDialogSearch = useDeferredValue(dialogSearch.trim());

  const assigneeLookup = useMemberLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "assignees",
  );
  const labelLookup = useLabelLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "labels",
  );
  const partLookup = usePartLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "parts",
  );
  const changeLookup = useChangeLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "changes",
  );

  useEffect(() => {
    if (!issue || isEditing) {
      return;
    }

    setTitle(issue.title);
    setBody(normalizeRichTextDocument(issue.body));
  }, [issue, isEditing]);

  const dialogConfig = useMemo(() => {
    if (!issue || !dialogKind) {
      return null;
    }

    switch (dialogKind) {
      case "assignees":
        return {
          title: "담당자 편집",
          description: "이슈를 담당할 멤버를 선택합니다.",
          searchPlaceholder: "이름 또는 이메일로 검색",
          emptyMessage: "검색 조건에 맞는 멤버가 없습니다.",
          items: assigneeLookup.data ?? [],
          isLoading: assigneeLookup.isLoading,
          isPending: syncAssigneesAction.isPending,
          renderItem: (item: LookupMemberModel) => (
            <div className="flex items-center gap-3">
              <UserAvatar imageUrl={item.profileImageUrl} name={item.fullName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.email}</p>
              </div>
            </div>
          ),
        };
      case "labels":
        return {
          title: "라벨 편집",
          description: "이슈 분류에 사용할 라벨을 선택합니다.",
          searchPlaceholder: "라벨 이름으로 검색",
          emptyMessage: "검색 조건에 맞는 라벨이 없습니다.",
          items: labelLookup.data ?? [],
          isLoading: labelLookup.isLoading,
          isPending: syncLabelsAction.isPending,
          renderItem: (item: LookupLabelModel) => (
            <div className="flex items-center gap-3">
              <Badge variant="outline">{item.name}</Badge>
              <span className="text-xs text-muted-foreground">{item.color}</span>
            </div>
          ),
        };
      case "parts":
        return {
          title: "관련 부품 편집",
          description: "이슈와 연결할 부품을 선택합니다.",
          searchPlaceholder: "부품 번호 또는 이름으로 검색",
          emptyMessage: "검색 조건에 맞는 부품이 없습니다.",
          items: partLookup.data ?? [],
          isLoading: partLookup.isLoading,
          isPending: syncPartsAction.isPending,
          renderItem: (item: LookupPartModel) => (
            <div>
              <p className="truncate text-sm font-medium text-foreground">{item.partNumber}</p>
              <p className="truncate text-xs text-muted-foreground">{item.name ?? "이름 없음"}</p>
            </div>
          ),
        };
      case "changes":
        return {
          title: "변경 요청 연결 편집",
          description: "기존 변경 요청을 이 이슈에 연결합니다.",
          searchPlaceholder: "번호 또는 제목으로 검색",
          emptyMessage: "검색 조건에 맞는 변경 요청이 없습니다.",
          items: changeLookup.data ?? [],
          isLoading: changeLookup.isLoading,
          isPending: syncChangesAction.isPending,
          renderItem: (item: LookupChangeModel) => (
            <div>
              <p className="truncate text-sm font-medium text-foreground">#{item.number} {item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.crState}</p>
            </div>
          ),
        };
      default:
        return null;
    }
  }, [
    assigneeLookup.data,
    assigneeLookup.isLoading,
    changeLookup.data,
    changeLookup.isLoading,
    dialogKind,
    issue,
    labelLookup.data,
    labelLookup.isLoading,
    partLookup.data,
    partLookup.isLoading,
    syncAssigneesAction.isPending,
    syncChangesAction.isPending,
    syncLabelsAction.isPending,
    syncPartsAction.isPending,
  ]);

  if (issueQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (issueQuery.isError || !issue) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">이슈를 불러오지 못했습니다.</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/changes?view=issues")}>
              목록으로
            </Button>
            <Button type="button" onClick={() => void issueQuery.refetch()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const openDialog = (kind: SelectionDialogKind) => {
    setDialogSearch("");
    setDialogKind(kind);
    setSelectedDialogIds(
      kind === "assignees"
        ? issue.assignees.map((assignee) => assignee.userId)
        : kind === "labels"
          ? issue.labels.map((label) => label.id)
          : kind === "parts"
            ? issue.parts.map((part) => part.id)
            : issue.linkedChanges.map((change) => change.id),
    );
  };

  const closeDialog = () => {
    setDialogKind(null);
    setDialogSearch("");
    setSelectedDialogIds([]);
  };

  const handleDialogConfirm = async () => {
    if (!dialogKind) {
      return;
    }

    if (dialogKind === "assignees") {
      await syncAssigneesAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "labels") {
      await syncLabelsAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "parts") {
      await syncPartsAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "changes") {
      await syncChangesAction.mutateAsync(selectedDialogIds);
    }

    closeDialog();
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => navigate("/changes?view=issues")}>
              <ArrowLeft className="size-4" />
              이슈 목록
            </Button>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant="accent">Issue #{issue.number}</Badge>
              <Badge variant={issue.state === "CLOSED" ? "neutral" : "accent"}>{getIssueStateLabel(issue.state)}</Badge>
              {issue.isModified ? <Badge variant="outline">수정됨</Badge> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{issue.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              생성자 {issue.createdBy?.fullName ?? "알 수 없음"} · 생성 {formatDateTime(issue.createdAt)} · 마지막 수정 {formatDateTime(issue.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => { void issueQuery.refetch(); void timelineQuery.refetch(); }}>
              <RefreshCcw className="size-4" />
              새로고침
            </Button>
            {issue.state === "OPEN" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCloseConfirmOpen(true)}
              >
                이슈 닫기
              </Button>
            ) : (
              <Button
                disabled={reopenIssueAction.isPending}
                type="button"
                variant="outline"
                onClick={() => reopenIssueAction.mutate()}
              >
                {reopenIssueAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                다시 열기
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="app-panel rounded-[32px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">이슈 설명</p>
                <p className="mt-1 text-sm text-muted-foreground">제목과 본문을 수정하고, 멘션을 포함한 서술을 관리합니다.</p>
              </div>
              {issue.state === "OPEN" ? (
                <Button type="button" variant="outline" onClick={() => setIsEditing((current) => !current)}>
                  {isEditing ? "편집 종료" : "편집"}
                </Button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="issue-detail-title" className="text-sm font-medium text-foreground">
                    제목
                  </label>
                  <Input
                    id="issue-detail-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">본문</label>
                  <ChangeRichTextEditor
                    content={body ?? undefined}
                    placeholder="이슈 본문을 입력하세요"
                    minHeight={220}
                    onChangeJson={(content) => setBody(normalizeRichTextDocument(content))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setTitle(issue.title);
                      setBody(normalizeRichTextDocument(issue.body));
                      setIsEditing(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    disabled={!title.trim() || updateIssueAction.isPending}
                    type="button"
                    onClick={async () => {
                      try {
                        await updateIssueAction.mutateAsync({
                          title,
                          body,
                        });
                        setIsEditing(false);
                      } catch {
                        return;
                      }
                    }}
                  >
                    {updateIssueAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <ChangeRichTextEditor
                  editable={false}
                  hideToolbar
                  className="border-0 bg-transparent"
                  content={issue.body ?? undefined}
                  minHeight={80}
                  onIssueMentionClick={(targetIssueNumber, issueType) =>
                    navigate(
                      issueType === "change_request"
                        ? `/changes/requests/${targetIssueNumber}`
                        : `/changes/issues/${targetIssueNumber}`,
                    )
                  }
                />
                {!issue.bodyText ? (
                  <p className="mt-2 text-sm text-muted-foreground">아직 입력된 본문이 없습니다.</p>
                ) : null}
              </div>
            )}
          </section>

          <IssueTimelineSection
            currentUserId={currentUserId}
            isLoading={timelineQuery.isLoading}
            items={timelineQuery.data ?? []}
            onCreateComment={async (nextBody) => {
              await createCommentAction.mutateAsync(nextBody);
            }}
            onDeleteComment={async (commentId) => {
              await deleteCommentAction.mutateAsync(commentId);
            }}
            onNavigateToIssueMention={(targetIssueNumber, issueType) =>
              navigate(
                issueType === "change_request"
                  ? `/changes/requests/${targetIssueNumber}`
                  : `/changes/issues/${targetIssueNumber}`,
              )
            }
            onUpdateComment={async (commentId, nextBody) => {
              await updateCommentAction.mutateAsync({
                commentId,
                body: nextBody,
              });
            }}
          />
        </div>

        <IssueSidebar
          issue={issue}
          isAttachingFiles={addIssueFilesAction.isPending}
          onAttachFiles={async (files) => {
            const fileIds = await uploadFiles(files);
            if (fileIds.length > 0) {
              await addIssueFilesAction.mutateAsync(fileIds);
            }
          }}
          onDeleteFile={(fileId) => deleteIssueFileAction.mutateAsync(fileId)}
          onEditAssignees={() => openDialog("assignees")}
          onEditChanges={() => openDialog("changes")}
          onEditLabels={() => openDialog("labels")}
          onEditParts={() => openDialog("parts")}
          onNavigateToChange={(changeNumber) => navigate(`/changes/requests/${changeNumber}`)}
          onCreateLinkedChange={() => {
            const params = new URLSearchParams({
              issueNumber: String(issue.number),
              issueTitle: issue.title,
            });
            navigate(`/changes/requests/new?${params.toString()}`);
          }}
        />
      </div>

      {dialogKind && dialogConfig ? (
        <IssueSelectionDialog<SelectionDialogItem>
          open
          title={dialogConfig.title}
          description={dialogConfig.description}
          searchValue={dialogSearch}
          searchPlaceholder={dialogConfig.searchPlaceholder}
          selectedIds={selectedDialogIds}
          items={dialogConfig.items}
          emptyMessage={dialogConfig.emptyMessage}
          isLoading={dialogConfig.isLoading}
          isPending={dialogConfig.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id)
                ? current.filter((currentId) => currentId !== id)
                : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={dialogConfig.renderItem}
        />
      ) : null}

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="이슈를 닫을까요?"
        description="닫힌 이슈는 다시 열 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="이슈 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          closeIssueAction.mutate();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
