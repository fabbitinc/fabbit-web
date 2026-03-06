import type { OrganizationActivityLogModel } from "@/features/organization-settings/types/organization-settings-model";

export const mockActivityLogs: OrganizationActivityLogModel[] = [
  {
    id: "log-1",
    action: "조직 설정 수정",
    actor: "김지훈",
    target: "결재 워크플로우",
    ip: "203.0.113.16",
    at: "2026-02-17 17:41",
    result: "성공",
  },
  {
    id: "log-2",
    action: "IP 허용 목록 변경",
    actor: "박민서",
    target: "허용 IP +1",
    ip: "198.51.100.5",
    at: "2026-02-17 15:12",
    result: "성공",
  },
  {
    id: "log-3",
    action: "권한 정책 변경 시도",
    actor: "이도윤",
    target: "2단계 인증 필수",
    ip: "203.0.113.221",
    at: "2026-02-16 09:20",
    result: "실패",
  },
  {
    id: "log-4",
    action: "세션 제한 시간 수정",
    actor: "김지훈",
    target: "8시간 -> 4시간",
    ip: "203.0.113.16",
    at: "2026-02-15 11:03",
    result: "성공",
  },
];
