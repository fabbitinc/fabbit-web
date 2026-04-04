import { useDeferredValue, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { type TiptapEditorProps } from "@fabbit/ui";
import { changeSharedQueries } from "@/features/change-shared/api/change-shared.queries";
import {
  EngineeringChangeDetailScreen as EngineeringChangeDetailScreenView,
  type EngineeringChangeDetailScreenProps as EngineeringChangeDetailScreenViewProps,
} from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
import type {
  LookupIssueModel,
} from "@/features/change-shared/types/change-shared-model";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { useTiptapMentionFetchers } from "@/features/change-shared/hooks/use-tiptap-mention-fetchers";
import { useIssueLookupQuery } from "@/features/change-shared/hooks/use-issue-lookup-query";
import { useAddEngineeringChangeFilesAction } from "@/features/engineering-change/hooks/use-add-engineering-change-files-action";
import { useEngineeringChangeDetailQuery } from "@/features/engineering-change/hooks/use-engineering-change-detail-query";
import { useEngineeringChangeTimelineQuery } from "@/features/engineering-change/hooks/use-engineering-change-timeline-query";
import { useCloseEngineeringChangeAction } from "@/features/engineering-change/hooks/use-close-engineering-change-action";
import { useCreateEngineeringChangeCommentAction } from "@/features/engineering-change/hooks/use-create-engineering-change-comment-action";
import { useDeleteEngineeringChangeCommentAction } from "@/features/engineering-change/hooks/use-delete-engineering-change-comment-action";
import { useDeleteEngineeringChangeFileAction } from "@/features/engineering-change/hooks/use-delete-engineering-change-file-action";
import { useMergeEngineeringChangeAction } from "@/features/engineering-change/hooks/use-merge-engineering-change-action";
import { useReopenEngineeringChangeAction } from "@/features/engineering-change/hooks/use-reopen-engineering-change-action";
import { useSubmitEngineeringChangeAction } from "@/features/engineering-change/hooks/use-submit-engineering-change-action";
import { useSyncEngineeringChangeIssuesAction } from "@/features/engineering-change/hooks/use-sync-engineering-change-issues-action";
import { useUpdateEngineeringChangeAction } from "@/features/engineering-change/hooks/use-update-engineering-change-action";
import { useUpdateEngineeringChangeCommentAction } from "@/features/engineering-change/hooks/use-update-engineering-change-comment-action";
import { useSyncEngineeringChangeStepsAction } from "@/features/engineering-change/hooks/use-sync-engineering-change-steps-action";
import { mapTimelineActivityToEvent } from "@/features/change-shared/lib/timeline-event";
import type {
  EngineeringChangeDetailTab,
  EngineeringChangeTimelineActivityModel,
  EngineeringChangeTimelineCommentModel,
} from "@/features/engineering-change/types/engineering-change-model";
import { normalizeRichTextDocument } from "@/lib/rich-text";

const detailTabs: { id: EngineeringChangeDetailTab; label: string }[] = [
  { id: "conversation", label: "대화" },
  { id: "changes", label: "변경 내용" },
];

interface EngineeringChangeDetailScreenProps {
  activeTab: EngineeringChangeDetailTab;
  engineeringChangeId: string;
  onTabChange: (tab: EngineeringChangeDetailTab) => void;
}

export function EngineeringChangeDetailScreen({
  activeTab,
  engineeringChangeId,
  onTabChange,
}: EngineeringChangeDetailScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { userMentionFetcher, issueMentionFetcher } = useTiptapMentionFetchers();

  const engineeringChangeQuery = useEngineeringChangeDetailQuery(engineeringChangeId);
  const timelineQuery = useEngineeringChangeTimelineQuery(engineeringChangeId, activeTab === "conversation");
  const updateEngineeringChangeAction = useUpdateEngineeringChangeAction(engineeringChangeId);
  const syncIssuesAction = useSyncEngineeringChangeIssuesAction(engineeringChangeId);
  const createCommentAction = useCreateEngineeringChangeCommentAction(engineeringChangeId);
  const updateCommentAction = useUpdateEngineeringChangeCommentAction(engineeringChangeId);
  const deleteCommentAction = useDeleteEngineeringChangeCommentAction(engineeringChangeId);
  const addFilesAction = useAddEngineeringChangeFilesAction(engineeringChangeId);
  const deleteFileAction = useDeleteEngineeringChangeFileAction(engineeringChangeId);
  const submitEngineeringChangeAction = useSubmitEngineeringChangeAction(engineeringChangeId);
  const mergeEngineeringChangeAction = useMergeEngineeringChangeAction(
    engineeringChangeId,
    engineeringChangeQuery.data?.state,
  );
  const closeEngineeringChangeAction = useCloseEngineeringChangeAction(engineeringChangeId);
  const reopenEngineeringChangeAction = useReopenEngineeringChangeAction(engineeringChangeId);

  const syncStepsAction = useSyncEngineeringChangeStepsAction(engineeringChangeId);

  const engineeringChange = engineeringChangeQuery.data;

  const [issuesEnabled, setIssuesEnabled] = useState(false);
  const [issuesSearch, setIssuesSearch] = useState("");
  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [stepsSearch, setStepsSearch] = useState("");

  const deferredIssuesSearch = useDeferredValue(issuesSearch.trim());

  const deferredStepsSearch = useDeferredValue(stepsSearch.trim());

  const issueLookup = useIssueLookupQuery(
    { search: deferredIssuesSearch || undefined },
    issuesEnabled,
  );

  const memberLookup = useMemberLookupQuery(
    { search: deferredStepsSearch || undefined },
    stepsEnabled,
  );

  const sortedTimeline = useMemo(() => {
    const items = timelineQuery.data ?? [];
    return [...items].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  }, [timelineQuery.data]);

  const commentCount = useMemo(
    () => sortedTimeline.filter((item) => item.type === "comment").length,
    [sortedTimeline],
  );

  const timelineItems = useMemo<EngineeringChangeDetailScreenViewProps["timelineItems"]>(() => {
    const next: EngineeringChangeDetailScreenViewProps["timelineItems"] = [];

    sortedTimeline.forEach((item) => {
      if (item.type === "comment") {
        const commentItem = item as EngineeringChangeTimelineCommentModel;
        next.push({
          kind: "comment",
          id: commentItem.id,
          author: commentItem.author
            ? {
                fullName: commentItem.author.fullName ?? "알 수 없는 사용자",
                profileImageUrl: commentItem.author.profileImageUrl,
              }
            : null,
          authorId: commentItem.authorId,
          body: normalizeRichTextDocument(commentItem.body),
          createdAt: commentItem.createdAt,
          isModified: commentItem.isModified,
          updatedAt: commentItem.updatedAt,
        });
        return;
      }

      const event = mapTimelineActivityToEvent(item as EngineeringChangeTimelineActivityModel);
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

  const navigateToIssueMention = async (targetIssueNumber: number, issueType: "issue" | "engineering_change") => {
    if (issueType === "engineering_change") {
      if (engineeringChange?.number === targetIssueNumber) {
        navigate(`/changes/engineering-changes/${engineeringChange.id}`);
        return;
      }

      const changes = await queryClient.fetchQuery(
        changeSharedQueries.changes({ search: String(targetIssueNumber), limit: 20 }),
      );
      const matchedChange = changes.find((change) => change.number === targetIssueNumber);

      if (matchedChange) {
        navigate(`/changes/engineering-changes/${matchedChange.id}`);
      }

      return;
    }

    const linkedIssue = engineeringChange?.linkedIssues.find((issue) => issue.number === targetIssueNumber);

    if (linkedIssue) {
      navigate(`/changes/issues/${linkedIssue.id}`);
      return;
    }

    const issues = await queryClient.fetchQuery(
      changeSharedQueries.issues({ search: String(targetIssueNumber), limit: 20 }),
    );
    const matchedIssue = issues.find((issue) => issue.number === targetIssueNumber);

    if (matchedIssue) {
      navigate(`/changes/issues/${matchedIssue.id}`);
    }
  };

  const engineeringChangeViewModel = engineeringChange
    ? {
        title: engineeringChange.title,
        number: engineeringChange.number,
        engineeringChangeState: engineeringChange.state,
        commentsCount: commentCount,
        createdAt: engineeringChange.createdAt,
        updatedAt: engineeringChange.updatedAt,
        mergedAt: engineeringChange.mergedAt,
        mergedBy: engineeringChange.mergedBy,
        body: normalizeRichTextDocument(engineeringChange.body),
        isModified: engineeringChange.isModified,
        createdBy: engineeringChange.createdBy
          ? {
              fullName: engineeringChange.createdBy.fullName ?? "알 수 없음",
              profileImageUrl: engineeringChange.createdBy.profileImageUrl,
            }
          : null,
        assignees: [],
        reviewers: engineeringChange.reviewers.map((reviewer) => ({
          userId: reviewer.userId,
          fullName: reviewer.fullName,
          email: reviewer.email,
          phone: reviewer.phone,
          profileImageUrl: reviewer.profileImageUrl,
          reviewStatus: reviewer.reviewStatus,
          reviewedAt: reviewer.reviewedAt,
        })),
        labels: [],
        parts: engineeringChange.parts.map((part) => ({
          id: part.id,
          partNumber: part.partNumber,
          name: part.name,
        })),
        files: engineeringChange.files.map((file) => ({
          fileId: file.fileId,
          originalName: file.originalName,
          contentType: file.contentType,
          fileSize: file.fileSize,
          fileUrl: file.fileUrl,
          createdAt: file.createdAt,
        })),
        linkedIssues: engineeringChange.linkedIssues.map((linkedIssue) => ({
          id: linkedIssue.id,
          number: linkedIssue.number,
          title: linkedIssue.title,
          state: linkedIssue.state,
        })),
      }
    : undefined;

  return (
    <EngineeringChangeDetailScreenView
      engineeringChange={engineeringChangeViewModel}
      activeTab={activeTab}
      commentCount={commentCount}
      workflowData={engineeringChange?.workflow ? {
        stages: engineeringChange.workflow.stages.map((stage) => ({
          id: stage.id,
          label: stage.label,
          type: stage.type,
          status: stage.status,
          description: stage.description,
          assignees: stage.assignees.map((assignee) => ({
            id: assignee.id,
            name: assignee.name,
            type: assignee.type,
            status: assignee.status,
            profileImageUrl: assignee.profileImageUrl,
            actedAt: assignee.actedAt,
            actedByName: assignee.actedByName,
            subtitle: assignee.subtitle,
          })),
        })),
      } : undefined}
      workflowStagePicker={engineeringChange?.workflow ? {
        availableMembers: (memberLookup.data ?? []).map((member) => ({
          id: member.userId,
          name: member.fullName,
          email: member.email,
        })),
        onRequest: () => setStepsEnabled(true),
        onSearchChange: setStepsSearch,
        onSync: (stageType, userIds) => {
          if (!engineeringChange.workflow) return;
          syncStepsAction.mutate({
            stageType: stageType as "REVIEW" | "APPROVAL" | "RELEASE",
            userIds,
            currentWorkflow: engineeringChange.workflow,
          });
        },
        isSearching: memberLookup.isFetching,
        isUpdating: syncStepsAction.isPending,
      } : undefined}
      currentUser={{
        id: currentUser?.id ?? null,
        name: currentUser?.name ?? null,
        profileImageUrl: currentUser?.profileImageUrl ?? null,
      }}
      isAttachingFiles={addFilesAction.isPending}
      isCreatingComment={createCommentAction.isPending}
      isError={engineeringChangeQuery.isError || timelineQuery.isError}
      isLoading={engineeringChangeQuery.isLoading}
      isMergingEngineeringChange={mergeEngineeringChangeAction.isPending}
      isNotFound={!engineeringChangeQuery.isLoading && !engineeringChangeQuery.isError && !engineeringChange}
      isReopeningEngineeringChange={reopenEngineeringChangeAction.isPending}
      isSavingEngineeringChange={updateEngineeringChangeAction.isPending}
      isSubmittingEngineeringChange={submitEngineeringChangeAction.isPending}
      isTimelineLoading={timelineQuery.isLoading}
      mentionFetchers={{
        user: userMentionFetcher,
        issue: issueMentionFetcher,
      }}
      linkedIssuePicker={{
        availableIssues: (issueLookup.data ?? []).map((item: LookupIssueModel) => ({
          id: item.id,
          number: item.number,
          title: item.title,
          state: item.state,
        })),
        selectedIds: engineeringChange?.linkedIssues.map((linkedIssue) => linkedIssue.id) ?? [],
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
      onBack={() => navigate("/changes?view=engineering-changes")}
      onCloseEngineeringChange={() => {
        closeEngineeringChangeAction.mutate();
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
      onMergeEngineeringChange={() => {
        mergeEngineeringChangeAction.mutate();
      }}
      onNavigateToIssue={async (linkedIssueDisplayNumber: number) => {
        const linkedIssue = engineeringChange?.linkedIssues.find(
          (issue) => issue.number === linkedIssueDisplayNumber,
        );

        if (linkedIssue) {
          navigate(`/changes/issues/${linkedIssue.id}`);
          return;
        }

        const issues = await queryClient.fetchQuery(
          changeSharedQueries.issues({ search: String(linkedIssueDisplayNumber), limit: 20 }),
        );
        const matchedIssue = issues.find(
          (issue) => issue.number === linkedIssueDisplayNumber,
        );

        if (matchedIssue) {
          navigate(`/changes/issues/${matchedIssue.id}`);
        }
      }}
      onNavigateToIssueMention={navigateToIssueMention}
      onReopenEngineeringChange={() => {
        if (engineeringChange?.state !== "CANCELED") {
          reopenEngineeringChangeAction.mutate();
        }
      }}
      onRetry={() => {
        void engineeringChangeQuery.refetch();
        void timelineQuery.refetch();
      }}
      onSaveEngineeringChange={async ({ title, body }: { title: string; body: TiptapEditorProps["content"] | null }) => {
        await updateEngineeringChangeAction.mutateAsync({
          title,
          body: normalizeRichTextDocument(body),
        });
      }}
      onSubmitEngineeringChange={() => {
        submitEngineeringChangeAction.mutate();
      }}
      onTabChange={(tab: string) => onTabChange(tab as EngineeringChangeDetailTab)}
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
