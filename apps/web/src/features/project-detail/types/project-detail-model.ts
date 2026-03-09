export type ProjectDetailView = "overview" | "parts" | "issues" | "change" | "activity" | "settings";
export type ProjectSettingsTab = "general" | "members" | "labels" | "danger";
export type ProjectRole = "ADMIN" | "MEMBER" | "VIEWER";

export interface ProjectDetailModel {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  role: ProjectRole;
}

export interface ProjectUserLookupModel {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
}

export interface ProjectPartModel {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface ProjectPartsResultModel {
  total: number;
  items: ProjectPartModel[];
}

export interface ProjectActivityActorModel {
  userId: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
}

export interface ProjectActivityItemModel {
  id: string;
  action: string;
  scope: string | null;
  actorId: string;
  actor: ProjectActivityActorModel | null;
  createdAt: string;
}

export interface ProjectActivitiesResultModel {
  items: ProjectActivityItemModel[];
  nextCursor: string | null;
}

export interface ProjectWorkItemLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface ProjectWorkItemUserModel {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
}

export interface ProjectIssueListItemModel {
  id: string;
  number: number;
  title: string;
  state: string;
  createdAt: string;
  commentsCount: number;
  createdByName: string;
  createdByProfileImageUrl: string | null;
  labels: ProjectWorkItemLabelModel[];
  assignees: ProjectWorkItemUserModel[];
}

export interface ProjectIssueListResultModel {
  openCount: number;
  closedCount: number;
  total: number;
  items: ProjectIssueListItemModel[];
}

export interface ProjectChangeListItemModel {
  id: string;
  number: number;
  title: string;
  crState: string;
  createdAt: string;
  commentsCount: number;
  createdByName: string;
  createdByProfileImageUrl: string | null;
  labels: ProjectWorkItemLabelModel[];
  assignees: ProjectWorkItemUserModel[];
}

export interface ProjectChangeListResultModel {
  openCount: number;
  closedCount: number;
  total: number;
  items: ProjectChangeListItemModel[];
}
