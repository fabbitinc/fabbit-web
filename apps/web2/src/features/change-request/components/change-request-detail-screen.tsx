import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileCheck, GitMerge, Loader2, RefreshCcw } from "lucide-react";
import { Badge, Button, ConfirmDialog, Input, UserAvatar } from "@fabbit/ui";
import { uploadFiles } from "@/api/file.api";
import { useAuthStore } from "@/features/auth";
import { useIssueLookupQuery } from "@/features/change-shared/hooks/use-issue-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import type {
  LookupIssueModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";
import { ChangeRichTextEditor } from "@/features/change-shared";
import { ChangeRequestDiffTab } from "@/features/change-request/components/change-request-diff-tab";
import { ChangeRequestSelectionDialog } from "@/features/change-request/components/change-request-selection-dialog";
import { ChangeRequestSidebar } from "@/features/change-request/components/change-request-sidebar";
import { ChangeRequestTimelineSection } from "@/features/change-request/components/change-request-timeline-section";
import { useAddChangeRequestFilesAction } from "@/features/change-request/hooks/use-add-change-request-files-action";
import { useChangeRequestDetailQuery } from "@/features/change-request/hooks/use-change-request-detail-query";
import { useChangeRequestTimelineQuery } from "@/features/change-request/hooks/use-change-request-timeline-query";
import { useCloseChangeRequestAction } from "@/features/change-request/hooks/use-close-change-request-action";
import { useCreateChangeRequestCommentAction } from "@/features/change-request/hooks/use-create-change-request-comment-action";
import { useDeleteChangeRequestCommentAction } from "@/features/change-request/hooks/use-delete-change-request-comment-action";
import { useDeleteChangeRequestFileAction } from "@/features/change-request/hooks/use-delete-change-request-file-action";
import { useMergeChangeRequestAction } from "@/features/change-request/hooks/use-merge-change-request-action";
import { useReopenChangeRequestAction } from "@/features/change-request/hooks/use-reopen-change-request-action";
import { useSubmitChangeRequestAction } from "@/features/change-request/hooks/use-submit-change-request-action";
import { useSyncChangeRequestAssigneesAction } from "@/features/change-request/hooks/use-sync-change-request-assignees-action";
import { useSyncChangeRequestIssuesAction } from "@/features/change-request/hooks/use-sync-change-request-issues-action";
import { useSyncChangeRequestLabelsAction } from "@/features/change-request/hooks/use-sync-change-request-labels-action";
import { useSyncChangeRequestPartsAction } from "@/features/change-request/hooks/use-sync-change-request-parts-action";
import { useSyncChangeRequestReviewersAction } from "@/features/change-request/hooks/use-sync-change-request-reviewers-action";
import { useUpdateChangeRequestAction } from "@/features/change-request/hooks/use-update-change-request-action";
import { useUpdateChangeRequestCommentAction } from "@/features/change-request/hooks/use-update-change-request-comment-action";
import type { ChangeRequestDetailTab } from "@/features/change-request/types/change-request-model";
import { normalizeRichTextDocument, type RichTextDocument } from "@/lib/rich-text";

type SelectionDialogKind = "assignees" | "reviewers" | "labels" | "parts" | "issues";

const detailTabs: { id: ChangeRequestDetailTab; label: string }[] = [
  { id: "conversation", label: "대화" },
  { id: "changes", label: "변경 내용" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChangeRequestStateLabel(state: string) {
  const stateLabelMap: Record<string, string> = {
    DRAFT: "초안",
    OPEN: "열림",
    SUBMITTED: "제출됨",
    MERGED: "반영됨",
    CLOSED: "닫힘",
  };

  return stateLabelMap[state] ?? state;
}

function getChangeRequestStateVariant(state: string): "outline" | "neutral" | "accent" | "success" {
  if (state === "MERGED") {
    return "success";
  }

  if (state === "CLOSED") {
    return "neutral";
  }

  if (state === "DRAFT") {
    return "outline";
  }

  return "accent";
}

interface ChangeRequestDetailScreenProps {
  changeNumber: number;
  activeTab: ChangeRequestDetailTab;
  onTabChange: (tab: ChangeRequestDetailTab) => void;
}

export function ChangeRequestDetailScreen({
  changeNumber,
  activeTab,
  onTabChange,
}: ChangeRequestDetailScreenProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const changeRequestQuery = useChangeRequestDetailQuery(changeNumber);
  const timelineQuery = useChangeRequestTimelineQuery(changeNumber, activeTab === "conversation");
  const updateChangeRequestAction = useUpdateChangeRequestAction(changeNumber);
  const syncAssigneesAction = useSyncChangeRequestAssigneesAction(changeNumber);
  const syncReviewersAction = useSyncChangeRequestReviewersAction(changeNumber);
  const syncLabelsAction = useSyncChangeRequestLabelsAction(changeNumber);
  const syncPartsAction = useSyncChangeRequestPartsAction(changeNumber);
  const syncIssuesAction = useSyncChangeRequestIssuesAction(changeNumber);
  const createCommentAction = useCreateChangeRequestCommentAction(changeNumber);
  const updateCommentAction = useUpdateChangeRequestCommentAction(changeNumber);
  const deleteCommentAction = useDeleteChangeRequestCommentAction(changeNumber);
  const addFilesAction = useAddChangeRequestFilesAction(changeNumber);
  const deleteFileAction = useDeleteChangeRequestFileAction(changeNumber);
  const submitChangeRequestAction = useSubmitChangeRequestAction(changeNumber);
  const mergeChangeRequestAction = useMergeChangeRequestAction(changeNumber);
  const closeChangeRequestAction = useCloseChangeRequestAction(changeNumber);
  const reopenChangeRequestAction = useReopenChangeRequestAction(changeNumber);

  const changeRequest = changeRequestQuery.data;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState<RichTextDocument | null>(null);
  const [dialogKind, setDialogKind] = useState<SelectionDialogKind | null>(null);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selectedDialogIds, setSelectedDialogIds] = useState<string[]>([]);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);

  const deferredDialogSearch = useDeferredValue(dialogSearch.trim());

  const memberLookup = useMemberLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "assignees" || dialogKind === "reviewers",
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
  const issueLookup = useIssueLookupQuery(
    {
      search: deferredDialogSearch || undefined,
      limit: 20,
    },
    dialogKind === "issues",
  );

  useEffect(() => {
    if (!changeRequest || isEditing) {
      return;
    }

    setTitle(changeRequest.title);
    setBody(normalizeRichTextDocument(changeRequest.body));
  }, [changeRequest, isEditing]);

  if (changeRequestQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (changeRequestQuery.isError || !changeRequest) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">변경 요청을 불러오지 못했습니다.</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/changes?view=requests")}>
              목록으로
            </Button>
            <Button type="button" onClick={() => void changeRequestQuery.refetch()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = changeRequest.crState !== "MERGED" && changeRequest.crState !== "CLOSED";
  const canSubmit = changeRequest.crState === "DRAFT";
  const canMerge = changeRequest.crState === "OPEN" || changeRequest.crState === "SUBMITTED";
  const canClose =
    changeRequest.crState === "DRAFT" ||
    changeRequest.crState === "OPEN" ||
    changeRequest.crState === "SUBMITTED";
  const canReopen = changeRequest.crState === "CLOSED";

  const openDialog = (kind: SelectionDialogKind) => {
    setDialogSearch("");
    setDialogKind(kind);
    setSelectedDialogIds(
      kind === "assignees"
        ? changeRequest.assignees.map((assignee) => assignee.userId)
        : kind === "reviewers"
          ? changeRequest.reviewers.map((reviewer) => reviewer.userId)
          : kind === "labels"
            ? changeRequest.labels.map((label) => label.id)
            : kind === "parts"
              ? changeRequest.parts.map((part) => part.id)
              : changeRequest.linkedIssues.map((issue) => issue.id),
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

    if (dialogKind === "reviewers") {
      await syncReviewersAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "labels") {
      await syncLabelsAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "parts") {
      await syncPartsAction.mutateAsync(selectedDialogIds);
    }

    if (dialogKind === "issues") {
      await syncIssuesAction.mutateAsync(selectedDialogIds);
    }

    closeDialog();
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Button type="button" variant="ghost" onClick={() => navigate("/changes?view=requests")}>
              <ArrowLeft className="size-4" />
              변경 요청 목록
            </Button>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Badge variant="accent">Change Request #{changeRequest.number}</Badge>
              <Badge variant={getChangeRequestStateVariant(changeRequest.crState)}>
                {getChangeRequestStateLabel(changeRequest.crState)}
              </Badge>
              {changeRequest.isModified ? <Badge variant="outline">수정됨</Badge> : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{changeRequest.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              생성자 {changeRequest.createdBy?.fullName ?? "알 수 없음"} · 생성 {formatDateTime(changeRequest.createdAt)} · 마지막 수정{" "}
              {formatDateTime(changeRequest.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void changeRequestQuery.refetch();
                if (activeTab === "conversation") {
                  void timelineQuery.refetch();
                }
              }}
            >
              <RefreshCcw className="size-4" />
              새로고침
            </Button>
            {canSubmit ? (
              <Button
                disabled={submitChangeRequestAction.isPending}
                type="button"
                onClick={() => submitChangeRequestAction.mutate()}
              >
                {submitChangeRequestAction.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck className="size-4" />}
                제출
              </Button>
            ) : null}
            {canMerge ? (
              <Button
                disabled={mergeChangeRequestAction.isPending}
                type="button"
                onClick={() => mergeChangeRequestAction.mutate()}
              >
                {mergeChangeRequestAction.isPending ? <Loader2 className="size-4 animate-spin" /> : <GitMerge className="size-4" />}
                변경 반영
              </Button>
            ) : null}
            {canClose ? (
              <Button type="button" variant="outline" onClick={() => setIsCloseConfirmOpen(true)}>
                변경 요청 닫기
              </Button>
            ) : null}
            {canReopen ? (
              <Button
                disabled={reopenChangeRequestAction.isPending}
                type="button"
                variant="outline"
                onClick={() => reopenChangeRequestAction.mutate()}
              >
                {reopenChangeRequestAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                다시 제출
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="app-panel rounded-[32px] p-2">
        <div className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`cursor-pointer rounded-[20px] px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {activeTab === "conversation" ? (
            <>
              <section className="app-panel rounded-[32px] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-foreground">변경 요청 설명</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      제목과 본문을 수정하고, 멘션을 포함한 서술을 관리합니다.
                    </p>
                  </div>
                  {isEditable ? (
                    <Button type="button" variant="outline" onClick={() => setIsEditing((current) => !current)}>
                      {isEditing ? "편집 종료" : "편집"}
                    </Button>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="change-request-detail-title" className="text-sm font-medium text-foreground">
                        제목
                      </label>
                      <Input
                        id="change-request-detail-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">본문</label>
                      <ChangeRichTextEditor
                        content={body ?? undefined}
                        placeholder="변경 요청 본문을 입력하세요"
                        minHeight={220}
                        onChangeJson={(content) => setBody(normalizeRichTextDocument(content))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTitle(changeRequest.title);
                          setBody(normalizeRichTextDocument(changeRequest.body));
                          setIsEditing(false);
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        disabled={!title.trim() || updateChangeRequestAction.isPending}
                        type="button"
                        onClick={async () => {
                          try {
                            await updateChangeRequestAction.mutateAsync({
                              title,
                              body,
                            });
                            setIsEditing(false);
                          } catch {
                            return;
                          }
                        }}
                      >
                        {updateChangeRequestAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
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
                      content={changeRequest.body ?? undefined}
                      minHeight={80}
                      onIssueMentionClick={(targetIssueNumber, issueType) =>
                        navigate(
                          issueType === "change_request"
                            ? `/changes/requests/${targetIssueNumber}`
                            : `/changes/issues/${targetIssueNumber}`,
                        )
                      }
                    />
                    {!changeRequest.bodyText ? (
                      <p className="mt-2 text-sm text-muted-foreground">아직 입력된 본문이 없습니다.</p>
                    ) : null}
                  </div>
                )}
              </section>

              <ChangeRequestTimelineSection
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
            </>
          ) : (
            <ChangeRequestDiffTab />
          )}
        </div>

        <ChangeRequestSidebar
          changeRequest={changeRequest}
          isAttachingFiles={addFilesAction.isPending}
          onAttachFiles={async (files) => {
            const fileIds = await uploadFiles(files);
            if (fileIds.length > 0) {
              await addFilesAction.mutateAsync(fileIds);
            }
          }}
          onDeleteFile={(fileId) => deleteFileAction.mutateAsync(fileId)}
          onEditAssignees={() => openDialog("assignees")}
          onEditIssues={() => openDialog("issues")}
          onEditLabels={() => openDialog("labels")}
          onEditParts={() => openDialog("parts")}
          onEditReviewers={() => openDialog("reviewers")}
          onNavigateToIssue={(issueNumber) => navigate(`/changes/issues/${issueNumber}`)}
        />
      </div>

      {dialogKind === "assignees" ? (
        <ChangeRequestSelectionDialog<LookupMemberModel>
          open
          title="담당자 편집"
          description="변경 요청을 담당할 멤버를 선택합니다."
          searchValue={dialogSearch}
          searchPlaceholder="이름 또는 이메일로 검색"
          selectedIds={selectedDialogIds}
          items={memberLookup.data ?? []}
          getItemId={(item) => item.userId}
          emptyMessage="검색 조건에 맞는 멤버가 없습니다."
          isLoading={memberLookup.isLoading}
          isPending={syncAssigneesAction.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={(item) => (
            <div className="flex items-center gap-3">
              <UserAvatar imageUrl={item.profileImageUrl} name={item.fullName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.email}</p>
              </div>
            </div>
          )}
        />
      ) : null}

      {dialogKind === "reviewers" ? (
        <ChangeRequestSelectionDialog<LookupMemberModel>
          open
          title="검토자 편집"
          description="변경 요청을 검토할 멤버를 선택합니다."
          searchValue={dialogSearch}
          searchPlaceholder="이름 또는 이메일로 검색"
          selectedIds={selectedDialogIds}
          items={memberLookup.data ?? []}
          getItemId={(item) => item.userId}
          emptyMessage="검색 조건에 맞는 멤버가 없습니다."
          isLoading={memberLookup.isLoading}
          isPending={syncReviewersAction.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={(item) => (
            <div className="flex items-center gap-3">
              <UserAvatar imageUrl={item.profileImageUrl} name={item.fullName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{item.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.email}</p>
              </div>
            </div>
          )}
        />
      ) : null}

      {dialogKind === "labels" ? (
        <ChangeRequestSelectionDialog<LookupLabelModel>
          open
          title="라벨 편집"
          description="변경 요청 분류에 사용할 라벨을 선택합니다."
          searchValue={dialogSearch}
          searchPlaceholder="라벨 이름으로 검색"
          selectedIds={selectedDialogIds}
          items={labelLookup.data ?? []}
          getItemId={(item) => item.id}
          emptyMessage="검색 조건에 맞는 라벨이 없습니다."
          isLoading={labelLookup.isLoading}
          isPending={syncLabelsAction.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={(item) => (
            <div className="flex items-center gap-3">
              <Badge variant="outline">{item.name}</Badge>
              <span className="text-xs text-muted-foreground">{item.color}</span>
            </div>
          )}
        />
      ) : null}

      {dialogKind === "parts" ? (
        <ChangeRequestSelectionDialog<LookupPartModel>
          open
          title="관련 부품 편집"
          description="변경 요청과 연결할 부품을 선택합니다."
          searchValue={dialogSearch}
          searchPlaceholder="부품 번호 또는 이름으로 검색"
          selectedIds={selectedDialogIds}
          items={partLookup.data ?? []}
          getItemId={(item) => item.id}
          emptyMessage="검색 조건에 맞는 부품이 없습니다."
          isLoading={partLookup.isLoading}
          isPending={syncPartsAction.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={(item) => (
            <div>
              <p className="truncate text-sm font-medium text-foreground">{item.partNumber}</p>
              <p className="truncate text-xs text-muted-foreground">{item.name ?? "이름 없음"}</p>
            </div>
          )}
        />
      ) : null}

      {dialogKind === "issues" ? (
        <ChangeRequestSelectionDialog<LookupIssueModel>
          open
          title="이슈 연결 편집"
          description="변경 요청과 연결할 이슈를 선택합니다."
          searchValue={dialogSearch}
          searchPlaceholder="번호 또는 제목으로 검색"
          selectedIds={selectedDialogIds}
          items={issueLookup.data?.filter((item) => item.type === "issue") ?? []}
          getItemId={(item) => item.id}
          emptyMessage="검색 조건에 맞는 이슈가 없습니다."
          isLoading={issueLookup.isLoading}
          isPending={syncIssuesAction.isPending}
          onOpenChange={(open) => {
            if (!open) {
              closeDialog();
            }
          }}
          onSearchChange={setDialogSearch}
          onToggle={(id) =>
            setSelectedDialogIds((current) =>
              current.includes(id) ? current.filter((currentId) => currentId !== id) : [...current, id],
            )
          }
          onConfirm={handleDialogConfirm}
          renderItem={(item) => (
            <div>
              <p className="truncate text-sm font-medium text-foreground">#{item.number} {item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.state === "CLOSED" ? "닫힘" : "열림"}</p>
            </div>
          )}
        />
      ) : null}

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="변경 요청을 닫을까요?"
        description="닫힌 변경 요청은 다시 제출할 수 있지만, 현재 작업 흐름에서는 닫힘 상태로 집계됩니다."
        confirmLabel="변경 요청 닫기"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setIsCloseConfirmOpen(false)}
        onConfirm={() => {
          closeChangeRequestAction.mutate();
        }}
        onOpenChange={setIsCloseConfirmOpen}
      />
    </div>
  );
}
