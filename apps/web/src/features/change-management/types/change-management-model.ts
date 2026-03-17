export type ChangeManagementView = "issues" | "engineering-changes";
export type ChangeManagementState = "open" | "closed";

export interface ChangeManagementLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface ChangeManagementUserModel {
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
}

export interface ChangeManagementItemModel {
  id: string;
  number: number;
  kind: ChangeManagementView;
  title: string;
  state: string;
  engineeringChangeState: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  labels: ChangeManagementLabelModel[];
  assignees: ChangeManagementUserModel[];
  commentsCount: number;
}

export interface ChangeManagementListModel {
  openCount: number;
  closedCount: number;
  total: number;
  offset: number;
  limit: number;
  items: ChangeManagementItemModel[];
}

export interface ChangeManagementQueryState {
  query: string;
  page: number;
  pageSize: number;
  state: ChangeManagementState;
  view: ChangeManagementView;
}
