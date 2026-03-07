import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IssueDetailScreen as IssueDetailScreenView,
  type IssueDetailScreenProps as IssueDetailScreenViewProps,
  resolveFileIconKind,
} from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
import type {
  LookupChangeModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";
import { useTiptapMentionFetchers } from "@/features/change-shared/hooks/use-tiptap-mention-fetchers";
import { useChangeLookupQuery } from "@/features/change-shared/hooks/use-change-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
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
import {
  formatFileSize,
  mapTimelineActivityToEvent,
} from "@/features/change-shared/lib/timeline-event";
import type {
  IssueTimelineActivityModel,
  IssueTimelineCommentModel,
} from "@/features/issue/types/issue-model";
import { normalizeRichTextDocument } from "@/lib/rich-text";

type IssueViewIssue = NonNullable<IssueDetailScreenViewProps["issue"]>;
type IssueViewTimelineItems = IssueDetailScreenViewProps["timelineItems"];

interface IssueDetailScreenProps {
  issueNumber: number;
}

export function IssueDetailScreen({ issueNumber }: IssueDetailScreenProps) {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const currentUser = useMemo(
    () =>
      authUser
        ? {
            id: authUser.id ?? null,
            name: authUser.name ?? null,
            profileImageUrl: authUser.profileImageUrl ?? null,
          }
        : null,
    [authUser],
  );
  const { userMentionFetcher, issueMentionFetcher } = useTiptapMentionFetchers();

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

  const [membersEnabled, setMembersEnabled] = useState(false);
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [partsEnabled, setPartsEnabled] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");
  const [changesEnabled, setChangesEnabled] = useState(false);
  const [changesSearch, setChangesSearch] = useState("");

  const deferredPartsSearch = useDeferredValue(partsSearch.trim());
  const deferredChangesSearch = useDeferredValue(changesSearch.trim());

  const assigneeLookup = useMemberLookupQuery({ limit: 20 }, membersEnabled);
  const labelLookup = useLabelLookupQuery({ limit: 20 }, labelsEnabled);
  const partLookup = usePartLookupQuery(
    { search: deferredPartsSearch || undefined, limit: 20 },
    partsEnabled,
  );
  const changeLookup = useChangeLookupQuery(
    { search: deferredChangesSearch || undefined, limit: 20 },
    changesEnabled,
  );

  const sortedTimeline = useMemo(() => {
    const items = timelineQuery.data ?? [];
    return [...items].sort(
      (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  }, [timelineQuery.data]);

  const commentCount = useMemo(
    () => sortedTimeline.filter((item) => item.type === "comment").length,
    [sortedTimeline],
  );

  const timelineItems = useMemo<IssueViewTimelineItems>(() => {
    const next: IssueViewTimelineItems = [];

    sortedTimeline.forEach((item) => {
      if (item.type === "comment") {
        const commentItem = item as IssueTimelineCommentModel;
        next.push({
          kind: "comment",
          id: commentItem.id,
          author: {
            name: commentItem.author?.fullName ?? "알 수 없는 사용자",
            profileImageUrl: commentItem.author?.profileImageUrl,
          },
          authorId: commentItem.authorId,
          body: normalizeRichTextDocument(commentItem.body),
          createdAt: commentItem.createdAt,
          isModified: commentItem.isModified,
          updatedAt: commentItem.updatedAt,
        });
        return;
      }

      const event = mapTimelineActivityToEvent(item as IssueTimelineActivityModel);
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

  const issueView = useMemo<IssueViewIssue | undefined>(() => {
    if (!issue) return undefined;

    return {
      assignees: issue.assignees.map((assignee) => ({
        id: assignee.userId,
        name: assignee.fullName,
        email: assignee.email,
        profileImageUrl: assignee.profileImageUrl,
      })),
      attachments: issue.files.map((file) => ({
        id: file.fileId,
        name: file.originalName,
        size: formatFileSize(file.fileSize),
        type: resolveFileIconKind({
          contentType: file.contentType,
          name: file.originalName,
        }),
        uploadedBy: "",
        uploadedAt: file.createdAt,
        url: file.fileUrl,
      })),
      body: normalizeRichTextDocument(issue.body),
      createdAt: issue.createdAt,
      createdBy: issue.createdBy
        ? {
            name: issue.createdBy.fullName,
            email: issue.createdBy.email,
            profileImageUrl: issue.createdBy.profileImageUrl,
          }
        : null,
      isModified: issue.isModified,
      labels: issue.labels.map((label) => ({
        id: label.id,
        name: label.name,
        colorHex: label.color,
      })),
      linkedChanges: issue.linkedChanges.map((change) => ({
        id: change.id,
        number: change.number,
        title: change.title,
        state: change.crState,
      })),
      linkedIssues: [],
      number: issue.number,
      relatedParts: issue.parts.map((part) => ({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name ?? "이름 없음",
      })),
      state: issue.state,
      title: issue.title,
    };
  }, [issue]);

  const navigateToIssueMention = (targetIssueNumber: number, issueType: "issue" | "change_request") => {
    navigate(
      issueType === "change_request"
        ? `/changes/requests/${targetIssueNumber}`
        : `/changes/issues/${targetIssueNumber}`,
    );
  };

  return (
    <IssueDetailScreenView
      availableChanges={(changeLookup.data ?? []).map((change: LookupChangeModel) => ({
        id: change.id,
        number: change.number,
        title: change.title,
        state: change.crState,
      }))}
      availableLabels={(labelLookup.data ?? []).map((label: LookupLabelModel) => ({
        id: label.id,
        name: label.name,
        colorHex: label.color,
      }))}
      availableMembers={(assigneeLookup.data ?? []).map((member: LookupMemberModel) => ({
        id: member.userId,
        name: member.fullName,
        email: member.email,
      }))}
      commentCount={commentCount}
      currentUser={currentUser}
      isAttachingFiles={addIssueFilesAction.isPending}
      isChangesSearching={changeLookup.isFetching}
      isClosingIssue={closeIssueAction.isPending}
      isCreatingComment={createCommentAction.isPending}
      isError={issueQuery.isError || timelineQuery.isError}
      isLoading={issueQuery.isLoading}
      isMetaUpdating={
        syncAssigneesAction.isPending ||
        syncLabelsAction.isPending ||
        syncPartsAction.isPending ||
        syncChangesAction.isPending
      }
      isNotFound={!issueQuery.isLoading && !issueQuery.isError && !issue}
      isPartsSearching={partLookup.isFetching}
      isReopeningIssue={reopenIssueAction.isPending}
      isSavingIssue={updateIssueAction.isPending}
      isTimelineLoading={timelineQuery.isLoading}
      issue={issueView}
      linkedChangeIds={issue?.linkedChanges.map((change) => change.id) ?? []}
      mentionFetchers={{
        issue: issueMentionFetcher,
        user: userMentionFetcher,
      }}
      onAttachFiles={async (files) => {
        await addIssueFilesAction.mutateAsync(files);
      }}
      onBack={() => navigate("/changes?view=issues")}
      onChangeSearchChange={setChangesSearch}
      onCloseIssue={() => {
        closeIssueAction.mutate();
      }}
      onCreateComment={async (body) => {
        if (!body) return;

        const normalizedBody = normalizeRichTextDocument(body);
        if (!normalizedBody) return;

        await createCommentAction.mutateAsync(normalizedBody);
      }}
      onCreateLinkedChange={() => {
        if (!issue) return;

        const params = new URLSearchParams({
          issueNumber: String(issue.number),
          issueTitle: issue.title,
        });
        navigate(`/changes/requests/new?${params.toString()}`);
      }}
      onDeleteComment={(commentId) => deleteCommentAction.mutateAsync(commentId)}
      onDeleteFile={(fileId) => deleteIssueFileAction.mutateAsync(fileId)}
      onNavigateToChange={(changeNumber) => navigate(`/changes/requests/${changeNumber}`)}
      onNavigateToIssueMention={navigateToIssueMention}
      onNavigateToPart={(partId) => navigate(`/parts/${partId}`)}
      onPartsSearchChange={setPartsSearch}
      onReopenIssue={() => {
        reopenIssueAction.mutate();
      }}
      onRequestChanges={() => setChangesEnabled(true)}
      onRequestLabels={() => setLabelsEnabled(true)}
      onRequestMembers={() => setMembersEnabled(true)}
      onRequestParts={() => setPartsEnabled(true)}
      onRetry={() => {
        void issueQuery.refetch();
        void timelineQuery.refetch();
      }}
      onSaveIssue={async ({ body, title }) => {
        await updateIssueAction.mutateAsync({
          title,
          body: body ? normalizeRichTextDocument(body) : null,
        });
      }}
      onSyncAssignees={async (userIds) => {
        await syncAssigneesAction.mutateAsync(userIds);
      }}
      onSyncLabels={async (labelIds) => {
        await syncLabelsAction.mutateAsync(labelIds);
      }}
      onSyncLinkedChanges={async (changeIds) => {
        await syncChangesAction.mutateAsync(changeIds);
      }}
      onSyncParts={async (partIds) => {
        await syncPartsAction.mutateAsync(partIds);
      }}
      onUpdateComment={async (commentId, body) => {
        if (!body) return;

        const normalizedBody = normalizeRichTextDocument(body);
        if (!normalizedBody) return;

        await updateCommentAction.mutateAsync({
          commentId,
          body: normalizedBody,
        });
      }}
      searchedParts={(partLookup.data ?? []).map((part: LookupPartModel) => ({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name ?? null,
      }))}
      selectedAssigneeIds={issue?.assignees.map((assignee) => assignee.userId) ?? []}
      selectedLabelIds={issue?.labels.map((label) => label.id) ?? []}
      selectedPartIds={issue?.parts.map((part) => part.id) ?? []}
      timelineItems={timelineItems}
    />
  );
}
