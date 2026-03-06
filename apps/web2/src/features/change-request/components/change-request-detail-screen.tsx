import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChangeRequestDetailScreen as ChangeRequestDetailScreenView,
  type ChangeRequestDetailScreenProps as ChangeRequestDetailScreenViewProps,
  type TimelineEventData,
  type TimelineEventType,
} from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
import { useTiptapMentionFetchers } from "@/features/change-shared/hooks/use-tiptap-mention-fetchers";
import { useIssueLookupQuery } from "@/features/change-shared/hooks/use-issue-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
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
import type {
  ChangeRequestTimelineActivityModel,
  ChangeRequestDetailTab,
} from "@/features/change-request/types/change-request-model";
import { normalizeRichTextDocument } from "@/lib/rich-text";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "방금";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}일 전`;
  }

  return formatDateTime(dateStr);
}

function mapCrActivityToTimelineEvent(item: ChangeRequestTimelineActivityModel): TimelineEventData | null {
  const actionTypeMap: Record<string, TimelineEventType> = {
    "cr:created": "cr_created",
    "cr:state_changed": "cr_state_changed",
    "cr:merged": "cr_merged",
    "cr:issue_changed": "cr_issue_linked",
    "issue:reviewer_changed": "reviewer_changed",
    "issue:assignee_changed": "assigned",
    "issue:label_changed": "labels_changed",
    "issue:part_changed": "part_added",
    "issue:file_attached": "file_attached",
    "issue:file_detached": "file_detached",
    "issue:mentioned": "issue_mentioned",
  };

  const type = actionTypeMap[item.action];

  if (!type) {
    return null;
  }

  const detail = (item.detail ?? {}) as Record<string, unknown>;

  const event: TimelineEventData = {
    id: item.id,
    type,
    author: {
      name: item.actor?.fullName ?? "알 수 없는 사용자",
      profileImageUrl: item.actor?.profileImageUrl,
    },
    createdAtLabel: timeAgo(item.createdAt),
  };

  if (type === "cr_state_changed") {
    event.content = detail;
  }

  if (type === "assigned" || type === "reviewer_changed") {
    event.addedNames = detail.addedNames as string[] | undefined;
    event.removedNames = detail.removedNames as string[] | undefined;
  }

  if (type === "labels_changed") {
    event.addedLabels = detail.addedLabels as { name: string; color: string }[] | undefined;
    event.removedLabels = detail.removedLabels as { name: string; color: string }[] | undefined;
  }

  if (type === "part_added") {
    event.addedPartCount = detail.addedPartCount as number | undefined;
    event.addedPartNumbers = detail.addedPartNumbers as string[] | undefined;
    event.removedPartCount = detail.removedPartCount as number | undefined;
    event.removedPartNumbers = detail.removedPartNumbers as string[] | undefined;
  }

  if (type === "file_attached" || type === "file_detached") {
    event.fileCount = detail.fileCount as number | undefined;
    event.fileNames = detail.fileNames as string[] | undefined;
  }

  if (type === "cr_issue_linked" || type === "issue_mentioned") {
    event.linkedIssues = detail.linkedIssues as TimelineEventData["linkedIssues"];
    event.linkedIssueCount = detail.linkedIssueCount as number | undefined;
    event.isComment = detail.isComment as boolean | undefined;
  }

  return event;
}

interface ChangeRequestDetailScreenProps {
  activeTab: ChangeRequestDetailTab;
  changeNumber: number;
  onTabChange: (tab: ChangeRequestDetailTab) => void;
}

export function ChangeRequestDetailScreen({
  activeTab,
  changeNumber,
  onTabChange,
}: ChangeRequestDetailScreenProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const { userMentionFetcher, issueMentionFetcher } = useTiptapMentionFetchers();

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

  const [dialogKind, setDialogKind] = useState<SelectionDialogKind | null>(null);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selectedDialogIds, setSelectedDialogIds] = useState<string[]>([]);

  const deferredDialogSearch = useDeferredValue(dialogSearch.trim());

  const memberLookup = useMemberLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "assignees" || dialogKind === "reviewers",
  );
  const labelLookup = useLabelLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "labels",
  );
  const partLookup = usePartLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "parts",
  );
  const issueLookup = useIssueLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "issues",
  );

  const sortedTimeline = useMemo(() => {
    const items = timelineQuery.data ?? [];
    return [...items].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  }, [timelineQuery.data]);

  const commentCount = useMemo(
    () => sortedTimeline.filter((item) => item.type === "comment").length,
    [sortedTimeline],
  );

  const timelineItems = useMemo<ChangeRequestDetailScreenViewProps["timelineItems"]>(() => {
    const next: ChangeRequestDetailScreenViewProps["timelineItems"] = [];

    sortedTimeline.forEach((item) => {
      if (item.type === "comment") {
        next.push({
          kind: "comment",
          id: item.id,
          author: item.author
            ? {
                fullName: item.author.fullName ?? "알 수 없는 사용자",
                profileImageUrl: item.author.profileImageUrl,
              }
            : null,
          authorId: item.authorId,
          body: normalizeRichTextDocument(item.body),
          isModified: item.isModified,
          updatedAt: item.updatedAt,
        });
        return;
      }

      const event = mapCrActivityToTimelineEvent(item);

      if (!event) {
        return;
      }

      next.push({
        kind: "event",
        id: item.id,
        event,
      });
    });

    return next;
  }, [sortedTimeline]);

  const navigateToIssueMention = (targetIssueNumber: number, issueType: "issue" | "change_request") =>
    navigate(
      issueType === "change_request"
        ? `/changes/requests/${targetIssueNumber}`
        : `/changes/issues/${targetIssueNumber}`,
    );

  const openDialog = (kind: SelectionDialogKind) => {
    if (!changeRequest) {
      return;
    }

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
              : changeRequest.linkedIssues.map((linkedIssue) => linkedIssue.id),
    );
  };

  const closeDialog = () => {
    setDialogKind(null);
    setDialogSearch("");
    setSelectedDialogIds([]);
  };

  const dialogConfig = useMemo(() => {
    if (!changeRequest || !dialogKind) {
      return null;
    }

    switch (dialogKind) {
      case "assignees":
        return {
          title: "담당자 편집",
          description: "변경 요청을 담당할 멤버를 선택합니다.",
          searchPlaceholder: "이름 또는 이메일로 검색",
          emptyMessage: "검색 조건에 맞는 멤버가 없습니다.",
          items: (memberLookup.data ?? []).map((member) => ({
            id: member.userId,
            title: member.fullName,
            subtitle: member.email,
            avatarName: member.fullName,
            avatarImageUrl: member.profileImageUrl,
          })),
          isLoading: memberLookup.isLoading,
          isPending: syncAssigneesAction.isPending,
        };
      case "reviewers":
        return {
          title: "검토자 편집",
          description: "변경 요청을 검토할 멤버를 선택합니다.",
          searchPlaceholder: "이름 또는 이메일로 검색",
          emptyMessage: "검색 조건에 맞는 멤버가 없습니다.",
          items: (memberLookup.data ?? []).map((member) => ({
            id: member.userId,
            title: member.fullName,
            subtitle: member.email,
            avatarName: member.fullName,
            avatarImageUrl: member.profileImageUrl,
          })),
          isLoading: memberLookup.isLoading,
          isPending: syncReviewersAction.isPending,
        };
      case "labels":
        return {
          title: "라벨 편집",
          description: "변경 요청 분류에 사용할 라벨을 선택합니다.",
          searchPlaceholder: "라벨 이름으로 검색",
          emptyMessage: "검색 조건에 맞는 라벨이 없습니다.",
          items: (labelLookup.data ?? []).map((label) => ({
            id: label.id,
            title: label.name,
            subtitle: label.color,
          })),
          isLoading: labelLookup.isLoading,
          isPending: syncLabelsAction.isPending,
        };
      case "parts":
        return {
          title: "관련 부품 편집",
          description: "변경 요청과 연결할 부품을 선택합니다.",
          searchPlaceholder: "부품 번호 또는 이름으로 검색",
          emptyMessage: "검색 조건에 맞는 부품이 없습니다.",
          items: (partLookup.data ?? []).map((part) => ({
            id: part.id,
            title: part.partNumber,
            subtitle: part.name ?? "이름 없음",
          })),
          isLoading: partLookup.isLoading,
          isPending: syncPartsAction.isPending,
        };
      case "issues":
        return {
          title: "이슈 연결 편집",
          description: "변경 요청과 연결할 이슈를 선택합니다.",
          searchPlaceholder: "번호 또는 제목으로 검색",
          emptyMessage: "검색 조건에 맞는 이슈가 없습니다.",
          items: (issueLookup.data?.filter((item) => item.type === "issue") ?? []).map((item) => ({
            id: item.id,
            title: `#${item.number} ${item.title}`,
            subtitle: item.state === "CLOSED" ? "닫힘" : "열림",
          })),
          isLoading: issueLookup.isLoading,
          isPending: syncIssuesAction.isPending,
        };
      default:
        return null;
    }
  }, [
    changeRequest,
    dialogKind,
    issueLookup.data,
    issueLookup.isLoading,
    labelLookup.data,
    labelLookup.isLoading,
    memberLookup.data,
    memberLookup.isLoading,
    partLookup.data,
    partLookup.isLoading,
    syncAssigneesAction.isPending,
    syncIssuesAction.isPending,
    syncLabelsAction.isPending,
    syncPartsAction.isPending,
    syncReviewersAction.isPending,
  ]);

  const changeRequestViewModel = changeRequest
    ? {
        title: changeRequest.title,
        number: changeRequest.number,
        crState: changeRequest.crState,
        commentsCount: commentCount,
        createdAt: changeRequest.createdAt,
        updatedAt: changeRequest.updatedAt,
        mergedAt: changeRequest.mergedAt,
        mergedBy: changeRequest.mergedBy,
        body: normalizeRichTextDocument(changeRequest.body),
        isModified: changeRequest.isModified,
        createdBy: changeRequest.createdBy
          ? {
              fullName: changeRequest.createdBy.fullName ?? "알 수 없음",
              profileImageUrl: changeRequest.createdBy.profileImageUrl,
            }
          : null,
        assignees: changeRequest.assignees.map((assignee) => ({
          userId: assignee.userId,
          fullName: assignee.fullName,
          email: assignee.email,
          phone: assignee.phone,
          profileImageUrl: assignee.profileImageUrl,
        })),
        reviewers: changeRequest.reviewers.map((reviewer) => ({
          userId: reviewer.userId,
          fullName: reviewer.fullName,
          email: reviewer.email,
          phone: reviewer.phone,
          profileImageUrl: reviewer.profileImageUrl,
          reviewStatus: reviewer.reviewStatus,
          reviewedAt: reviewer.reviewedAt,
        })),
        labels: changeRequest.labels.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })),
        parts: changeRequest.parts.map((part) => ({
          id: part.id,
          partNumber: part.partNumber,
          name: part.name,
        })),
        files: changeRequest.files.map((file) => ({
          fileId: file.fileId,
          originalName: file.originalName,
          contentType: file.contentType,
          fileSize: file.fileSize,
          fileUrl: file.fileUrl,
          createdAt: file.createdAt,
        })),
        linkedIssues: changeRequest.linkedIssues.map((linkedIssue) => ({
          id: linkedIssue.id,
          number: linkedIssue.number,
          title: linkedIssue.title,
          state: linkedIssue.state,
        })),
      }
    : undefined;

  return (
    <ChangeRequestDetailScreenView
      changeRequest={changeRequestViewModel}
      activeTab={activeTab}
      tabs={detailTabs}
      timelineItems={timelineItems}
      commentCount={commentCount}
      isLoading={changeRequestQuery.isLoading}
      isError={changeRequestQuery.isError || !changeRequest}
      isTimelineLoading={timelineQuery.isLoading}
      isSavingChangeRequest={updateChangeRequestAction.isPending}
      isCreatingComment={createCommentAction.isPending}
      isSubmittingChangeRequest={submitChangeRequestAction.isPending}
      isMergingChangeRequest={mergeChangeRequestAction.isPending}
      isReopeningChangeRequest={reopenChangeRequestAction.isPending}
      isAttachingFiles={addFilesAction.isPending}
      currentUser={{
        id: currentUser?.id ?? null,
        name: currentUser?.name ?? null,
        profileImageUrl: currentUser?.profileImageUrl ?? null,
      }}
      mentionFetchers={{
        user: userMentionFetcher,
        issue: issueMentionFetcher,
      }}
      dialog={
        dialogKind && dialogConfig
          ? {
              ...dialogConfig,
              searchValue: dialogSearch,
              selectedIds: selectedDialogIds,
              onOpenChange: (open) => {
                if (!open) {
                  closeDialog();
                }
              },
              onSearchChange: setDialogSearch,
              onToggle: (id) =>
                setSelectedDialogIds((previous) =>
                  previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
                ),
              onConfirm: async () => {
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
              },
            }
          : null
      }
      onBack={() => navigate("/changes?view=requests")}
      onRetry={() => {
        void changeRequestQuery.refetch();
      }}
      onTabChange={(tab) => onTabChange(tab as ChangeRequestDetailTab)}
      onSaveChangeRequest={async ({ title, body }) => {
        const normalizedBody = normalizeRichTextDocument(body);

        if (!normalizedBody) {
          return;
        }

        await updateChangeRequestAction.mutateAsync({
          title,
          body: normalizedBody,
        });
      }}
      onCreateComment={async (body) => {
        const normalizedBody = normalizeRichTextDocument(body);

        if (!normalizedBody) {
          return;
        }

        await createCommentAction.mutateAsync(normalizedBody);
      }}
      onUpdateComment={async (commentId, body) => {
        const normalizedBody = normalizeRichTextDocument(body);

        if (!normalizedBody) {
          return;
        }

        await updateCommentAction.mutateAsync({
          commentId,
          body: normalizedBody,
        });
      }}
      onDeleteComment={async (commentId) => {
        await deleteCommentAction.mutateAsync(commentId);
      }}
      onSubmitChangeRequest={() => {
        submitChangeRequestAction.mutate();
      }}
      onMergeChangeRequest={() => {
        mergeChangeRequestAction.mutate();
      }}
      onCloseChangeRequest={() => {
        closeChangeRequestAction.mutate();
      }}
      onReopenChangeRequest={() => {
        reopenChangeRequestAction.mutate();
      }}
      onNavigateToIssueMention={navigateToIssueMention}
      onEditAssignees={() => openDialog("assignees")}
      onEditReviewers={() => openDialog("reviewers")}
      onEditLabels={() => openDialog("labels")}
      onEditParts={() => openDialog("parts")}
      onEditIssues={() => openDialog("issues")}
      onNavigateToIssue={(issueNumber) => navigate(`/changes/issues/${issueNumber}`)}
      onAttachFiles={async (files) => {
        await addFilesAction.mutateAsync(files);
      }}
      onDeleteFile={async (fileId) => {
        await deleteFileAction.mutateAsync(fileId);
      }}
    />
  );
}
