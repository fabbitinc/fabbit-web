import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangeRequestDetail } from "@/pages/projects/ChangeRequestDetailPage";
import {
  useChange,
  useIndependentChangeTimeline,
  useIndependentSyncChangeAssignees,
  useIndependentSyncChangeReviewers,
  useIndependentSyncChangeLabels,
  useIndependentSyncChangeParts,
  useIndependentUploadChangeFiles,
  useIndependentDeleteChangeFile,
  useIndependentCreateChangeComment,
  useIndependentUpdateChangeComment,
  useIndependentSyncChangeIssues,
  useIndependentCloseChange,
  useIndependentMergeChange,
  useIndependentSubmitChange,
  useIndependentReopenChange,
  useIndependentUpdateChange,
} from "@/api/hooks/useIndependentChanges";
import {
  useLookupMembers,
  useLookupLabels,
  useLookupIssues,
  useLookupParts,
} from "@/api/hooks/useLookup";
import { useAuthStore } from "@/stores/authStore";
import { toChangeChangeRequest, toTimelineEvents } from "./utils";

export function ChangeDetailPage() {
  const { changeNumber } = useParams<{ changeNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: changeDetail, isLoading, isError, refetch } = useChange(changeNumber);
  const {
    data: timelineResponse,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useIndependentChangeTimeline(changeNumber);

  const syncAssigneesMutation = useIndependentSyncChangeAssignees(changeNumber);
  const syncReviewersMutation = useIndependentSyncChangeReviewers(changeNumber);
  const syncLabelsMutation = useIndependentSyncChangeLabels(changeNumber);
  const syncPartsMutation = useIndependentSyncChangeParts(changeNumber);
  const uploadFilesMutation = useIndependentUploadChangeFiles(changeNumber);
  const deleteFileMutation = useIndependentDeleteChangeFile(changeNumber);
  const createCommentMutation = useIndependentCreateChangeComment(changeNumber);
  const updateCommentMutation = useIndependentUpdateChangeComment(changeNumber);
  const syncIssuesMutation = useIndependentSyncChangeIssues(changeNumber);
  const closeChangeMutation = useIndependentCloseChange(changeNumber);
  const mergeChangeMutation = useIndependentMergeChange(changeNumber);
  const submitChangeMutation = useIndependentSubmitChange(changeNumber);
  const reopenChangeMutation = useIndependentReopenChange(changeNumber);
  const updateChangeMutation = useIndependentUpdateChange(changeNumber);

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

  // 이슈 lookup (+ 버튼 클릭 시 lazy fetch)
  const [issuesEnabled, setIssuesEnabled] = useState(false);
  const { data: issuesData } = useLookupIssues({ enabled: issuesEnabled, type: "ISSUE" });
  const availableIssues = (issuesData ?? []).map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
  }));

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
          <p className="text-sm text-muted-foreground">변경 요청을 불러오지 못했습니다.</p>
          <Button variant="outline" size="sm" onClick={() => { refetch(); refetchTimeline(); }}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!changeDetail) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">변경 요청을 찾을 수 없습니다</p>
    );
  }

  const crState = changeDetail.crState.toUpperCase();
  const isEditable = crState === "DRAFT" || crState === "SUBMITTED" || crState === "OPEN";

  return (
    <ChangeRequestDetail
      key={changeDetail.id}
      cr={toChangeChangeRequest(
        changeDetail,
        toTimelineEvents(
          timelineResponse?.items ?? [],
          timelineResponse?.users ?? {},
          changeDetail,
        ),
      )}
      onBack={() => navigate("/changes/requests")}
      onSyncAssignees={(userIds) => syncAssigneesMutation.mutate(userIds)}
      availableMembers={availableMembers}
      selectedAssigneeIds={changeDetail.assignees.map((a) => a.id)}
      onRequestMembers={() => setMembersEnabled(true)}
      onSyncReviewers={(userIds) => syncReviewersMutation.mutate(userIds)}
      selectedReviewerIds={changeDetail.reviewers.map((r) => r.id)}
      onAddComment={(body) => createCommentMutation.mutate(body)}
      isCommentPending={createCommentMutation.isPending}
      availableLabels={availableLabels}
      selectedLabelIds={changeDetail.labels.map((l) => l.id)}
      onSyncLabels={(labelIds) => syncLabelsMutation.mutate(labelIds)}
      onRequestLabels={() => setLabelsEnabled(true)}
      onSyncParts={(partIds) => syncPartsMutation.mutate(partIds)}
      onRequestParts={() => setPartsSearchEnabled(true)}
      searchedParts={searchedParts}
      selectedPartIds={changeDetail.parts.map((p) => p.id)}
      onPartsSearchChange={setPartsSearch}
      isPartsSearching={isPartsSearching}
      onUploadFiles={(files) => uploadFilesMutation.mutate(files)}
      onDeleteFile={(fileId) => deleteFileMutation.mutate(fileId)}
      isFileUploading={uploadFilesMutation.isPending}
      isMetaUpdating={
        syncAssigneesMutation.isPending ||
        syncReviewersMutation.isPending ||
        syncLabelsMutation.isPending ||
        syncPartsMutation.isPending
      }
      onCloseChange={() => closeChangeMutation.mutate()}
      onMergeChange={() => mergeChangeMutation.mutate()}
      onSubmitChange={() => submitChangeMutation.mutate()}
      onReopenChange={() => reopenChangeMutation.mutate()}
      isClosingChange={closeChangeMutation.isPending}
      isMergingChange={mergeChangeMutation.isPending}
      isSubmittingChange={submitChangeMutation.isPending}
      isReopeningChange={reopenChangeMutation.isPending}
      onSyncLinkedIssues={(issueIds) => syncIssuesMutation.mutate(issueIds)}
      availableIssues={availableIssues}
      linkedIssueIds={changeDetail.linkedIssues.map((li) => li.id)}
      onRequestIssues={() => setIssuesEnabled(true)}
      onNavigateToChange={(num) => navigate(`/changes/requests/${num}`)}
      onNavigateToIssue={(num) => navigate(`/changes/issues/${num}`)}
      onUpdateTitleAndBody={
        isEditable
          ? async (title, body) => { await updateChangeMutation.mutateAsync({ title, body }); }
          : undefined
      }
      onUpdateComment={async (commentId, body) => {
        await updateCommentMutation.mutateAsync({ commentId, body });
      }}
      currentUserId={user?.id}
    />
  );
}
