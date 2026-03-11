import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type TiptapEditorProps } from "@fabbit/ui";
import {
  ChangeRequestDetailScreen as ChangeRequestDetailScreenView,
  type ChangeRequestDetailScreenProps as ChangeRequestDetailScreenViewProps,
} from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
import type {
  LookupIssueModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";
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
import { mapTimelineActivityToEvent } from "@/features/change-shared/lib/timeline-event";
import type {
  ChangeRequestDetailTab,
  ChangeRequestTimelineActivityModel,
} from "@/features/change-request/types/change-request-model";
import { normalizeRichTextDocument } from "@/lib/rich-text";

const detailTabs: { id: ChangeRequestDetailTab; label: string }[] = [
  { id: "conversation", label: "대화" },
  { id: "changes", label: "변경 내용" },
];

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

  const [membersEnabled, setMembersEnabled] = useState(false);
  const [membersSearch, setMembersSearch] = useState("");
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [labelsSearch, setLabelsSearch] = useState("");
  const [partsEnabled, setPartsEnabled] = useState(false);
  const [issuesEnabled, setIssuesEnabled] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");
  const [issuesSearch, setIssuesSearch] = useState("");

  const deferredPartsSearch = useDeferredValue(partsSearch.trim());
  const deferredIssuesSearch = useDeferredValue(issuesSearch.trim());

  const memberLookup = useMemberLookupQuery(
    { search: membersSearch.trim() || undefined },
    membersEnabled,
  );
  const labelLookup = useLabelLookupQuery(
    { search: labelsSearch.trim() || undefined },
    labelsEnabled,
  );
  const partLookup = usePartLookupQuery(
    { search: deferredPartsSearch || undefined },
    partsEnabled,
  );
  const issueLookup = useIssueLookupQuery(
    { search: deferredIssuesSearch || undefined },
    issuesEnabled,
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
          createdAt: item.createdAt,
          isModified: item.isModified,
          updatedAt: item.updatedAt,
        });
        return;
      }

      const event = mapTimelineActivityToEvent(item as ChangeRequestTimelineActivityModel);

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
      commentCount={commentCount}
      currentUser={{
        id: currentUser?.id ?? null,
        name: currentUser?.name ?? null,
        profileImageUrl: currentUser?.profileImageUrl ?? null,
      }}
      isAttachingFiles={addFilesAction.isPending}
      isCreatingComment={createCommentAction.isPending}
      isError={changeRequestQuery.isError || timelineQuery.isError}
      isLoading={changeRequestQuery.isLoading}
      isMergingChangeRequest={mergeChangeRequestAction.isPending}
      isNotFound={!changeRequestQuery.isLoading && !changeRequestQuery.isError && !changeRequest}
      isReopeningChangeRequest={reopenChangeRequestAction.isPending}
      isSavingChangeRequest={updateChangeRequestAction.isPending}
      isSubmittingChangeRequest={submitChangeRequestAction.isPending}
      isTimelineLoading={timelineQuery.isLoading}
      mentionFetchers={{
        user: userMentionFetcher,
        issue: issueMentionFetcher,
      }}
      assigneePicker={{
        availableMembers: (memberLookup.data ?? []).map((member: LookupMemberModel) => ({
          id: member.userId,
          name: member.fullName,
          email: member.email,
        })),
        selectedIds: changeRequest?.assignees.map((assignee) => assignee.userId) ?? [],
        onRequest: () => setMembersEnabled(true),
        onSearchChange: setMembersSearch,
        onSync: async (userIds: string[]) => {
          await syncAssigneesAction.mutateAsync(userIds);
        },
        isSearching: memberLookup.isFetching,
        isUpdating: syncAssigneesAction.isPending,
      }}
      reviewerPicker={{
        availableMembers: (memberLookup.data ?? []).map((member: LookupMemberModel) => ({
          id: member.userId,
          name: member.fullName,
          email: member.email,
        })),
        selectedIds: changeRequest?.reviewers.map((reviewer) => reviewer.userId) ?? [],
        onRequest: () => setMembersEnabled(true),
        onSearchChange: setMembersSearch,
        onSync: async (userIds: string[]) => {
          await syncReviewersAction.mutateAsync(userIds);
        },
        isSearching: memberLookup.isFetching,
        isUpdating: syncReviewersAction.isPending,
      }}
      labelPicker={{
        availableLabels: (labelLookup.data ?? []).map((label: LookupLabelModel) => ({
          id: label.id,
          name: label.name,
          colorHex: label.color,
        })),
        selectedIds: changeRequest?.labels.map((label) => label.id) ?? [],
        onRequest: () => setLabelsEnabled(true),
        onSearchChange: setLabelsSearch,
        onSync: async (labelIds: string[]) => {
          await syncLabelsAction.mutateAsync(labelIds);
        },
        isSearching: labelLookup.isFetching,
        isUpdating: syncLabelsAction.isPending,
      }}
      partPicker={{
        searchedParts: (partLookup.data ?? []).map((part: LookupPartModel) => ({
          id: part.id,
          partNumber: part.partNumber,
          name: part.name ?? null,
        })),
        selectedIds: changeRequest?.parts.map((part) => part.id) ?? [],
        onRequest: () => setPartsEnabled(true),
        onSearchChange: setPartsSearch,
        onSync: async (partIds: string[]) => {
          await syncPartsAction.mutateAsync(partIds);
        },
        isSearching: partLookup.isFetching,
        isUpdating: syncPartsAction.isPending,
      }}
      linkedIssuePicker={{
        availableIssues: (issueLookup.data?.filter((item: LookupIssueModel) => item.type === "issue") ?? []).map(
          (item: LookupIssueModel) => ({
            id: item.id,
            number: item.number,
            title: item.title,
            state: item.state,
          }),
        ),
        selectedIds: changeRequest?.linkedIssues.map((linkedIssue) => linkedIssue.id) ?? [],
        onRequest: () => setIssuesEnabled(true),
        onSearchChange: setIssuesSearch,
        onSync: async (issueIds: string[]) => {
          await syncIssuesAction.mutateAsync(issueIds);
        },
        isSearching: issueLookup.isFetching,
        isUpdating: syncIssuesAction.isPending,
      }}
      onAttachFiles={async (files: File[]) => {
        await addFilesAction.mutateAsync(files);
      }}
      onBack={() => navigate("/changes?view=requests")}
      onCloseChangeRequest={() => {
        closeChangeRequestAction.mutate();
      }}
      onCreateComment={async (body: TiptapEditorProps["content"] | null) => {
        const normalizedBody = normalizeRichTextDocument(body);

        if (!normalizedBody) {
          return;
        }

        await createCommentAction.mutateAsync(normalizedBody);
      }}
      onDeleteComment={async (commentId: string) => {
        await deleteCommentAction.mutateAsync(commentId);
      }}
      onDeleteFile={async (fileId: string) => {
        await deleteFileAction.mutateAsync(fileId);
      }}
      onMergeChangeRequest={() => {
        mergeChangeRequestAction.mutate();
      }}
      onNavigateToIssue={(issueNumber: number) => navigate(`/changes/issues/${issueNumber}`)}
      onNavigateToIssueMention={navigateToIssueMention}
      onReopenChangeRequest={() => {
        reopenChangeRequestAction.mutate();
      }}
      onRetry={() => {
        void changeRequestQuery.refetch();
        void timelineQuery.refetch();
      }}
      onSaveChangeRequest={async ({ title, body }: { title: string; body: TiptapEditorProps["content"] | null }) => {
        await updateChangeRequestAction.mutateAsync({
          title,
          body: normalizeRichTextDocument(body),
        });
      }}
      onSubmitChangeRequest={() => {
        submitChangeRequestAction.mutate();
      }}
      onTabChange={(tab: string) => onTabChange(tab as ChangeRequestDetailTab)}
      onUpdateComment={async (commentId: string, body: TiptapEditorProps["content"] | null) => {
        const normalizedBody = normalizeRichTextDocument(body);

        if (!normalizedBody) {
          return;
        }

        await updateCommentAction.mutateAsync({
          commentId,
          body: normalizedBody,
        });
      }}
      tabs={detailTabs}
      timelineItems={timelineItems}
    />
  );
}
