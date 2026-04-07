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
  revisionId: string | null;
  partNumber: string;
  name: string | null;
}

export interface LookupPartRevisionModel {
  revisionId: string;
  partId: string;
  partNumber: string;
  baseRevisionCode: string | null;
  name: string | null;
  status: string | null;
}

export interface LookupIssueModel {
  id: string;
  number: number;
  title: string;
  state: string;
}

export interface LookupChangeModel {
  id: string;
  number: number;
  title: string;
  state: string;
}
