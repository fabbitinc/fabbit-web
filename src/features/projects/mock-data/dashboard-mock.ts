import type {
  Announcement,
  Comment,
  ResourceTracking,
  RecentDrawing,
  BOMStatus,
  Milestone,
  Activity,
  TeamMember,
  GanttItem,
} from "../types/dashboard.types";

// 공지사항 데이터
export const mockAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    title: "설계 검토 일정 안내",
    content: "1월 15일 오후 2시에 전체 설계 검토 미팅이 있습니다. 관련 도면을 미리 확인해 주세요.",
    type: "info",
    createdAt: "2024-01-10",
    author: "문성하",
  },
  {
    id: "ann-2",
    title: "재질 불일치 긴급 확인 필요",
    content: "V6 엔진 ASS'Y의 재질 불일치 건에 대해 오늘 중 확인이 필요합니다.",
    type: "urgent",
    createdAt: "2024-01-12",
    author: "이검토자",
  },
];

// 댓글 데이터
export const mockComments: Comment[] = [
  {
    id: "cmt-1",
    content: "@김엔지니어 피스톤 치수 확인 부탁드립니다.",
    author: "문성하",
    mentions: ["김엔지니어"],
    createdAt: "5시간 전",
    targetType: "item",
    targetId: "item-1-2",
  },
  {
    id: "cmt-2",
    content: "재질 변경건 @이검토자 검토 완료되었나요?",
    author: "김엔지니어",
    mentions: ["이검토자"],
    createdAt: "3시간 전",
    targetType: "item",
    targetId: "item-1",
  },
  {
    id: "cmt-3",
    content: "시제품 제작 일정 관련 미팅 잡았습니다.",
    author: "문성하",
    mentions: [],
    createdAt: "1시간 전",
    targetType: "milestone",
    targetId: "m4",
  },
];

// 리소스 트래킹 데이터
export const mockResourceTracking: ResourceTracking = {
  budget: {
    planned: 50000000, // 5천만원
    actual: 32000000, // 3천2백만원
    currency: "KRW",
  },
  manHours: {
    planned: 480, // 총 M-H 계획
    actual: 320, // 실제 투입
  },
  progressRate: 62.5, // 전체 진행률
};

// 최근 도면 데이터
export const mockRecentDrawings: RecentDrawing[] = [
  {
    id: "dwg-1",
    itemId: "item-1",
    itemName: "V6 엔진 ASS'Y",
    partNumber: "ENG-V6-001",
    thumbnailUrl: "/images/drawing-thumb-1.png",
    uploadedAt: "2시간 전",
    uploadedBy: "문성하",
    status: "conflict",
    version: "v1.3",
    hasIssue: true, // 주의 필요 항목과 연결
  },
  {
    id: "dwg-2",
    itemId: "item-1-2",
    itemName: "피스톤 ASS'Y",
    partNumber: "PIS-ASS-002",
    thumbnailUrl: "/images/drawing-thumb-2.png",
    uploadedAt: "5시간 전",
    uploadedBy: "김엔지니어",
    status: "reviewing",
    version: "v2.1",
    hasIssue: true,
  },
  {
    id: "dwg-3",
    itemId: "item-1-1",
    itemName: "실린더 블록",
    partNumber: "CYL-BLK-001",
    thumbnailUrl: "/images/drawing-thumb-3.png",
    uploadedAt: "1일 전",
    uploadedBy: "문성하",
    status: "approved",
    version: "v1.0",
  },
];

// BOM 상태 데이터
export const mockBOMStatus: BOMStatus = {
  approved: 15,
  reviewing: 5,
  conflicts: 2,
};

// 마일스톤 데이터 (7일 이내 경고 시연을 위한 날짜 설정)
const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

export const mockMilestones: Milestone[] = [
  { id: "m1", name: "설계 시작", date: "2024-01-01", status: "completed" },
  { id: "m2", name: "AI 분석 완료", date: "2024-01-10", status: "completed" },
  { id: "m3", name: "설계 검토", date: addDays(5), status: "current" }, // 5일 후 (경고)
  { id: "m4", name: "시제품 제작", date: addDays(14), status: "upcoming" },
  { id: "m5", name: "최종 승인", date: addDays(30), status: "upcoming" },
];

// 활동 기록 데이터
export const mockActivities: Activity[] = [
  { id: "a1", user: "문성하", action: "도면 승인", target: "V6 엔진 ASS'Y", targetId: "item-1", type: "approve", createdAt: "2시간 전" },
  { id: "a2", user: "AI", action: "불일치 감지", target: "V6 엔진 ASS'Y", targetId: "item-1", type: "conflict", createdAt: "2시간 전" },
  { id: "a3", user: "김엔지니어", action: "코멘트 추가", target: "피스톤 ASS'Y", targetId: "item-1-2", type: "comment", createdAt: "5시간 전" },
  { id: "a4", user: "문성하", action: "도면 업로드", target: "3개 파일", type: "upload", createdAt: "1일 전" },
];

// 팀 멤버 데이터
export const mockTeamMembers: TeamMember[] = [
  { id: "u1", name: "문성하", role: "PM", lastActive: "방금 전" },
  { id: "u2", name: "김엔지니어", role: "설계", lastActive: "1시간 전" },
  { id: "u3", name: "이검토자", role: "품질", lastActive: "3시간 전" },
];

// 간트 차트 데이터
export const mockGanttItems: GanttItem[] = [
  { id: "g1", name: "설계", startDate: "2024-01-01", endDate: "2024-01-15", progress: 100, color: "#22c55e" },
  { id: "g2", name: "AI 분석", startDate: "2024-01-05", endDate: "2024-01-10", progress: 100, color: "#3b82f6" },
  { id: "g3", name: "설계 검토", startDate: "2024-01-12", endDate: "2024-01-20", progress: 60, color: "#8b5cf6" },
  { id: "g4", name: "시제품 제작", startDate: "2024-01-18", endDate: "2024-02-05", progress: 0, color: "#f59e0b" },
  { id: "g5", name: "테스트", startDate: "2024-02-01", endDate: "2024-02-15", progress: 0, color: "#ef4444" },
];
