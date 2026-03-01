// 멤버 lookup (UserSummary 형태)
export interface MemberLookupItemDto {
  id: string;
  fullName: string;
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
