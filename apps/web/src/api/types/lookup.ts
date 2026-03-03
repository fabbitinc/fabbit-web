// 멤버 lookup (UserSummary 형태)
export interface MemberLookupItemDto {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl: string | null;
}

export interface MemberLookupResponse {
  items: MemberLookupItemDto[];
}

// 이슈 lookup
export interface IssueLookupItemDto {
  id: string;
  number: number;
  title: string;
  state: string;
  /** "issue" | "change_request" */
  type: "issue" | "change_request";
}

export interface IssueLookupResponse {
  items: IssueLookupItemDto[];
}

// 라벨 lookup
export interface LabelLookupItemDto {
  id: string;
  name: string;
  color: string;
}

export interface LabelLookupResponse {
  items: LabelLookupItemDto[];
}

// 팀 lookup
export interface TeamLookupItemDto {
  id: string;
  name: string;
}

export interface TeamLookupResponse {
  items: TeamLookupItemDto[];
}

// 부품 lookup
export interface PartLookupItemDto {
  id: string;
  partNumber: string;
  name: string | null;
}

export interface PartLookupItemResponse {
  items: PartLookupItemDto[];
}

// 변경 요청 lookup
export interface ChangeRequestLookupItemDto {
  id: string;
  number: number;
  title: string;
  state: string;
  crState: string;
}
