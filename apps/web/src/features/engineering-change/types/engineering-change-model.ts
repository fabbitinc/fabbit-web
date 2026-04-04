export interface EngineeringChangeUserModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface EngineeringChangeReviewerModel extends EngineeringChangeUserModel {
  reviewStatus: string;
  reviewedAt: string | null;
}

export interface EngineeringChangeReviewerTeamModel {
  teamId: string;
  name: string;
}

export interface EngineeringChangeLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface EngineeringChangePartModel {
  id: string;
  partNumber: string;
  name: string | null;
}

export type EngineeringChangeAffectedItemType = "REVISION_RELEASE" | "LIFECYCLE_CHANGE";

export interface EngineeringChangeAffectedItemModel {
  id: string;
  itemType: EngineeringChangeAffectedItemType;
  targetId: string;
  actionDetail: string | null;
  partId: string | null;
  partNumber: string | null;
  revisionCode: string | null;
  name: string | null;
  status: string | null;
}

export interface EngineeringChangeFileModel {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface EngineeringChangeLinkedIssueModel {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface EngineeringChangePartRevisionModel {
  revisionId: string;
  partId: string;
  partNumber: string;
  baseRevisionCode: string | null;
  name: string | null;
  status: string | null;
}

export interface EngineeringChangeWorkflowStageModel {
  id: string;
  label: string;
  type: "REVIEW" | "APPROVAL" | "RELEASE";
  status: "completed" | "active" | "pending";
  description: string;
  assignees: EngineeringChangeWorkflowAssigneeModel[];
}

export interface EngineeringChangeWorkflowAssigneeModel {
  id: string;
  assigneeId: string;
  name: string;
  type: "USER" | "TEAM";
  status: "PENDING" | "APPROVED" | "REJECTED";
  profileImageUrl: string | null;
  actedAt: string | null;
  actedByName: string | null;
  subtitle: string | null;
}

export interface EngineeringChangeWorkflowModel {
  stages: EngineeringChangeWorkflowStageModel[];
}

export interface EngineeringChangeDetailModel {
  id: string;
  number: number;
  title: string;
  body: Record<string, unknown> | null;
  bodyText: string;
  state: string;
  engineeringChangeState: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
  createdBy: EngineeringChangeUserModel | null;
  labels: EngineeringChangeLabelModel[];
  assignees: EngineeringChangeUserModel[];
  reviewers: EngineeringChangeReviewerModel[];
  reviewerTeams: EngineeringChangeReviewerTeamModel[];
  parts: EngineeringChangePartModel[];
  partRevisions: EngineeringChangePartRevisionModel[];
  affectedItems: EngineeringChangeAffectedItemModel[];
  files: EngineeringChangeFileModel[];
  commentsCount: number;
  linkedIssues: EngineeringChangeLinkedIssueModel[];
  mergedAt: string | null;
  mergedBy: string | null;
  workflow: EngineeringChangeWorkflowModel | null;
}

export interface EngineeringChangeTimelineCommentModel {
  type: "comment";
  id: string;
  targetId: string | null;
  body: Record<string, unknown> | null;
  bodyText: string;
  authorId: string | null;
  author: EngineeringChangeUserModel | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
}

export interface EngineeringChangeTimelineActivityModel {
  type: "activity";
  id: string;
  action: string;
  scope: string | null;
  actorId: string | null;
  actor: EngineeringChangeUserModel | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export type EngineeringChangeTimelineItemModel =
  | EngineeringChangeTimelineCommentModel
  | EngineeringChangeTimelineActivityModel;

export type EngineeringChangeDetailTab = "conversation" | "changes";
