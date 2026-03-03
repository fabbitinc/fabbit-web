import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangeRequestDetail } from "@/pages/projects/ChangeRequestDetailPage";
import {
  useIssue,
  useIndependentIssueTimeline,
  useIndependentSyncIssueAssignees,
  useIndependentSyncIssueLabels,
  useIndependentSyncIssueChanges,
  useIndependentSyncIssueParts,
  useIndependentUploadIssueFiles,
  useIndependentDeleteIssueFile,
  useIndependentCreateIssueComment,
  useIndependentUpdateIssueComment,
  useIndependentCloseIssue,
  useIndependentReopenIssue,
  useIndependentUpdateIssue,
} from "@/api/hooks/useIndependentIssues";
import {
  useLookupMembers,
  useLookupLabels,
  useLookupParts,
  useLookupChanges,
} from "@/api/hooks/useLookup";
import { useAuthStore } from "@/stores/authStore";
import { toIssueChangeRequest, toTimelineEvents } from "./utils";

export function IssueDetailPage() {
  const { issueNumber } = useParams<{ issueNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: issueDetail, isLoading, isError, refetch } = useIssue(issueNumber);
  const {
    data: timelineResponse,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useIndependentIssueTimeline(issueNumber);

  const syncAssigneesMutation = useIndependentSyncIssueAssignees(issueNumber);
  const syncLabelsMutation = useIndependentSyncIssueLabels(issueNumber);
  const syncPartsMutation = useIndependentSyncIssueParts(issueNumber);
  const uploadFilesMutation = useIndependentUploadIssueFiles(issueNumber);
  const deleteFileMutation = useIndependentDeleteIssueFile(issueNumber);
  const createCommentMutation = useIndependentCreateIssueComment(issueNumber);
  const updateCommentMutation = useIndependentUpdateIssueComment(issueNumber);
  const closeIssueMutation = useIndependentCloseIssue(issueNumber);
  const reopenIssueMutation = useIndependentReopenIssue(issueNumber);
  const updateIssueMutation = useIndependentUpdateIssue(issueNumber);

  // 멤버 lookup (+ 버튼 클릭 시 lazy fetch)
  const [membersEnabled, setMembersEnabled] = useState(false);
  const { data: membersData } = useLookupMembers({ enabled: membersEnabled });
  const availableMembers = (membersData ?? []).map((m) => ({
    id: m.id,
    name: m.fullName,
    email: m.email,
  }));

  // 라벨 lookup (+ 버튼 클릭 시 lazy fetch)
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const { data: labelsData } = useLookupLabels({ enabled: labelsEnabled });
  const availableLabels = (labelsData ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    colorHex: l.color,
  }));

  // 변경 요청 lookup (+ 버튼 클릭 시 lazy fetch)
  const [changesEnabled, setChangesEnabled] = useState(false);
  const { data: changesData } = useLookupChanges({ enabled: changesEnabled });
  const availableChanges = (changesData ?? []).map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    crState: c.crState,
  }));

  const syncChangesMutation = useIndependentSyncIssueChanges(issueNumber);

  // 부품 lookup (+ 버튼 클릭 시 lazy fetch, 검색 지원)
  const [partsSearchEnabled, setPartsSearchEnabled] = useState(false);
  const [partsSearch, setPartsSearch] = useState("");
  const { data: partsData, isFetching: isPartsSearching } = useLookupParts(
    partsSearch,
    { enabled: partsSearchEnabled },
  );
  const searchedParts = (partsData ?? []).map((p) => ({
    id: p.id,
    partNumber: p.partNumber,
    name: p.name,
  }));

  if (isLoading || isTimelineLoading) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || isTimelineError) {
    return (
      <div className="min-h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">이슈를 불러오지 못했습니다.</p>
          <Button variant="outline" size="sm" onClick={() => { refetch(); refetchTimeline(); }}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!issueDetail) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">이슈를 찾을 수 없습니다</p>
    );
  }

  return (
    <ChangeRequestDetail
      key={issueDetail.id}
      cr={toIssueChangeRequest(
        issueDetail,
        toTimelineEvents(
          timelineResponse?.items ?? [],
          timelineResponse?.users ?? {},
          issueDetail,
        ),
      )}
      onBack={() => navigate("/changes/issues")}
      onSyncAssignees={(userIds) => syncAssigneesMutation.mutate(userIds)}
      availableMembers={availableMembers}
      selectedAssigneeIds={issueDetail.assignees.map((a) => a.id)}
      onRequestMembers={() => setMembersEnabled(true)}
      onAddComment={(body) => createCommentMutation.mutate(body)}
      isCommentPending={createCommentMutation.isPending}
      availableLabels={availableLabels}
      selectedLabelIds={issueDetail.labels.map((l) => l.id)}
      onSyncLabels={(labelIds) => syncLabelsMutation.mutate(labelIds)}
      onRequestLabels={() => setLabelsEnabled(true)}
      onSyncParts={(partIds) => syncPartsMutation.mutate(partIds)}
      onRequestParts={() => setPartsSearchEnabled(true)}
      searchedParts={searchedParts}
      selectedPartIds={issueDetail.parts.map((p) => p.id)}
      onPartsSearchChange={setPartsSearch}
      isPartsSearching={isPartsSearching}
      onUploadFiles={(files) => uploadFilesMutation.mutate(files)}
      onDeleteFile={(fileId) => deleteFileMutation.mutate(fileId)}
      isFileUploading={uploadFilesMutation.isPending}
      isMetaUpdating={
        syncAssigneesMutation.isPending ||
        syncLabelsMutation.isPending ||
        syncPartsMutation.isPending ||
        syncChangesMutation.isPending
      }
      onCloseIssue={() => closeIssueMutation.mutate()}
      onReopenIssue={() => reopenIssueMutation.mutate()}
      isClosingIssue={closeIssueMutation.isPending}
      isReopeningIssue={reopenIssueMutation.isPending}
      onSyncLinkedChanges={(crIds) => syncChangesMutation.mutate(crIds)}
      availableChanges={availableChanges}
      linkedChangeIds={issueDetail.linkedChanges.map((lc) => lc.id)}
      onRequestChanges={() => setChangesEnabled(true)}
      onCreateLinkedChange={() => {
        const params = new URLSearchParams({
          issueNumber: String(issueDetail.number),
          issueTitle: issueDetail.title,
        });
        navigate(`/changes/requests/new?${params.toString()}`);
      }}
      onNavigateToChange={(changeNumber) => navigate(`/changes/requests/${changeNumber}`)}
      onNavigateToIssue={(num) => navigate(`/changes/issues/${num}`)}
      onUpdateTitleAndBody={
        issueDetail.state.toUpperCase() === "OPEN"
          ? async (title, body) => { await updateIssueMutation.mutateAsync({ title, body }); }
          : undefined
      }
      onUpdateComment={async (commentId, body) => {
        await updateCommentMutation.mutateAsync({ commentId, body });
      }}
      currentUserId={user?.id}
    />
  );
}
