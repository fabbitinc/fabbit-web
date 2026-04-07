import {
  engineeringChangeAddFiles as addEngineeringChangeFilesApi,
  engineeringChangeApprove as approveEngineeringChangeApi,
  engineeringChangeApproveReview as approveReviewEngineeringChangeApi,
  engineeringChangeCancel as cancelEngineeringChangeApi,
  engineeringChangeCreateComment as createEngineeringChangeCommentApi,
  engineeringChangeCreate as createEngineeringChangeApi,
  engineeringChangeDeleteComment as deleteEngineeringChangeCommentApi,
  engineeringChangeDeleteFile as deleteEngineeringChangeFileApi,
  engineeringChangeGet as getEngineeringChangeApi,
  engineeringChangeGetTimeline as getEngineeringChangeTimelineApi,
  engineeringChangeReject as rejectEngineeringChangeApi,
  engineeringChangeRelease as releaseEngineeringChangeApi,
  engineeringChangeSyncSteps as replaceEngineeringChangeStepsApi,
  engineeringChangeRequestChanges as requestChangesEngineeringChangeApi,
  engineeringChangeResubmit as resubmitEngineeringChangeApi,
  engineeringChangeSubmit as submitEngineeringChangeApi,
  engineeringChangeSyncAffectedItems as syncAffectedItemsApi,
  engineeringChangeSyncIssues as syncEngineeringChangeIssuesApi,
  engineeringChangeSyncLabels as syncEngineeringChangeLabelsApi,
  engineeringChangeUpdateComment as updateEngineeringChangeCommentApi,
  engineeringChangeUpdate as updateEngineeringChangeApi,
  engineeringChangePopulateWhereUsed as populateWhereUsedApi,
  engineeringChangeCreateEcFromIssue as createEcFromIssueApi,
} from "@/api/generated/orval/engineering-changes/engineering-changes";
import type {
  AddEngineeringChangeFilesRequestDto,
  CreateEngineeringChangeCommentRequestDto,
  CreateEngineeringChangeCommentResponseDto,
  CreateEngineeringChangeDto,
  EngineeringChangeDetailResponseDto,
  EngineeringChangeTimelineResponseDto,
  ReplaceEngineeringChangeStepsRequestDto,
  ReplaceEngineeringChangeStepsResponseDto,
  SyncAffectedItemsRequestDto,
  SyncEngineeringChangeIssuesRequestDto,
  SyncEngineeringChangeIssuesResponseDto,
  UpdateEngineeringChangeCommentRequestDto,
  UpdateEngineeringChangeCommentResponseDto,
  UpdateEngineeringChangeDto,
} from "@/features/engineering-change/api/engineering-change.types";
import type {
  EngineeringChangeAffectedItemModel,
  EngineeringChangeDetailModel,
  EngineeringChangeFileModel,
  EngineeringChangeLinkedIssueModel,
  EngineeringChangePartModel,
  EngineeringChangePartRevisionModel,
  EngineeringChangeReviewerModel,
  EngineeringChangeTimelineActivityModel,
  EngineeringChangeTimelineCommentModel,
  EngineeringChangeTimelineItemModel,
  EngineeringChangeUserModel,
  EngineeringChangeWorkflowAssigneeModel,
  EngineeringChangeWorkflowModel,
  EngineeringChangeWorkflowStageModel,
} from "@/features/engineering-change/types/engineering-change-model";
import { getPlainTextFromRichText } from "@/lib/rich-text";

export async function createEngineeringChange(request: CreateEngineeringChangeDto) {
  return createEngineeringChangeApi(request as Parameters<typeof createEngineeringChangeApi>[0]);
}

export async function fetchEngineeringChangeDetail(engineeringChangeId: string): Promise<EngineeringChangeDetailModel> {
  const response = await getEngineeringChangeApi(engineeringChangeId);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function updateEngineeringChange(
  engineeringChangeId: string,
  request: UpdateEngineeringChangeDto,
): Promise<EngineeringChangeDetailModel> {
  const response = await updateEngineeringChangeApi(
    engineeringChangeId,
    request as Parameters<typeof updateEngineeringChangeApi>[1],
  );
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function syncEngineeringChangeIssues(
  engineeringChangeId: string,
  request: SyncEngineeringChangeIssuesRequestDto,
): Promise<SyncEngineeringChangeIssuesResponseDto> {
  return syncEngineeringChangeIssuesApi(engineeringChangeId, request);
}

export async function syncAffectedItems(
  engineeringChangeId: string,
  request: SyncAffectedItemsRequestDto,
): Promise<EngineeringChangeDetailModel> {
  const response = await syncAffectedItemsApi(engineeringChangeId, request);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function replaceEngineeringChangeSteps(
  engineeringChangeId: string,
  request: ReplaceEngineeringChangeStepsRequestDto,
): Promise<EngineeringChangeDetailModel> {
  const response = await replaceEngineeringChangeStepsApi(engineeringChangeId, request);
  return toEngineeringChangeDetailModel(response as ReplaceEngineeringChangeStepsResponseDto);
}

export async function submitEngineeringChange(engineeringChangeId: string): Promise<EngineeringChangeDetailModel> {
  const response = await submitEngineeringChangeApi(engineeringChangeId);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function approveReviewEngineeringChange(
  engineeringChangeId: string,
  stepAction: { step_id: string; comment?: string },
): Promise<EngineeringChangeDetailModel> {
  const response = await approveReviewEngineeringChangeApi(engineeringChangeId, stepAction);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function approveEngineeringChange(
  engineeringChangeId: string,
  stepAction: { step_id: string; comment?: string },
): Promise<EngineeringChangeDetailModel> {
  const response = await approveEngineeringChangeApi(engineeringChangeId, stepAction);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function releaseEngineeringChange(
  engineeringChangeId: string,
  stepAction: { step_id: string; comment?: string },
): Promise<EngineeringChangeDetailModel> {
  const response = await releaseEngineeringChangeApi(engineeringChangeId, stepAction);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function rejectEngineeringChange(
  engineeringChangeId: string,
  stepAction: { step_id: string; comment?: string },
): Promise<EngineeringChangeDetailModel> {
  const response = await rejectEngineeringChangeApi(engineeringChangeId, stepAction);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function requestChangesEngineeringChange(
  engineeringChangeId: string,
  stepId: string,
  stepAction: { step_id: string; comment?: string },
): Promise<EngineeringChangeDetailModel> {
  const response = await requestChangesEngineeringChangeApi(engineeringChangeId, stepId, stepAction);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function resubmitEngineeringChangeStep(
  engineeringChangeId: string,
  stepId: string,
): Promise<EngineeringChangeDetailModel> {
  const response = await resubmitEngineeringChangeApi(engineeringChangeId, stepId);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function cancelEngineeringChange(engineeringChangeId: string): Promise<EngineeringChangeDetailModel> {
  const response = await cancelEngineeringChangeApi(engineeringChangeId);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function fetchEngineeringChangeTimeline(
  engineeringChangeId: string,
): Promise<EngineeringChangeTimelineItemModel[]> {
  const response = await getEngineeringChangeTimelineApi(engineeringChangeId);
  const timeline = response as EngineeringChangeTimelineResponseDto;
  const items = timeline.items ?? [];

  return items.map((item) => {
    if (isEngineeringChangeTimelineCommentItem(item)) {
      return toEngineeringChangeTimelineCommentModel(item);
    }

    if (isEngineeringChangeTimelineActivityItem(item)) {
      return toEngineeringChangeTimelineActivityModel(item);
    }

    throw new Error(`알 수 없는 타임라인 아이템 타입입니다: ${String(item.type)}`);
  });
}

export async function createEngineeringChangeComment(
  engineeringChangeId: string,
  request: CreateEngineeringChangeCommentRequestDto,
): Promise<EngineeringChangeTimelineCommentModel> {
  const response = await createEngineeringChangeCommentApi(
    engineeringChangeId,
    request as Parameters<typeof createEngineeringChangeCommentApi>[1],
  );
  return toEngineeringChangeCommentModel(response as CreateEngineeringChangeCommentResponseDto);
}

export async function updateEngineeringChangeComment(
  engineeringChangeId: string,
  commentId: string,
  request: UpdateEngineeringChangeCommentRequestDto,
): Promise<EngineeringChangeTimelineCommentModel> {
  const response = await updateEngineeringChangeCommentApi(
    engineeringChangeId,
    commentId,
    request as Parameters<typeof updateEngineeringChangeCommentApi>[2],
  );
  return toEngineeringChangeCommentModel(response as UpdateEngineeringChangeCommentResponseDto);
}

export async function deleteEngineeringChangeComment(engineeringChangeId: string, commentId: string) {
  await deleteEngineeringChangeCommentApi(engineeringChangeId, commentId);
}

export async function addEngineeringChangeFiles(
  engineeringChangeId: string,
  request: AddEngineeringChangeFilesRequestDto,
): Promise<EngineeringChangeFileModel[]> {
  const response = await addEngineeringChangeFilesApi(engineeringChangeId, request);
  return (response ?? []).map(toEngineeringChangeFileModel);
}

export async function deleteEngineeringChangeFile(engineeringChangeId: string, fileId: string) {
  await deleteEngineeringChangeFileApi(engineeringChangeId, fileId);
}

export async function syncEngineeringChangeLabels(
  engineeringChangeId: string,
  labelIds: string[],
) {
  await syncEngineeringChangeLabelsApi(engineeringChangeId, { label_ids: labelIds });
}

export async function populateWhereUsed(engineeringChangeId: string): Promise<EngineeringChangeDetailModel> {
  const response = await populateWhereUsedApi(engineeringChangeId);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

export async function createEcFromIssue(
  issueId: string,
  request: { title?: string; body?: unknown; reviewer_ids?: string[]; approver_ids?: string[] },
): Promise<EngineeringChangeDetailModel> {
  const response = await createEcFromIssueApi(issueId, request);
  return toEngineeringChangeDetailModel(response as EngineeringChangeDetailResponseDto);
}

function toEngineeringChangeDetailModel(change: EngineeringChangeDetailResponseDto): EngineeringChangeDetailModel {
  const reviewSteps = (change.steps ?? []).filter((step) => step.step_type === "REVIEW");
  const affectedItems = (change.affected_items ?? []).map(toEngineeringChangeAffectedItemModel);
  const partRevisions = affectedItems
    .filter((item) => item.partId && item.partNumber)
    .map((item) => ({
      revisionId: item.targetId,
      partId: item.partId ?? "",
      partNumber: item.partNumber ?? "",
      baseRevisionCode: item.revisionCode,
      name: item.name,
      status: item.status,
    }));

  return {
    id: change.id ?? "",
    number: change.number ?? 0,
    title: change.title ?? "",
    body: isObjectLike(change.body) ? change.body : null,
    bodyText: getPlainTextFromRichText(change.body),
    state: change.state ?? "DRAFT",
    engineeringChangeState: toLegacyEngineeringChangeState(change.state ?? "DRAFT"),
    closedAt: change.closed_at ?? null,
    createdAt: change.created_at ?? "",
    updatedAt: change.updated_at ?? "",
    isModified: change.is_modified ?? false,
    createdBy: change.created_by ? toEngineeringChangeUserModel(change.created_by) : null,
    labels: (change.labels ?? []).map((label) => ({
      id: label.id ?? "",
      name: label.name ?? "",
      color: label.color ?? "",
    })),
    assignees: [],
    reviewers: reviewSteps.map(toEngineeringChangeReviewerModel),
    reviewerTeams: [],
    parts: partRevisions.map(toEngineeringChangePartModel),
    partRevisions,
    affectedItems,
    files: (change.files ?? []).map(toEngineeringChangeFileModel),
    commentsCount: change.comments_count ?? 0,
    linkedIssues: (change.linked_issues ?? []).map(toEngineeringChangeLinkedIssueModel),
    mergedAt: change.released_at ?? null,
    mergedBy: change.released_by?.full_name ?? null,
    workflow: deriveWorkflowModel(change.steps ?? [], change.state ?? "DRAFT"),
  };
}

function toLegacyEngineeringChangeState(state: string): string {
  const normalized = state.toUpperCase();

  if (normalized === "DRAFT") {
    return "DRAFT";
  }

  if (normalized === "RELEASED") {
    return "MERGED";
  }

  if (normalized === "CANCELED") {
    return "CLOSED";
  }

  return "SUBMITTED";
}

function toEngineeringChangeUserModel(user: {
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  profile_image_url?: string | null;
}): EngineeringChangeUserModel {
  return {
    userId: user.user_id ?? "",
    fullName: user.full_name ?? "알 수 없는 사용자",
    email: user.email ?? "",
    phone: user.phone ?? null,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toEngineeringChangeReviewerModel(step: {
  assignee_user?: {
    user_id?: string;
    full_name?: string;
    email?: string;
    phone?: string | null;
    profile_image_url?: string | null;
  };
  status?: string;
  acted_at?: string;
}): EngineeringChangeReviewerModel {
  return {
    ...toEngineeringChangeUserModel(step.assignee_user ?? {}),
    reviewStatus: step.status ?? "PENDING",
    reviewedAt: step.acted_at ?? null,
  };
}

function toEngineeringChangePartModel(part: EngineeringChangePartRevisionModel): EngineeringChangePartModel {
  return {
    id: part.partId || part.revisionId,
    partNumber: part.partNumber,
    name: part.name,
  };
}

function toEngineeringChangeAffectedItemModel(item: {
  id?: string;
  item_type?: string;
  target_id?: string;
  action_detail?: string;
  part_id?: string;
  part_number?: string;
  revision_code?: string;
  name?: string;
  status?: string;
}): EngineeringChangeAffectedItemModel {
  return {
    id: item.id ?? "",
    itemType: (item.item_type as EngineeringChangeAffectedItemModel["itemType"]) ?? "REVISION_RELEASE",
    targetId: item.target_id ?? "",
    actionDetail: item.action_detail ?? null,
    partId: item.part_id ?? null,
    partNumber: item.part_number ?? null,
    revisionCode: item.revision_code ?? null,
    name: item.name ?? null,
    status: item.status ?? null,
  };
}

function toEngineeringChangeFileModel(file: {
  file_id?: string;
  original_name?: string;
  content_type?: string;
  file_size?: number;
  file_url?: string | null;
  created_at?: string;
}): EngineeringChangeFileModel {
  return {
    fileId: file.file_id ?? "",
    originalName: file.original_name ?? "",
    contentType: file.content_type ?? "",
    fileSize: file.file_size ?? 0,
    fileUrl: file.file_url ?? null,
    createdAt: file.created_at ?? "",
  };
}

function toEngineeringChangeLinkedIssueModel(issue: {
  id?: string;
  number?: number;
  title?: string;
  state?: string;
}): EngineeringChangeLinkedIssueModel {
  return {
    id: issue.id ?? "",
    number: issue.number ?? 0,
    title: issue.title ?? "",
    state: issue.state ?? "",
  };
}

function toEngineeringChangeCommentModel(
  comment: CreateEngineeringChangeCommentResponseDto | UpdateEngineeringChangeCommentResponseDto,
): EngineeringChangeTimelineCommentModel {
  return {
    type: "comment",
    id: comment.id ?? "",
    targetId: comment.target_id ?? null,
    body: isObjectLike(comment.body) ? comment.body : null,
    bodyText: getPlainTextFromRichText(comment.body),
    authorId: comment.created_by?.user_id ?? null,
    author: comment.created_by ? toEngineeringChangeUserModel(comment.created_by) : null,
    createdAt: comment.created_at ?? "",
    updatedAt: comment.updated_at ?? "",
    isModified: comment.is_modified ?? false,
  };
}

function toEngineeringChangeTimelineCommentModel(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "comment" },
): EngineeringChangeTimelineCommentModel {
  return {
    type: "comment",
    id: item.id ?? "",
    targetId: null,
    body: isObjectLike(item.body) ? item.body : null,
    bodyText: getPlainTextFromRichText(item.body),
    authorId: item.author?.user_id ?? null,
    author: item.author ? toEngineeringChangeUserModel(item.author) : null,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    isModified: item.is_modified ?? false,
  };
}

function toEngineeringChangeTimelineActivityModel(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "activity" },
): EngineeringChangeTimelineActivityModel {
  return {
    type: "activity",
    id: item.id ?? "",
    action: item.action ?? "",
    scope: item.scope ?? null,
    actorId: item.actor?.user_id ?? null,
    actor: item.actor ? toEngineeringChangeUserModel(item.actor) : null,
    detail: isObjectLike(item.detail) ? item.detail : null,
    createdAt: item.created_at ?? "",
  };
}

function isEngineeringChangeTimelineCommentItem(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number],
): item is NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "comment" } {
  return item.type === "comment";
}

function isEngineeringChangeTimelineActivityItem(
  item: NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number],
): item is NonNullable<EngineeringChangeTimelineResponseDto["items"]>[number] & { type: "activity" } {
  return item.type === "activity";
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// --- 워크플로우 도출 ---

type StepResponse = NonNullable<EngineeringChangeDetailResponseDto["steps"]>[number];

const STAGE_CONFIG: {
  type: EngineeringChangeWorkflowStageModel["type"];
  label: string;
  description: string;
}[] = [
  { type: "REVIEW", label: "검토", description: "설계, 생산기술, 품질 검토" },
  { type: "APPROVAL", label: "승인", description: "CCB 결재" },
  { type: "RELEASE", label: "반영", description: "BOM/도면 릴리즈" },
];

const STAGE_STATUS_MAP: Record<string, Record<string, EngineeringChangeWorkflowStageModel["status"]>> = {
  DRAFT: { REVIEW: "pending", APPROVAL: "pending", RELEASE: "pending" },
  REVIEW_PENDING: { REVIEW: "active", APPROVAL: "pending", RELEASE: "pending" },
  APPROVAL_PENDING: { REVIEW: "completed", APPROVAL: "active", RELEASE: "pending" },
  RELEASE_PENDING: { REVIEW: "completed", APPROVAL: "completed", RELEASE: "active" },
  RELEASED: { REVIEW: "completed", APPROVAL: "completed", RELEASE: "completed" },
  CANCELED: { REVIEW: "pending", APPROVAL: "pending", RELEASE: "pending" },
};

function deriveWorkflowModel(
  steps: StepResponse[],
  ecState: string,
): EngineeringChangeWorkflowModel {
  const grouped = new Map<string, StepResponse[]>();

  for (const step of steps) {
    const key = step.step_type ?? "REVIEW";
    const group = grouped.get(key) ?? [];
    group.push(step);
    grouped.set(key, group);
  }

  const stateMap = STAGE_STATUS_MAP[ecState] ?? STAGE_STATUS_MAP.DRAFT;

  const stages: EngineeringChangeWorkflowStageModel[] = STAGE_CONFIG.map((config) => {
    const stageSteps = grouped.get(config.type) ?? [];
    stageSteps.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

    const firstStep = stageSteps[0];

    return {
      id: config.type.toLowerCase(),
      stageId: firstStep?.step_stage_id ?? null,
      label: config.label,
      type: config.type,
      status: stateMap[config.type] ?? "pending",
      description: config.description,
      completionPolicy: (firstStep?.completion_policy as EngineeringChangeWorkflowStageModel["completionPolicy"]) ?? "ALL_MUST_APPROVE",
      minApprovals: firstStep?.min_approvals ?? null,
      deadline: firstStep?.deadline ?? null,
      assignees: stageSteps.map(toWorkflowAssigneeModel),
    };
  });

  return { stages };
}

function toWorkflowAssigneeModel(step: StepResponse): EngineeringChangeWorkflowAssigneeModel {
  const isTeam = step.assignee_type === "TEAM";

  return {
    id: step.step_id ?? "",
    assigneeId: isTeam
      ? (step.assignee_team?.id ?? "")
      : (step.assignee_user?.user_id ?? ""),
    name: isTeam
      ? (step.assignee_team?.name ?? "알 수 없는 팀")
      : (step.assignee_user?.full_name ?? "알 수 없는 사용자"),
    type: (step.assignee_type as "USER" | "TEAM") ?? "USER",
    status: (step.status as EngineeringChangeWorkflowAssigneeModel["status"]) ?? "PENDING",
    profileImageUrl: step.assignee_user?.profile_image_url ?? null,
    actedAt: step.acted_at ?? null,
    actedByName: step.acted_by?.full_name ?? null,
    subtitle: null,
  };
}
