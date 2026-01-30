import type {
  ProjectMember,
  NotificationSettings,
  Integration,
  TenantUser,
} from "../types/settings.types";

// 테넌트 내 전체 유저 목록 (초대 가능한 사용자)
export const mockTenantUsers: TenantUser[] = [
  {
    id: "user-1",
    name: "김철수",
    email: "chulsoo.kim@example.com",
    department: "설계팀",
  },
  {
    id: "user-2",
    name: "이영희",
    email: "younghee.lee@example.com",
    department: "설계팀",
  },
  {
    id: "user-3",
    name: "박민수",
    email: "minsoo.park@example.com",
    department: "품질팀",
  },
  {
    id: "user-4",
    name: "정수진",
    email: "soojin.jung@example.com",
    department: "구매팀",
  },
  {
    id: "user-5",
    name: "최동훈",
    email: "donghoon.choi@example.com",
    department: "생산팀",
  },
  {
    id: "user-6",
    name: "강미영",
    email: "miyoung.kang@example.com",
    department: "설계팀",
  },
  {
    id: "user-7",
    name: "윤재호",
    email: "jaeho.yoon@example.com",
    department: "품질팀",
  },
];

// Mock 멤버 데이터
export const mockProjectMembers: ProjectMember[] = [
  {
    id: "member-1",
    userId: "user-1",
    name: "김철수",
    email: "chulsoo.kim@example.com",
    avatar: undefined,
    role: "admin",
    invitedAt: "2024-01-10T09:00:00Z",
    joinedAt: "2024-01-10T10:30:00Z",
  },
  {
    id: "member-2",
    userId: "user-2",
    name: "이영희",
    email: "younghee.lee@example.com",
    avatar: undefined,
    role: "editor",
    invitedAt: "2024-01-12T14:00:00Z",
    joinedAt: "2024-01-12T15:00:00Z",
  },
  {
    id: "member-3",
    userId: "user-3",
    name: "박민수",
    email: "minsoo.park@example.com",
    avatar: undefined,
    role: "viewer",
    invitedAt: "2024-01-15T11:00:00Z",
    joinedAt: "2024-01-15T11:30:00Z",
  },
  {
    id: "member-4",
    userId: "user-4",
    name: "정수진",
    email: "soojin.jung@example.com",
    avatar: undefined,
    role: "editor",
    invitedAt: "2024-01-18T16:00:00Z",
    joinedAt: undefined, // 아직 초대 수락 안 함
  },
];

// Mock 알림 설정
export const mockNotificationSettings: NotificationSettings = {
  drawingApproved: true,
  commentMention: true,
  milestoneReminder: true,
  conflictDetected: false,
  channels: {
    inApp: true,
    email: false,
  },
};

// Mock 연동 데이터
export const mockIntegrations: Integration[] = [
  {
    id: "integration-1",
    type: "slack",
    name: "Slack",
    description: "Slack 채널로 프로젝트 알림을 받습니다",
    icon: "slack",
    connected: true,
    connectedAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "integration-2",
    type: "jira",
    name: "Jira",
    description: "Jira 이슈와 연동하여 작업을 추적합니다",
    icon: "jira",
    connected: false,
  },
  {
    id: "integration-3",
    type: "github",
    name: "GitHub",
    description: "GitHub 저장소와 연동하여 버전을 관리합니다",
    icon: "github",
    connected: false,
  },
];

// 아바타 색상 (이름 기반)
export const AVATAR_COLORS = [
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name.slice(0, 2).toUpperCase();
}
