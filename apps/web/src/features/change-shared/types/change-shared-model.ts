export interface LookupMemberModel {
  userId: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
}

export interface LookupLabelModel {
  id: string;
  name: string;
  color: string;
}

export interface LookupPartModel {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface LookupIssueModel {
  id: string;
  number: number;
  title: string;
  state: string;
  type: "issue" | "change_request";
}

export interface LookupChangeModel {
  id: string;
  number: number;
  title: string;
  state: string;
  crState: string;
}
