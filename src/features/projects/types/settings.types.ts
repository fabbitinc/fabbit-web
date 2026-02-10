// 프로젝트 상태
export type ProjectStatus = "active" | "archived";

// 멤버 역할
export type MemberRole = "admin" | "editor" | "viewer";

// 역할 라벨 매핑
export const ROLE_LABELS: Record<MemberRole, string> = {
  admin: "관리자",
  editor: "편집자",
  viewer: "뷰어",
};

// 테넌트 유저 (초대 가능한 사용자 목록)
export interface TenantUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
}

// 프로젝트 멤버
export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  invitedAt: string;
  joinedAt?: string;
}

// 알림 설정
export interface NotificationSettings {
  drawingApproved: boolean;
  commentMention: boolean;
  milestoneReminder: boolean;
  conflictDetected: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
  };
}

// 외부 연동 타입
export type IntegrationType = "slack" | "jira" | "github";

// 외부 연동
export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectedAt?: string;
}

// 삭제 확인 다이얼로그 Props
export interface DeleteConfirmDialogProps {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

// 설정 탭 ID
export type SettingsTabId =
  | "general"
  | "attributes"
  | "members"
  | "notifications"
  | "integrations"
  | "danger";

// 설정 섹션
export interface SettingsSection {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
}
