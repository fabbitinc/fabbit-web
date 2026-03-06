import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IssueDetailScreen as IssueDetailScreenView,
  type IssueDetailScreenProps as IssueDetailScreenViewProps,
  type TimelineEventData,
  type TimelineEventType,
} from "@fabbit/components";
import { useAuthStore } from "@/features/auth";
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
import type {
  IssueTimelineActivityModel,
  IssueTimelineCommentModel,
} from "@/features/issue/types/issue-model";
import { normalizeRichTextDocument } from "@/lib/rich-text";

type SelectionDialogKind = "assignees" | "labels" | "parts" | "changes";
type IssueViewDialog = IssueDetailScreenViewProps["dialog"];
type IssueViewIssue = NonNullable<IssueDetailScreenViewProps["issue"]>;
type IssueViewTimelineItems = IssueDetailScreenViewProps["timelineItems"];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;

  return formatDateTime(dateStr);
}

function mapActivityToTimelineEvent(item: IssueTimelineActivityModel): TimelineEventData | null {
  const actionTypeMap: Record<string, TimelineEventType> = {
    "issue:created": "issue_created",
    "issue:state_changed": "status_change",
    "issue:assignee_changed": "assigned",
    "issue:label_changed": "labels_changed",
    "issue:part_changed": "part_added",
    "issue:file_attached": "file_attached",
    "issue:file_detached": "file_detached",
    "issue:cr_changed": "cr_changed",
    "issue:closed": "status_change",
    "issue:reopened": "status_change",
    "issue:mentioned": "issue_mentioned",
  };

  const type = actionTypeMap[item.action];
  if (!type) return null;

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

  if (item.action === "issue:closed") event.content = "closed";
  if (item.action === "issue:reopened") event.content = "open";

  if (item.action === "issue:state_changed") {
    const to = (detail.to as string | undefined)?.toLowerCase();
    event.content = to === "closed" ? "closed" : "open";
  }

  if (type === "assigned") {
    event.addedNames = detail.addedNames as string[] | undefined;
    event.removedNames = detail.removedNames as string[] | undefined;
  }

  if (type === "labels_changed") {
    event.addedLabels = detail.addedLabels as { color: string; name: string }[] | undefined;
    event.removedLabels = detail.removedLabels as { color: string; name: string }[] | undefined;
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

  if (type === "cr_changed") {
    event.linkedIssueCount = detail.linkedIssueCount as number | undefined;
    event.linkedIssues = detail.linkedIssues as TimelineEventData["linkedIssues"];
  }

  if (type === "issue_mentioned") {
    event.linkedIssues = detail.linkedIssues as TimelineEventData["linkedIssues"];
    event.isComment = detail.isComment as boolean | undefined;
  }

  return event;
}

function getFileType(contentType: string): "pdf" | "step" | "dwg" | "xlsx" | "image" | "other" {
  if (contentType.includes("pdf")) return "pdf";
  if (contentType.includes("step") || contentType.includes("stp")) return "step";
  if (contentType.includes("dwg")) return "dwg";
  if (contentType.includes("sheet") || contentType.includes("xlsx")) return "xlsx";
  if (contentType.startsWith("image/")) return "image";
  return "other";
}

interface IssueDetailScreenProps {
  issueNumber: number;
}

export function IssueDetailScreen({ issueNumber }: IssueDetailScreenProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) =>
    state.user
      ? {
          id: state.user.id ?? null,
          name: state.user.name ?? null,
          profileImageUrl: state.user.profileImageUrl ?? null,
        }
      : null,
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

  const [dialogKind, setDialogKind] = useState<SelectionDialogKind | null>(null);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selectedDialogIds, setSelectedDialogIds] = useState<string[]>([]);

  const deferredDialogSearch = useDeferredValue(dialogSearch.trim());

  const assigneeLookup = useMemberLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "assignees",
  );
  const labelLookup = useLabelLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "labels",
  );
  const partLookup = usePartLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "parts",
  );
  const changeLookup = useChangeLookupQuery(
    { search: deferredDialogSearch || undefined, limit: 20 },
    dialogKind === "changes",
  );

  const sortedTimeline = useMemo(() => {
    const items = timelineQuery.data ?? [];
    return [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [timelineQuery.data]);

  const commentCount = useMemo(
    () => sortedTimeline.filter((item) => item.type === "comment").length,
    [sortedTimeline],
  );

  const timelineItems = useMemo<IssueViewTimelineItems>(() => {
    const items: IssueViewTimelineItems = [];

    sortedTimeline.forEach((item) => {
      if (item.type === "comment") {
        const commentItem = item as IssueTimelineCommentModel;
        items.push({
          kind: "comment",
          id: commentItem.id,
          author: {
            name: commentItem.author?.fullName ?? "알 수 없는 사용자",
            profileImageUrl: commentItem.author?.profileImageUrl,
          },
          authorId: commentItem.authorId,
          body: commentItem.body ?? null,
          isModified: commentItem.isModified,
          updatedAt: commentItem.updatedAt,
        });
        return;
      }

      const event = mapActivityToTimelineEvent(item as IssueTimelineActivityModel);
      if (event) {
        items.push({
          kind: "event",
          id: item.id,
          event,
        });
      }
    });

    return items;
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
        size: `${Math.round(file.fileSize / 1024)}KB`,
        type: getFileType(file.contentType),
        uploadedBy: "",
        uploadedAt: file.createdAt,
        url: file.fileUrl,
      })),
      body: issue.body ?? null,
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

  const closeDialog = () => {
    setDialogKind(null);
    setDialogSearch("");
    setSelectedDialogIds([]);
  };

  const dialog = useMemo<IssueViewDialog>(() => {
    if (!issue || !dialogKind) return null;

    switch (dialogKind) {
      case "assignees":
        return {
          title: "담당자 편집",
          description: "이슈를 담당할 멤버를 선택합니다.",
          searchValue: dialogSearch,
          searchPlaceholder: "이름 또는 이메일로 검색",
          selectedIds: selectedDialogIds,
          items: (assigneeLookup.data ?? []).map((member) => ({
            id: member.userId,
            title: member.fullName,
            subtitle: member.email,
            avatarName: member.fullName,
            avatarImageUrl: member.profileImageUrl,
          })),
          emptyMessage: "검색 조건에 맞는 멤버가 없습니다.",
          isLoading: assigneeLookup.isLoading,
          isPending: syncAssigneesAction.isPending,
          onOpenChange: (open) => {
            if (!open) closeDialog();
          },
          onSearchChange: setDialogSearch,
          onToggle: (id) => {
            setSelectedDialogIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
            );
          },
          onConfirm: async () => {
            await syncAssigneesAction.mutateAsync(selectedDialogIds);
            closeDialog();
          },
        };
      case "labels":
        return {
          title: "라벨 편집",
          description: "이슈 분류에 사용할 라벨을 선택합니다.",
          searchValue: dialogSearch,
          searchPlaceholder: "라벨 이름으로 검색",
          selectedIds: selectedDialogIds,
          items: (labelLookup.data ?? []).map((label) => ({
            id: label.id,
            title: label.name,
            subtitle: label.color,
            badgeLabel: label.name,
          })),
          emptyMessage: "검색 조건에 맞는 라벨이 없습니다.",
          isLoading: labelLookup.isLoading,
          isPending: syncLabelsAction.isPending,
          onOpenChange: (open) => {
            if (!open) closeDialog();
          },
          onSearchChange: setDialogSearch,
          onToggle: (id) => {
            setSelectedDialogIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
            );
          },
          onConfirm: async () => {
            await syncLabelsAction.mutateAsync(selectedDialogIds);
            closeDialog();
          },
        };
      case "parts":
        return {
          title: "관련 부품 편집",
          description: "이슈와 연결할 부품을 선택합니다.",
          searchValue: dialogSearch,
          searchPlaceholder: "부품 번호 또는 이름으로 검색",
          selectedIds: selectedDialogIds,
          items: (partLookup.data ?? []).map((part) => ({
            id: part.id,
            title: part.partNumber,
            subtitle: part.name ?? "이름 없음",
          })),
          emptyMessage: "검색 조건에 맞는 부품이 없습니다.",
          isLoading: partLookup.isLoading,
          isPending: syncPartsAction.isPending,
          onOpenChange: (open) => {
            if (!open) closeDialog();
          },
          onSearchChange: setDialogSearch,
          onToggle: (id) => {
            setSelectedDialogIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
            );
          },
          onConfirm: async () => {
            await syncPartsAction.mutateAsync(selectedDialogIds);
            closeDialog();
          },
        };
      case "changes":
        return {
          title: "변경 요청 연결 편집",
          description: "기존 변경 요청을 이 이슈에 연결합니다.",
          searchValue: dialogSearch,
          searchPlaceholder: "번호 또는 제목으로 검색",
          selectedIds: selectedDialogIds,
          items: (changeLookup.data ?? []).map((change) => ({
            id: change.id,
            title: `#${change.number} ${change.title}`,
            subtitle: change.crState,
          })),
          emptyMessage: "검색 조건에 맞는 변경 요청이 없습니다.",
          isLoading: changeLookup.isLoading,
          isPending: syncChangesAction.isPending,
          onOpenChange: (open) => {
            if (!open) closeDialog();
          },
          onSearchChange: setDialogSearch,
          onToggle: (id) => {
            setSelectedDialogIds((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
            );
          },
          onConfirm: async () => {
            await syncChangesAction.mutateAsync(selectedDialogIds);
            closeDialog();
          },
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
    dialogSearch,
    issue,
    labelLookup.data,
    labelLookup.isLoading,
    partLookup.data,
    partLookup.isLoading,
    selectedDialogIds,
    syncAssigneesAction,
    syncChangesAction,
    syncLabelsAction,
    syncPartsAction,
  ]);

  const openDialog = (kind: SelectionDialogKind) => {
    if (!issue) return;

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

  const navigateToIssueMention = (targetIssueNumber: number, issueType: "issue" | "change_request") => {
    navigate(
      issueType === "change_request"
        ? `/changes/requests/${targetIssueNumber}`
        : `/changes/issues/${targetIssueNumber}`,
    );
  };

  return (
    <IssueDetailScreenView
      commentCount={commentCount}
      currentUser={currentUser}
      dialog={dialog}
      isAttachingFiles={addIssueFilesAction.isPending}
      isClosingIssue={closeIssueAction.isPending}
      isCreatingComment={createCommentAction.isPending}
      isError={issueQuery.isError}
      isLoading={issueQuery.isLoading}
      isReopeningIssue={reopenIssueAction.isPending}
      isSavingIssue={updateIssueAction.isPending}
      isTimelineLoading={timelineQuery.isLoading}
      issue={issueView}
      mentionFetchers={{
        issue: issueMentionFetcher,
        user: userMentionFetcher,
      }}
      onAttachFiles={async (files) => {
        await addIssueFilesAction.mutateAsync(files);
      }}
      onBack={() => navigate("/changes?view=issues")}
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
      onEditAssignees={() => openDialog("assignees")}
      onEditLabels={() => openDialog("labels")}
      onEditLinkedChanges={() => openDialog("changes")}
      onEditParts={() => openDialog("parts")}
      onNavigateToChange={(changeNumber) => navigate(`/changes/requests/${changeNumber}`)}
      onNavigateToIssueMention={navigateToIssueMention}
      onReopenIssue={() => {
        reopenIssueAction.mutate();
      }}
      onRetry={() => {
        void issueQuery.refetch();
      }}
      onSaveIssue={async ({ body, title }) => {
        await updateIssueAction.mutateAsync({
          title,
          body: body ? normalizeRichTextDocument(body) : null,
        });
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
      timelineItems={timelineItems}
    />
  );
}
