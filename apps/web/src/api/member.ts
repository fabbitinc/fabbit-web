import { apiClient } from "./client";
import type {
  CreateInvitationRequest,
  InvitationDto,
  InvitationListResponse,
  MemberDto,
  MemberListResponse,
  MemberRole,
  SetProfileImageRequest,
  ProfileImageResponse,
} from "./types";

// --- 내부 API 응답 타입 (snake_case) ---

interface ApiMemberSummary {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  job_role?: string | null;
  profile_image_url?: string | null;
}

interface ApiMemberListResponse {
  items: ApiMemberSummary[];
  max_members: number;
}

interface ApiInvitationResponse {
  id: string;
  org_id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

interface ApiInvitationListResponse {
  invitations: ApiInvitationResponse[];
}

// --- 매핑 ---

function mapMember(item: ApiMemberSummary): MemberDto {
  return {
    userId: item.user_id,
    fullName: item.full_name,
    email: item.email,
    role: item.role as MemberRole,
    jobRole: item.job_role ?? null,
    profileImageUrl: item.profile_image_url ?? null,
  };
}

function mapInvitation(item: ApiInvitationResponse): InvitationDto {
  return {
    id: item.id,
    orgId: item.org_id,
    email: item.email,
    role: item.role as MemberRole,
    status: item.status as InvitationDto["status"],
    invitedBy: item.invited_by,
    expiresAt: item.expires_at,
    acceptedAt: item.accepted_at ?? null,
    createdAt: item.created_at,
  };
}

// --- API 함수 ---

/** 조직 멤버 목록 조회 */
export async function getMembers(): Promise<MemberListResponse> {
  const response = await apiClient.get<ApiMemberListResponse>("/api/v1/members");
  return {
    items: response.data.items.map(mapMember),
    maxMembers: response.data.max_members,
  };
}

/** 초대 목록 조회 */
export async function getInvitations(): Promise<InvitationListResponse> {
  const response = await apiClient.get<ApiInvitationListResponse>("/api/v1/organizations/invitations");
  return {
    invitations: response.data.invitations.map(mapInvitation),
  };
}

/** 초대 생성 */
export async function createInvitation(request: CreateInvitationRequest): Promise<InvitationDto> {
  const response = await apiClient.post<ApiInvitationResponse>("/api/v1/organizations/invitations", request);
  return mapInvitation(response.data);
}

/** 초대 취소 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  await apiClient.delete(`/api/v1/organizations/invitations/${invitationId}`);
}

/** 조직 멤버 제거 */
export async function removeMember(userId: string): Promise<void> {
  await apiClient.delete(`/api/v1/members/${userId}`);
}

/** 멤버 역할 변경 */
export async function changeMemberRole(userId: string, role: MemberRole): Promise<void> {
  await apiClient.patch(`/api/v1/members/${userId}/role`, { role });
}

/** 조직 프로필 이미지 설정 */
export async function setOrgProfileImage(
  request: SetProfileImageRequest,
): Promise<ProfileImageResponse> {
  const response = await apiClient.put<ProfileImageResponse>(
    "/api/v1/organizations/profile-image",
    request,
  );
  return response.data;
}

/** 조직 프로필 이미지 제거 */
export async function deleteOrgProfileImage(): Promise<void> {
  await apiClient.delete("/api/v1/organizations/profile-image");
}
