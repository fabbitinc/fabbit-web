export type OpsType = "approval" | "change" | "issue";
export type OpsStatus = "open" | "in_review" | "blocked" | "done";

export interface OpsItem {
  id: string;
  projectId: string;
  projectName: string;
  type: OpsType;
  title: string;
  target: string;
  owner: string;
  dueDate: string;
  status: OpsStatus;
  priority: "high" | "medium" | "low";
  impact?: "release" | "quality" | "cost" | "supply";
}

export interface ScheduleItem {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  dueDate: string;
  progress: number;
  risk: "low" | "medium" | "high";
}

export const PROJECT_OPTIONS = [
  { id: "drive-unit-gen4", name: "Drive Unit Gen4" },
  { id: "ev-inverter-rev2", name: "EV Inverter Rev2" },
  { id: "robot-arm-v3", name: "Robot Arm V3" },
];

export const OPS_ITEMS: OpsItem[] = [
  {
    id: "APR-128",
    projectId: "drive-unit-gen4",
    projectName: "Drive Unit Gen4",
    type: "approval",
    title: "모터 하우징 재질 변경 승인",
    target: "HSG-002",
    owner: "김설계",
    dueDate: "2월 20일",
    status: "in_review",
    priority: "high",
    impact: "release",
  },
  {
    id: "CR-209",
    projectId: "drive-unit-gen4",
    projectName: "Drive Unit Gen4",
    type: "change",
    title: "BLT-001 체결 토크 변경 요청",
    target: "BLT-001",
    owner: "박생산",
    dueDate: "2월 21일",
    status: "open",
    priority: "medium",
    impact: "quality",
  },
  {
    id: "ISS-044",
    projectId: "drive-unit-gen4",
    projectName: "Drive Unit Gen4",
    type: "issue",
    title: "BOM 수량 불일치 이슈",
    target: "FRAME-ASM",
    owner: "최품질",
    dueDate: "2월 18일",
    status: "blocked",
    priority: "high",
    impact: "quality",
  },
  {
    id: "APR-227",
    projectId: "ev-inverter-rev2",
    projectName: "EV Inverter Rev2",
    type: "approval",
    title: "IGBT 방열판 도면 반영 승인",
    target: "HTS-901",
    owner: "한전장",
    dueDate: "2월 26일",
    status: "open",
    priority: "medium",
    impact: "cost",
  },
  {
    id: "CR-315",
    projectId: "robot-arm-v3",
    projectName: "Robot Arm V3",
    type: "change",
    title: "감속기 하우징 가공 공정 변경",
    target: "GBX-310",
    owner: "임공정",
    dueDate: "2월 27일",
    status: "in_review",
    priority: "high",
    impact: "supply",
  },
  {
    id: "ISS-078",
    projectId: "ev-inverter-rev2",
    projectName: "EV Inverter Rev2",
    type: "issue",
    title: "커넥터 핀맵 불일치",
    target: "CNN-110",
    owner: "윤품질",
    dueDate: "2월 19일",
    status: "open",
    priority: "high",
    impact: "release",
  },
  {
    id: "APR-133",
    projectId: "drive-unit-gen4",
    projectName: "Drive Unit Gen4",
    type: "approval",
    title: "도면 Rev.C 반영 승인",
    target: "PCB-001",
    owner: "이전장",
    dueDate: "2월 24일",
    status: "open",
    priority: "low",
    impact: "release",
  },
  {
    id: "CR-214",
    projectId: "drive-unit-gen4",
    projectName: "Drive Unit Gen4",
    type: "change",
    title: "케이블 라우팅 변경",
    target: "CBL-001",
    owner: "오설계",
    dueDate: "2월 25일",
    status: "done",
    priority: "medium",
    impact: "quality",
  },
];

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    id: "MS-1",
    projectId: "drive-unit-gen4",
    title: "구조 설계 동결",
    owner: "김설계",
    dueDate: "2월 28일",
    progress: 82,
    risk: "low",
  },
  {
    id: "MS-2",
    projectId: "drive-unit-gen4",
    title: "BOM 검증 완료",
    owner: "최품질",
    dueDate: "3월 05일",
    progress: 56,
    risk: "medium",
  },
  {
    id: "MS-3",
    projectId: "ev-inverter-rev2",
    title: "회로 안정성 테스트",
    owner: "한전장",
    dueDate: "3월 08일",
    progress: 43,
    risk: "high",
  },
  {
    id: "MS-4",
    projectId: "robot-arm-v3",
    title: "시제품 조립",
    owner: "임공정",
    dueDate: "3월 12일",
    progress: 31,
    risk: "medium",
  },
];
