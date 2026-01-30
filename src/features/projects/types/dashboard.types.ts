// 프로젝트 대시보드 타입 정의

// 공지사항
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "urgent";
  createdAt: string;
  author: string;
}

// 댓글 (멘션 포함)
export interface Comment {
  id: string;
  content: string;
  author: string;
  mentions: string[];
  createdAt: string;
  targetType: "item" | "milestone" | "general";
  targetId?: string;
}

// 리소스 트래킹
export interface ResourceTracking {
  budget: {
    planned: number;
    actual: number;
    currency: string;
  };
  manHours: {
    planned: number;
    actual: number;
  };
  progressRate: number;
}

// 도면 승인 상태
export type DrawingStatus = "approved" | "reviewing" | "rejected" | "conflict";

// 최근 도면
export interface RecentDrawing {
  id: string;
  itemId: string;
  itemName: string;
  partNumber: string;
  thumbnailUrl: string;
  uploadedAt: string;
  uploadedBy: string;
  status: DrawingStatus;
  version: string;
  hasIssue?: boolean; // 주의 필요 항목과 연결
}

// BOM 상태
export interface BOMStatus {
  approved: number;
  reviewing: number;
  conflicts: number;
}

// 마일스톤
export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: "completed" | "current" | "upcoming";
}

// 활동 기록
export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  targetId?: string;
  type: "approve" | "upload" | "conflict" | "comment";
  createdAt: string;
}

// 팀 멤버
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastActive: string;
}

// 간트 차트 아이템
export interface GanttItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
}
