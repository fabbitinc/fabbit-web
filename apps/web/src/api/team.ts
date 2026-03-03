import { apiClient } from "./client";
import type {
  TeamSummaryDto,
  TeamDetailDto,
  TeamListResponse,
  TeamMemberDto,
  TeamMemberListResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMembersRequest,
  RemoveTeamMembersRequest,
  ManageTeamMembersResponse,
} from "./types";

// --- 내부 API 응답 타입 (snake_case) ---

interface ApiTeamSummary {
  id: string;
  name: string;
  description?: string | null;
  member_count: number;
  created_by: string;
  created_at: string;
}

interface ApiTeamDetail extends ApiTeamSummary {
  updated_at: string;
}

interface ApiTeamListResponse {
  items: ApiTeamSummary[];
}

interface ApiTeamMemberSummary {
  user_id: string;
  full_name: string;
  email: string;
}

interface ApiTeamMemberListResponse {
  items: ApiTeamMemberSummary[];
}

// --- 매핑 ---

function mapTeamSummary(item: ApiTeamSummary): TeamSummaryDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    memberCount: item.member_count,
    createdBy: item.created_by,
    createdAt: item.created_at,
  };
}

function mapTeamDetail(item: ApiTeamDetail): TeamDetailDto {
  return {
    ...mapTeamSummary(item),
    updatedAt: item.updated_at,
  };
}

function mapTeamMember(item: ApiTeamMemberSummary): TeamMemberDto {
  return {
    userId: item.user_id,
    fullName: item.full_name,
    email: item.email,
  };
}

// --- API 함수 ---

/** 팀 목록 조회 */
export async function getTeams(): Promise<TeamListResponse> {
  const response = await apiClient.get<ApiTeamListResponse>("/api/v1/teams");
  return { items: response.data.items.map(mapTeamSummary) };
}

/** 팀 생성 */
export async function createTeam(request: CreateTeamRequest): Promise<TeamDetailDto> {
  const response = await apiClient.post<ApiTeamDetail>("/api/v1/teams", request);
  return mapTeamDetail(response.data);
}

/** 팀 상세 조회 */
export async function getTeam(teamId: string): Promise<TeamDetailDto> {
  const response = await apiClient.get<ApiTeamDetail>(`/api/v1/teams/${teamId}`);
  return mapTeamDetail(response.data);
}

/** 팀 정보 수정 */
export async function updateTeam(teamId: string, request: UpdateTeamRequest): Promise<TeamDetailDto> {
  const response = await apiClient.patch<ApiTeamDetail>(`/api/v1/teams/${teamId}`, request);
  return mapTeamDetail(response.data);
}

/** 팀 삭제 */
export async function deleteTeam(teamId: string): Promise<void> {
  await apiClient.delete(`/api/v1/teams/${teamId}`);
}

/** 팀 멤버 목록 조회 */
export async function getTeamMembers(teamId: string): Promise<TeamMemberListResponse> {
  const response = await apiClient.get<ApiTeamMemberListResponse>(`/api/v1/teams/${teamId}/members`);
  return { items: response.data.items.map(mapTeamMember) };
}

/** 팀 멤버 추가 */
export async function addTeamMembers(teamId: string, userIds: string[]): Promise<ManageTeamMembersResponse> {
  const request: AddTeamMembersRequest = { user_ids: userIds };
  const response = await apiClient.post<ManageTeamMembersResponse>(`/api/v1/teams/${teamId}/members`, request);
  return response.data;
}

/** 팀 멤버 제거 */
export async function removeTeamMembers(teamId: string, userIds: string[]): Promise<void> {
  const request: RemoveTeamMembersRequest = { user_ids: userIds };
  await apiClient.delete(`/api/v1/teams/${teamId}/members`, { data: request });
}
