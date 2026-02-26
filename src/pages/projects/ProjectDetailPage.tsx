import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Pencil,
  MoreHorizontal,
  Trash2,
  Plus,
  Search,
  LinkIcon,
  Unlink,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CircleDot,
  FileCheck,
  Package,
  Activity,
  LayoutDashboard,
  ArrowUpDown,
  Filter,
  AlertCircle,
  FilePen,
  FileX,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ChangeRequest,
  type ChangeRequestType,
  MOCK_ISSUES,
  MOCK_PRS,
} from "./changeRequestMock";
import { ChangeRequestDetail } from "./ChangeRequestDetailPage";
import { ProjectSettingsView } from "./ProjectSettingsView";

// ============================================================
// Mock 데이터
// ============================================================

// --- 프로젝트 ---

interface MockProject {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const MOCK_PROJECTS: Record<string, MockProject> = {
  "drive-unit-gen4": {
    id: "drive-unit-gen4",
    name: "Drive Unit Gen4",
    description: "4세대 구동 유닛 개발 프로젝트. 기존 대비 효율 15% 향상 목표.",
    createdAt: "2025-01-15",
    updatedAt: "2025-02-24",
  },
  "ev-inverter-rev2": {
    id: "ev-inverter-rev2",
    name: "EV Inverter Rev2",
    description: "전기차 인버터 2차 리비전. IGBT 모듈 변경 및 방열 구조 개선.",
    createdAt: "2025-02-01",
    updatedAt: "2025-02-20",
  },
  "robot-arm-v3": {
    id: "robot-arm-v3",
    name: "Robot Arm V3",
    description: "산업용 로봇팔 3세대. 6축 관절 구조 및 감속기 모듈 재설계.",
    createdAt: "2024-11-20",
    updatedAt: "2025-02-22",
  },
  "battery-pack-module": {
    id: "battery-pack-module",
    name: "Battery Pack Module",
    description: "배터리 팩 모듈 설계. 셀 배치 최적화 및 냉각 구조 검증.",
    createdAt: "2025-01-28",
    updatedAt: "2025-02-10",
  },
  "sensor-housing-asm": {
    id: "sensor-housing-asm",
    name: "Sensor Housing Assembly",
    description: "센서 하우징 조립체. IP67 방수 규격 대응 설계 완료.",
    createdAt: "2024-09-05",
    updatedAt: "2025-01-30",
  },
};

// --- 부품 ---

interface MockProjectPart {
  id: string;
  part_number: string;
  name: string | null;
  category: string | null;
}

const MOCK_PROJECT_PARTS: Record<string, MockProjectPart[]> = {
  "drive-unit-gen4": [
    { id: "p1", part_number: "HSG-002", name: "모터 하우징 Rev.C", category: "하우징" },
    { id: "p2", part_number: "SFT-200", name: "드라이브 샤프트", category: "샤프트" },
    { id: "p3", part_number: "GKT-010", name: "실리콘 가스켓", category: "씰" },
    { id: "p4", part_number: "BRG-105", name: "앵귤러 베어링 6205", category: "베어링" },
    { id: "p5", part_number: "FRAME-ASM", name: "프레임 조립체", category: "조립체" },
    { id: "p6", part_number: "MTR-400", name: "BLDC 모터 400W", category: "모터" },
  ],
  "ev-inverter-rev2": [
    { id: "p7", part_number: "IGBT-M01", name: "IGBT 모듈 1200V", category: "반도체" },
    { id: "p8", part_number: "HS-PLT-01", name: "히트싱크 플레이트", category: "방열" },
    { id: "p9", part_number: "PCB-INV-02", name: "인버터 제어보드 Rev.2", category: "PCB" },
  ],
  "robot-arm-v3": [
    { id: "p10", part_number: "JNT-601", name: "6축 관절 모듈", category: "관절" },
    { id: "p11", part_number: "RDC-050", name: "하모닉 감속기 50:1", category: "감속기" },
    { id: "p12", part_number: "ARM-LNK-03", name: "링크 암 #3", category: "구조체" },
    { id: "p13", part_number: "SRV-200", name: "서보 모터 200W", category: "모터" },
  ],
};

const ALL_MOCK_PARTS: MockProjectPart[] = [
  { id: "p1", part_number: "HSG-002", name: "모터 하우징 Rev.C", category: "하우징" },
  { id: "p2", part_number: "SFT-200", name: "드라이브 샤프트", category: "샤프트" },
  { id: "p3", part_number: "GKT-010", name: "실리콘 가스켓", category: "씰" },
  { id: "p4", part_number: "BRG-105", name: "앵귤러 베어링 6205", category: "베어링" },
  { id: "p5", part_number: "FRAME-ASM", name: "프레임 조립체", category: "조립체" },
  { id: "p6", part_number: "MTR-400", name: "BLDC 모터 400W", category: "모터" },
  { id: "p7", part_number: "IGBT-M01", name: "IGBT 모듈 1200V", category: "반도체" },
  { id: "p8", part_number: "HS-PLT-01", name: "히트싱크 플레이트", category: "방열" },
  { id: "p9", part_number: "PCB-INV-02", name: "인버터 제어보드 Rev.2", category: "PCB" },
  { id: "p10", part_number: "JNT-601", name: "6축 관절 모듈", category: "관절" },
  { id: "p11", part_number: "RDC-050", name: "하모닉 감속기 50:1", category: "감속기" },
  { id: "p12", part_number: "ARM-LNK-03", name: "링크 암 #3", category: "구조체" },
  { id: "p13", part_number: "SRV-200", name: "서보 모터 200W", category: "모터" },
  { id: "p14", part_number: "CAP-220", name: "전해 콘덴서 220μF", category: "전자부품" },
  { id: "p15", part_number: "FAN-80", name: "냉각팬 80mm", category: "냉각" },
  { id: "p16", part_number: "BOLT-M8", name: "육각볼트 M8x25", category: "체결" },
];

// --- 활동 로그 ---

type ActivityType =
  | "part_added"
  | "part_removed"
  | "approval_requested"
  | "approved"
  | "rejected"
  | "status_changed"
  | "project_created";

interface MockActivity {
  id: string;
  type: ActivityType;
  summary: string;
  userName: string;
  createdAt: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ElementType; accent: string; label: string; badgeClass: string }> = {
  part_added: { icon: LinkIcon, accent: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400", label: "부품 추가", badgeClass: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400" },
  part_removed: { icon: Unlink, accent: "bg-muted text-muted-foreground", label: "부품 제거", badgeClass: "border-border bg-muted/50 text-muted-foreground" },
  approval_requested: { icon: FileCheck, accent: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400", label: "결재 요청", badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400" },
  approved: { icon: CheckCircle2, accent: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400", label: "승인", badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400" },
  rejected: { icon: XCircle, accent: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400", label: "반려", badgeClass: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" },
  status_changed: { icon: PlayCircle, accent: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400", label: "상태 변경", badgeClass: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400" },
  project_created: { icon: CircleDot, accent: "bg-primary/10 text-primary", label: "프로젝트", badgeClass: "border-primary/20 bg-primary/5 text-primary" },
};

const MOCK_ACTIVITIES: MockActivity[] = [
  // 2월 25일 (오늘)
  { id: "act1", type: "part_added", summary: "부품 FAN-80 연결", userName: "이엔지", createdAt: "2025-02-25T16:20:00" },
  { id: "act2", type: "approval_requested", summary: "결재 요청: 냉각 구조 변경", userName: "이엔지", createdAt: "2025-02-25T15:45:00" },
  { id: "act3", type: "part_added", summary: "부품 CAP-220 연결", userName: "김설계", createdAt: "2025-02-25T11:30:00" },
  { id: "act4", type: "approved", summary: "결재 승인: 체결부 공차 수정", userName: "박관리", createdAt: "2025-02-25T10:00:00" },

  // 2월 24일 (어제)
  { id: "act5", type: "part_added", summary: "부품 HSG-002 연결", userName: "김설계", createdAt: "2025-02-24T14:30:00" },
  { id: "act6", type: "approval_requested", summary: "결재 요청: Rev.C 양산 도면 반영", userName: "김설계", createdAt: "2025-02-24T10:15:00" },
  { id: "act7", type: "part_removed", summary: "부품 BOLT-M8 연결 해제", userName: "이엔지", createdAt: "2025-02-24T09:40:00" },

  // 2월 21일
  { id: "act8", type: "approved", summary: "결재 승인: 방열핀 추가 설계", userName: "박관리", createdAt: "2025-02-21T17:00:00" },
  { id: "act9", type: "part_added", summary: "부품 HS-PLT-01 연결", userName: "김설계", createdAt: "2025-02-21T14:20:00" },

  // 2월 20일
  { id: "act10", type: "approved", summary: "결재 승인: BOM 구조 변경", userName: "박관리", createdAt: "2025-02-20T16:45:00" },
  { id: "act11", type: "status_changed", summary: "상태 변경: 설계 검증 → 시작 생산", userName: "박관리", createdAt: "2025-02-20T16:00:00" },
  { id: "act12", type: "part_added", summary: "부품 GKT-010 연결", userName: "이엔지", createdAt: "2025-02-20T11:30:00" },

  // 2월 18일
  { id: "act13", type: "approval_requested", summary: "결재 요청: BOM 구조 변경", userName: "이엔지", createdAt: "2025-02-18T10:00:00" },
  { id: "act14", type: "part_added", summary: "부품 IGBT-M01 연결", userName: "김설계", createdAt: "2025-02-18T09:15:00" },

  // 2월 15일
  { id: "act15", type: "rejected", summary: "결재 반려: 재질 변경 검토 (안전율 미달)", userName: "김설계", createdAt: "2025-02-15T11:20:00" },
  { id: "act16", type: "status_changed", summary: "상태 변경: 준비 → 진행", userName: "박관리", createdAt: "2025-02-15T09:00:00" },

  // 2월 12일
  { id: "act17", type: "approval_requested", summary: "결재 요청: 재질 변경 검토", userName: "박관리", createdAt: "2025-02-12T14:30:00" },
  { id: "act18", type: "part_removed", summary: "부품 SRV-200 연결 해제 (사양 변경)", userName: "김설계", createdAt: "2025-02-12T10:00:00" },

  // 2월 10일
  { id: "act19", type: "part_added", summary: "부품 PCB-INV-02 연결", userName: "이엔지", createdAt: "2025-02-10T15:30:00" },
  { id: "act20", type: "approved", summary: "결재 승인: 감속기 모듈 사양 확정", userName: "박관리", createdAt: "2025-02-10T11:00:00" },

  // 2월 5일
  { id: "act21", type: "approval_requested", summary: "결재 요청: 감속기 모듈 사양 확정", userName: "김설계", createdAt: "2025-02-05T16:00:00" },
  { id: "act22", type: "part_added", summary: "부품 RDC-050 연결", userName: "김설계", createdAt: "2025-02-05T14:00:00" },
  { id: "act23", type: "part_added", summary: "부품 JNT-601 연결", userName: "김설계", createdAt: "2025-02-05T13:45:00" },

  // 1월 28일
  { id: "act24", type: "status_changed", summary: "상태 변경: 기획 → 준비", userName: "박관리", createdAt: "2025-01-28T10:00:00" },
  { id: "act25", type: "part_added", summary: "부품 BRG-105 연결", userName: "이엔지", createdAt: "2025-01-28T09:30:00" },

  // 1월 22일
  { id: "act26", type: "approved", summary: "결재 승인: 초기 설계 리뷰", userName: "박관리", createdAt: "2025-01-22T14:00:00" },
  { id: "act27", type: "approval_requested", summary: "결재 요청: 초기 설계 리뷰", userName: "김설계", createdAt: "2025-01-22T10:30:00" },

  // 1월 20일
  { id: "act28", type: "part_added", summary: "부품 MTR-400, SFT-200 외 4건 일괄 연결", userName: "김설계", createdAt: "2025-01-20T15:30:00" },
  { id: "act29", type: "part_added", summary: "부품 FRAME-ASM 연결", userName: "김설계", createdAt: "2025-01-20T15:00:00" },

  // 1월 15일
  { id: "act30", type: "project_created", summary: "프로젝트 생성", userName: "김설계", createdAt: "2025-01-15T09:00:00" },
];

// ============================================================
// 헬퍼
// ============================================================

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) +
    " " +
    d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatShortDate(dateString: string): string {
  const d = new Date(dateString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getInitials(name: string): string {
  return name.slice(0, 1);
}

// ============================================================
// 헤더 (GitHub 스타일 — 컴팩트)
// ============================================================

function ProjectHeader({
  project,
  onEdit,
  onDelete,
}: {
  project: MockProject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-0">
      {/* 브레드크럼 + 프로젝트 이름 + 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/projects")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            프로젝트
          </button>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="font-semibold text-foreground">{project.name}</h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            편집
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                프로젝트 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 설명 */}
      {project.description && (
        <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
      )}
    </div>
  );
}

// ============================================================
// 편집 다이얼로그
// ============================================================

function EditProjectDialog({
  open,
  onOpenChange,
  defaultName,
  defaultDescription,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName: string;
  defaultDescription: string;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);

  function handleOpenChange(v: boolean) {
    if (v) {
      setName(defaultName);
      setDescription(defaultDescription);
    }
    onOpenChange(v);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 편집</DialogTitle>
          <DialogDescription>프로젝트 정보를 수정합니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">프로젝트 이름</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">설명 (선택)</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" disabled={!name.trim()}>저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 개요 탭
// ============================================================

function OverviewTab({
  parts,
  activities,
}: {
  parts: MockProjectPart[];
  activities: MockActivity[];
}) {
  const openIssues = MOCK_ISSUES.filter((c) => c.status === "open").length;
  const openPRs = MOCK_PRS.filter((c) => c.status === "open").length;
  const mergedPRs = MOCK_PRS.filter((c) => c.status === "merged").length;
  const recentActivities = activities.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">연결된 부품</p>
              <p className="text-2xl font-bold text-foreground">{parts.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">열린 이슈</p>
              <p className="text-2xl font-bold text-foreground">{openIssues}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <FilePen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">열린 변경 반영</p>
              <p className="text-2xl font-bold text-foreground">{openPRs}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">반영 완료</p>
              <p className="text-2xl font-bold text-foreground">{mergedPRs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 부품 + 최근 활동 2열 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 최근 부품 */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 부품</h3>
            <span className="text-xs text-muted-foreground">{parts.length}건</span>
          </div>
          {parts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">연결된 부품이 없습니다</div>
          ) : (
            <div className="divide-y">
              {parts.slice(0, 5).map((part) => (
                <div key={part.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="font-mono text-xs font-medium text-primary">{part.part_number}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{part.name ?? "—"}</span>
                  <span className="text-xs text-muted-foreground">{part.category}</span>
                </div>
              ))}
              {parts.length > 5 && (
                <div className="px-4 py-2.5 text-center text-xs text-muted-foreground">
                  외 {parts.length - 5}건
                </div>
              )}
            </div>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">최근 활동</h3>
          </div>
          <div className="px-4 py-2">
            {recentActivities.map((activity) => {
              const config = ACTIVITY_CONFIG[activity.type];
              const Icon = config.icon;
              return (
                <div key={activity.id} className="flex gap-3 py-2">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${config.accent}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground/80">{activity.summary}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {activity.userName} · {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 부품 탭
// ============================================================

function PartsTab({
  parts,
  onRemove,
  onAddClick,
}: {
  parts: MockProjectPart[];
  onRemove: (id: string) => void;
  onAddClick: () => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return parts;
    const q = search.toLowerCase();
    return parts.filter(
      (p) =>
        p.part_number.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [parts, search]);

  return (
    <div className="rounded-lg border bg-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">부품</h2>
          <span className="text-xs text-muted-foreground">({parts.length})</span>
        </div>
        <Button size="sm" onClick={onAddClick}>
          <Plus className="h-3.5 w-3.5" />
          부품 연결
        </Button>
      </div>

      {/* 검색 */}
      {parts.length > 0 && (
        <div className="border-b px-5 py-2.5">
          <div className="relative max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="품번, 품명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-9 text-sm"
            />
          </div>
        </div>
      )}

      {/* 테이블 */}
      {parts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">연결된 부품이 없습니다</p>
          <p className="mt-1 text-xs text-muted-foreground/60">부품 연결 버튼으로 부품을 추가하세요</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="py-2.5 pl-5 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품번</th>
                <th className="py-2.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품명</th>
                <th className="py-2.5 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">카테고리</th>
                <th className="py-2.5 px-2 pr-5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((part) => (
                <tr
                  key={part.id}
                  onClick={() => navigate(`/parts/${part.id}`)}
                  className="border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <td className="py-2.5 pl-5 pr-2 font-mono text-xs font-medium text-primary">{part.part_number}</td>
                  <td className="py-2.5 px-2 text-foreground">{part.name ?? <span className="text-muted-foreground/40">—</span>}</td>
                  <td className="py-2.5 px-2 text-muted-foreground">{part.category ?? <span className="text-muted-foreground/40">—</span>}</td>
                  <td className="py-2.5 px-2 pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(part.id);
                      }}
                    >
                      연결 해제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 부품 연결 다이얼로그
// ============================================================

function AddPartDialog({
  open,
  onOpenChange,
  existingPartIds,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPartIds: Set<string>;
  onAdd: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const available = useMemo(() => {
    const filtered = ALL_MOCK_PARTS.filter((p) => !existingPartIds.has(p.id));
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (p) => p.part_number.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q),
    );
  }, [existingPartIds, search]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    onAdd([...selectedIds]);
    setSelectedIds(new Set());
    setSearch("");
    onOpenChange(false);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setSelectedIds(new Set());
      setSearch("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>부품 연결</DialogTitle>
          <DialogDescription>프로젝트에 연결할 부품을 선택하세요.</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="품번, 품명으로 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" autoFocus />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.size}건 선택됨</Badge>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground">
              선택 해제
            </button>
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto rounded-md border">
          {available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">{search ? "검색 결과가 없습니다" : "연결 가능한 부품이 없습니다"}</p>
            </div>
          ) : (
            <div className="divide-y">
              {available.map((part) => (
                <label key={part.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50">
                  <Checkbox checked={selectedIds.has(part.id)} onCheckedChange={() => toggleSelect(part.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-primary">{part.part_number}</span>
                      {part.category && <span className="text-xs text-muted-foreground">{part.category}</span>}
                    </div>
                    {part.name && <p className="truncate text-sm text-foreground">{part.name}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>취소</Button>
          <Button onClick={handleAdd} disabled={selectedIds.size === 0}>연결 ({selectedIds.size})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// 변경 요청 탭 (GitHub Issues/PR 스타일)
// ============================================================

function CRStatusIcon({ cr }: { cr: ChangeRequest }) {
  if (cr.type === "pr" && cr.status === "merged") {
    return <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
  }
  if (cr.type === "pr") {
    return cr.status === "open"
      ? <FilePen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      : <FileX className="h-4 w-4 text-red-500 dark:text-red-400" />;
  }
  // issue
  return cr.status === "open"
    ? <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
    : <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return formatShortDate(iso);
}

function CRListView({
  items,
  type,
  createLabel,
  emptyIcon: EmptyIcon,
  onSelect,
}: {
  items: ChangeRequest[];
  type: ChangeRequestType;
  createLabel: string;
  emptyIcon: React.ElementType;
  onSelect: (cr: ChangeRequest) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"open" | "closed">("open");

  const openCount = items.filter((c) => c.status === "open").length;
  const closedCount = items.filter((c) => c.status !== "open").length;

  const filtered = useMemo(() => {
    if (statusFilter === "open") {
      return items.filter((c) => c.status === "open");
    }
    return items.filter((c) => c.status !== "open");
  }, [items, statusFilter]);

  const emptyLabel = type === "issue"
    ? (statusFilter === "open" ? "열린 이슈가 없습니다" : "닫힌 이슈가 없습니다")
    : (statusFilter === "open" ? "열린 변경 반영이 없습니다" : "닫힌 변경 반영이 없습니다");

  return (
    <div className="rounded-lg border bg-card">
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStatusFilter("open")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              statusFilter === "open" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertCircle className="h-4 w-4" />
            {openCount} 열림
          </button>
          <button
            onClick={() => setStatusFilter("closed")}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
              statusFilter === "closed" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {closedCount} 닫힘
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">데모</Badge>
          <Button size="sm" disabled>
            <Plus className="h-3.5 w-3.5" />
            {createLabel}
          </Button>
        </div>
      </div>

      {/* 리스트 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <EmptyIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{emptyLabel}</p>
        </div>
      ) : (
        <div className="divide-y">
          {filtered.map((cr) => {
            const commentCount = cr.timeline.filter((e) => e.type === "comment").length;

            return (
              <button
                key={cr.id}
                type="button"
                onClick={() => onSelect(cr)}
                className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <div className="mt-0.5 shrink-0">
                  <CRStatusIcon cr={cr} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{cr.title}</span>
                    {cr.labels.map((label) => (
                      <span
                        key={label.name}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${label.color}`}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>#{cr.number}</span>
                    <span>·</span>
                    <span>{cr.author} 님이 {timeAgo(cr.createdAt)} 열었습니다</span>
                    {cr.assignees.length > 0 && (
                      <>
                        <span>·</span>
                        <div className="flex -space-x-1">
                          {cr.assignees.map((name) => (
                            <Avatar key={name} className="h-4 w-4 border border-background">
                              <AvatarFallback className="text-[8px]">{getInitials(name)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {commentCount > 0 && (
                  <div className="mt-1 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {commentCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IssuesView({ projectId, crNumber }: { projectId: string; crNumber?: string }) {
  const navigate = useNavigate();

  if (crNumber) {
    const cr = MOCK_ISSUES.find((c) => c.number === Number(crNumber));
    if (!cr) return <p className="py-8 text-center text-sm text-muted-foreground">이슈를 찾을 수 없습니다</p>;
    return <ChangeRequestDetail cr={cr} onBack={() => navigate(`/projects/${projectId}/issues`)} />;
  }

  return (
    <CRListView
      items={MOCK_ISSUES}
      type="issue"
      createLabel="새 이슈"
      emptyIcon={AlertCircle}
      onSelect={(cr) => navigate(`/projects/${projectId}/issues/${cr.number}`)}
    />
  );
}

function PullRequestsView({ projectId, crNumber }: { projectId: string; crNumber?: string }) {
  const navigate = useNavigate();

  if (crNumber) {
    const cr = MOCK_PRS.find((c) => c.number === Number(crNumber));
    if (!cr) return <p className="py-8 text-center text-sm text-muted-foreground">변경 반영을 찾을 수 없습니다</p>;
    return <ChangeRequestDetail cr={cr} onBack={() => navigate(`/projects/${projectId}/prs`)} />;
  }

  return (
    <CRListView
      items={MOCK_PRS}
      type="pr"
      createLabel="새 변경 반영"
      emptyIcon={FilePen}
      onSelect={(cr) => navigate(`/projects/${projectId}/prs/${cr.number}`)}
    />
  );
}

// ============================================================
// 활동 탭
// ============================================================

type ActivityFilter = "all" | "part" | "approval" | "status";
type SortOrder = "newest" | "oldest";

const ACTIVITY_FILTER_TYPES: Record<Exclude<ActivityFilter, "all">, ActivityType[]> = {
  part: ["part_added", "part_removed"],
  approval: ["approval_requested", "approved", "rejected"],
  status: ["status_changed", "project_created"],
};

const ACTIVITY_USERS = [...new Set(MOCK_ACTIVITIES.map((a) => a.userName))];

const PAGE_SIZE = 10;

// 날짜를 "오늘", "어제", "2월 20일" 등으로 그룹 라벨 생성
function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (target.getFullYear() === now.getFullYear()) {
    return `${target.getMonth() + 1}월 ${target.getDate()}일`;
  }
  return `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일`;
}

// 활동 목록을 날짜 그룹으로 분할
function groupActivitiesByDate(activities: MockActivity[]): { label: string; items: MockActivity[] }[] {
  const groups: { label: string; items: MockActivity[] }[] = [];
  for (const activity of activities) {
    const label = getDateGroupLabel(activity.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(activity);
    } else {
      groups.push({ label, items: [activity] });
    }
  }
  return groups;
}

function ActivityTab() {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredActivities = useMemo(() => {
    let list = [...MOCK_ACTIVITIES];

    if (filter !== "all") {
      const types = ACTIVITY_FILTER_TYPES[filter];
      list = list.filter((a) => types.includes(a.type));
    }

    if (userFilter !== "all") {
      list = list.filter((a) => a.userName === userFilter);
    }

    list.sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

    return list;
  }, [filter, userFilter, sortOrder]);

  // 필터 변경 시 표시 개수 초기화
  function handleFilterChange(v: string) {
    setFilter(v as ActivityFilter);
    setVisibleCount(PAGE_SIZE);
  }
  function handleUserFilterChange(v: string) {
    setUserFilter(v);
    setVisibleCount(PAGE_SIZE);
  }

  const [loading, setLoading] = useState(false);
  const visibleActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;
  const groupedActivities = useMemo(() => groupActivitiesByDate(visibleActivities), [visibleActivities]);

  // IntersectionObserver로 하단 감지 → 1초 딜레이 후 더 로드
  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredActivities.length));
      setLoading(false);
    }, 1000);
  }, [filteredActivities.length, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="rounded-lg border bg-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">활동 로그</h2>
          <Badge variant="secondary" className="text-[10px]">데모</Badge>
          {filteredActivities.length > 0 && (
            <span className="text-[11px] text-muted-foreground">{filteredActivities.length}건</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="h-7 w-[110px] text-xs">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="part">부품</SelectItem>
              <SelectItem value="approval">결재</SelectItem>
              <SelectItem value="status">상태 변경</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={handleUserFilterChange}>
            <SelectTrigger className="h-7 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 사용자</SelectItem>
              {ACTIVITY_USERS.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortOrder === "newest" ? "최신순" : "오래된순"}
          </Button>
        </div>
      </div>

      {/* 활동 목록 */}
      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="h-8 w-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">해당 활동이 없습니다</p>
        </div>
      ) : (
        <div>
          {groupedActivities.map((group) => (
            <div key={group.label}>
              {/* 날짜 그룹 헤더 */}
              <div className="border-b bg-muted/40 px-5 py-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">{group.label}</span>
              </div>

              {/* 그룹 내 활동 행 */}
              <div className="divide-y divide-border/50">
                {group.items.map((activity) => {
                  const config = ACTIVITY_CONFIG[activity.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 px-5 py-2.5 transition-colors hover:bg-muted/30"
                    >
                      {/* 시간 */}
                      <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
                        {formatTime(activity.createdAt)}
                      </span>

                      {/* 타입 뱃지 (아이콘 + 라벨) */}
                      <Badge variant="outline" className={`inline-flex w-[88px] shrink-0 items-center justify-center gap-1 text-[10px] ${config.badgeClass}`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>

                      {/* 요약 */}
                      <p className="min-w-0 flex-1 truncate text-sm text-foreground/90">
                        {activity.summary}
                      </p>

                      {/* 사용자 */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">
                            {getInitials(activity.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.userName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 무한스크롤 감지 sentinel + 로딩 스피너 */}
          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center py-4">
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                  불러오는 중...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 메인 컴포넌트
// ============================================================

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const project = projectId ? MOCK_PROJECTS[projectId] : undefined;

  const [parts, setParts] = useState<MockProjectPart[]>(
    projectId ? (MOCK_PROJECT_PARTS[projectId] ?? []) : [],
  );
  // URL 경로에서 현재 뷰와 상세 번호 파싱
  const basePath = `/projects/${projectId}`;
  const subPath = location.pathname.slice(basePath.length).replace(/^\//, "");
  const pathSegments = subPath.split("/").filter(Boolean);

  type ViewKey = "overview" | "parts" | "issues" | "prs" | "activity" | "settings";
  const VALID_VIEWS = new Set<string>(["parts", "issues", "prs", "activity", "settings"]);
  const activeView: ViewKey = VALID_VIEWS.has(pathSegments[0]) ? (pathSegments[0] as ViewKey) : "overview";
  const crNumber = (activeView === "issues" || activeView === "prs") ? pathSegments[1] : undefined;

  const [editOpen, setEditOpen] = useState(false);
  const [addPartOpen, setAddPartOpen] = useState(false);

  // 프로젝트 없음
  if (!project) {
    return (
      <div className="min-h-full">
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => navigate("/projects")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            프로젝트
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-muted-foreground/50">알 수 없음</span>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-dashed px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Package className="h-4 w-4 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground/50">해당하는 프로젝트를 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  function handleRemovePart(partId: string) {
    setParts((prev) => prev.filter((p) => p.id !== partId));
  }

  function handleAddParts(ids: string[]) {
    const newParts = ALL_MOCK_PARTS.filter(
      (p) => ids.includes(p.id) && !parts.some((ep) => ep.id === p.id),
    );
    setParts((prev) => [...prev, ...newParts]);
  }

  return (
    <div className="min-h-full">
      {/* 헤더 (GitHub 스타일) */}
      <ProjectHeader
        project={project}
        onEdit={() => setEditOpen(true)}
        onDelete={() => navigate("/projects")}
      />

      {/* 네비게이션 바 */}
      <nav className="mt-4 flex items-center gap-1 border-b">
        {([
          { key: "overview", label: "개요", icon: LayoutDashboard },
          { key: "parts", label: "부품", icon: Package, count: parts.length },
          { key: "issues", label: "이슈", icon: AlertCircle },
          { key: "prs", label: "변경 반영", icon: FilePen },
          { key: "activity", label: "활동", icon: Activity },
        ] as const).map((tab) => {
          const isPartsTab = tab.key === "parts";
          const count = isPartsTab ? tab.count : undefined;
          return {
            ...tab,
            count,
            icon: tab.icon,
          };
        }).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => navigate(key === "overview" ? basePath : `${basePath}/${key}`)}
            className={cn(
              "relative inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
              activeView === key
                ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {count != null && (
              <span className="text-[10px] text-muted-foreground">({count})</span>
            )}
          </button>
        ))}
        <button
          onClick={() => navigate(`${basePath}/settings`)}
          className={cn(
            "relative ml-auto inline-flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors",
            activeView === "settings"
              ? "text-foreground after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Settings className="h-3.5 w-3.5" />
          설정
        </button>
      </nav>

      {/* 뷰 콘텐츠 */}
      <div className="mt-4">
        {activeView === "overview" && <OverviewTab parts={parts} activities={MOCK_ACTIVITIES} />}
        {activeView === "parts" && <PartsTab parts={parts} onRemove={handleRemovePart} onAddClick={() => setAddPartOpen(true)} />}
        {activeView === "issues" && <IssuesView projectId={projectId!} crNumber={crNumber} />}
        {activeView === "prs" && <PullRequestsView projectId={projectId!} crNumber={crNumber} />}
        {activeView === "activity" && <ActivityTab />}
        {activeView === "settings" && (
          <ProjectSettingsView
            projectName={project.name}
            projectDescription={project.description}
          />
        )}
      </div>

      {/* 편집 다이얼로그 */}
      <EditProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultName={project.name}
        defaultDescription={project.description ?? ""}
        onSave={() => setEditOpen(false)}
      />

      {/* 부품 연결 다이얼로그 */}
      <AddPartDialog
        open={addPartOpen}
        onOpenChange={setAddPartOpen}
        existingPartIds={new Set(parts.map((p) => p.id))}
        onAdd={handleAddParts}
      />
    </div>
  );
}
