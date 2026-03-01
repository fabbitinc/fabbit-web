// 조직 멤버
export type MemberRole = "ADMIN" | "MEMBER";

export interface MemberDto {
  userId: string;
  fullName: string;
  email: string;
  role: MemberRole;
  jobRole: string | null;
  profileImageUrl: string | null;
}

export interface MemberListResponse {
  items: MemberDto[];
}

// 초대
export type InvitationStatus = "PENDING" | "ACCEPTED" | "CANCELLED";

export interface InvitationDto {
  id: string;
  orgId: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface InvitationListResponse {
  invitations: InvitationDto[];
}

export interface CreateInvitationRequest {
  email: string;
  role?: MemberRole;
}
