// 팀 요약
export interface TeamSummaryDto {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

// 팀 상세
export interface TeamDetailDto extends TeamSummaryDto {
  updatedAt: string;
}

export interface TeamListResponse {
  items: TeamSummaryDto[];
}

// 팀 멤버
export interface TeamMemberDto {
  userId: string;
  fullName: string;
  email: string;
}

export interface TeamMemberListResponse {
  items: TeamMemberDto[];
}

// 요청
export interface CreateTeamRequest {
  name: string;
  description?: string | null;
}

export interface UpdateTeamRequest {
  name?: string | null;
  description?: string | null;
}

export interface AddTeamMembersRequest {
  user_ids: string[];
}

export interface RemoveTeamMembersRequest {
  user_ids: string[];
}

// 응답
export interface ManageTeamMembersResponse {
  count: number;
}
