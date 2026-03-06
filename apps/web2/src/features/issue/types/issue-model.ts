export type IssueState = "OPEN" | "CLOSED" | string;

export interface IssueUserModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface IssueLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface IssuePartModel {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface IssueFileModel {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface IssueLinkedChangeModel {
  id: string;
  number: number;
  title: string;
  state: string;
  crState: string;
}

export interface IssueDetailModel {
  id: string;
  number: number;
  type: string;
  title: string;
  body: Record<string, unknown> | null;
  bodyText: string;
  state: IssueState;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
  createdBy: IssueUserModel | null;
  labels: IssueLabelModel[];
  assignees: IssueUserModel[];
  parts: IssuePartModel[];
  files: IssueFileModel[];
  commentsCount: number;
  linkedChanges: IssueLinkedChangeModel[];
}

export interface IssueTimelineCommentModel {
  type: "comment";
  id: string;
  body: Record<string, unknown> | null;
  bodyText: string;
  authorId: string | null;
  author: IssueUserModel | null;
  createdAt: string;
  updatedAt: string;
  isModified: boolean;
}

export interface IssueTimelineActivityModel {
  type: "activity";
  id: string;
  action: string;
  scope: string | null;
  actorId: string;
  actor: IssueUserModel | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export type IssueTimelineItemModel = IssueTimelineCommentModel | IssueTimelineActivityModel;
