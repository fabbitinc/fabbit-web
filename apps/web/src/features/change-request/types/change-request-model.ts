export interface ChangeRequestUserModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface ChangeRequestReviewerModel extends ChangeRequestUserModel {
  reviewStatus: string;
  reviewedAt: string | null;
}

export interface ChangeRequestLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface ChangeRequestPartModel {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface ChangeRequestFileModel {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface ChangeRequestLinkedIssueModel {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface ChangeRequestDetailModel {
  id: string;
  number: number;
  type: string;
  title: string;
  body: Record<string, unknown> | null;
  bodyText: string;
  state: string;
  crState: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
  createdBy: ChangeRequestUserModel | null;
  labels: ChangeRequestLabelModel[];
  assignees: ChangeRequestUserModel[];
  reviewers: ChangeRequestReviewerModel[];
  parts: ChangeRequestPartModel[];
  files: ChangeRequestFileModel[];
  commentsCount: number;
  linkedIssues: ChangeRequestLinkedIssueModel[];
  mergedAt: string | null;
  mergedBy: string | null;
}

export interface ChangeRequestTimelineCommentModel {
  type: "comment";
  id: string;
  body: Record<string, unknown> | null;
  bodyText: string;
  authorId: string | null;
  author: ChangeRequestUserModel | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
}

export interface ChangeRequestTimelineActivityModel {
  type: "activity";
  id: string;
  action: string;
  scope: string | null;
  actorId: string;
  actor: ChangeRequestUserModel | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export type ChangeRequestTimelineItemModel =
  | ChangeRequestTimelineCommentModel
  | ChangeRequestTimelineActivityModel;

export type ChangeRequestDetailTab = "conversation" | "changes";
