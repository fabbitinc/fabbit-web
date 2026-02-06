import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layers,
  Calendar,
  Package,
  FileText,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Users,
  ChevronRight,
  ExternalLink,
  FolderPlus,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUploadStore } from "@/stores/uploadStore";
import { mockFolders } from "@/features/items/mock-data";
import type { FolderData } from "@/features/items/types";
import { cn } from "@/lib/utils";

// 대시보드 컴포넌트 임포트
import {
  BOMStatusChart,
  MilestoneTimeline,
  GanttChartDialog,
  ResourceTrackingCard,
  AnnouncementBanner,
  ActivityTabs,
  RecentDrawingThumbnails,
} from "@/features/projects/components/dashboard";

// Mock 데이터 임포트
import {
  mockAnnouncements,
  mockComments,
  mockResourceTracking,
  mockRecentDrawings,
  mockBOMStatus,
  mockMilestones,
  mockActivities,
  mockTeamMembers,
  mockGanttItems,
} from "@/features/projects/mock-data/dashboard-mock";

function findProjectById(folders: FolderData[], id: string): FolderData | null {
  for (const folder of folders) {
    if (folder.id === id && folder.type === "project") return folder;
    if (folder.children) {
      const found = findProjectById(folder.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 최근 이슈/불일치 데이터
interface RecentIssue {
  id: string;
  itemName: string;
  itemId: string;
  type: "conflict" | "issue";
  description: string;
  severity: "error" | "warning";
  createdAt: string;
}

const mockIssues: RecentIssue[] = [
  {
    id: "i1",
    itemName: "V6 엔진 ASS'Y",
    itemId: "item-1",
    type: "conflict",
    description: "재질 불일치: 도면 SUS304 vs 엑셀 SUS316",
    severity: "error",
    createdAt: "2시간 전",
  },
  {
    id: "i2",
    itemName: "피스톤 ASS'Y",
    itemId: "item-1-2",
    type: "issue",
    description: "치수 확인 필요 (담당: 김엔지니어)",
    severity: "warning",
    createdAt: "5시간 전",
  },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const openUploadModal = useUploadStore((state) => state.openModal);

  // 간트 차트 다이얼로그 상태
  const [isGanttOpen, setIsGanttOpen] = useState(false);

  // 공지사항 dismiss 상태
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const visibleAnnouncements = mockAnnouncements.filter(
    (a) => !dismissedAnnouncements.includes(a.id)
  );

  // 하이라이트된 아이템 ID (주의 필요 항목과 최근 도면 연결)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const drawingsRef = useRef<HTMLDivElement>(null);

  const project = findProjectById(mockFolders, id ?? "");

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#64748b]">프로젝트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // AI 진도율 자동 계산 (Mock)
  const stats = {
    totalItems: 24,
    aiAnalyzed: 20,
    approved: mockBOMStatus.approved,
    reviewing: mockBOMStatus.reviewing,
    conflicts: mockBOMStatus.conflicts,
    documents: 36,
  };

  const aiProgress = Math.round((stats.aiAnalyzed / stats.totalItems) * 100);
  const approvalProgress = Math.round((stats.approved / stats.totalItems) * 100);

  // 주의 필요 항목 호버/클릭 시 도면 하이라이트
  const handleIssueHighlight = (itemId: string) => {
    setHighlightedItemId(itemId);
    // 최근 도면 섹션으로 스크롤
    drawingsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // 폴더가 없는지 확인
  const hasNoFolders = !project.children || project.children.length === 0;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-[#f8fafc]">
        {/* Header */}
        <div className="border-b border-[#e2e8f0] bg-white px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] shadow-lg shadow-[#8b5cf6]/25">
                <Layers className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-[#0f172a]">{project.name}</h1>
                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
                    진행중
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748b]">{project.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {project.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    {stats.totalItems}개 아이템
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {stats.documents}개 문서
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {mockTeamMembers.length}명 참여
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-[#3b82f6] hover:bg-[#2563eb]" onClick={() => openUploadModal("drawing", id)}>
                <Upload className="mr-2 h-4 w-4" />
                도면 업로드
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/projects/${id}/settings`)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* 공지사항 배너 */}
          {visibleAnnouncements.length > 0 && (
            <div className="mb-6">
              <AnnouncementBanner
                announcements={visibleAnnouncements}
                onDismiss={(id) => setDismissedAnnouncements((prev) => [...prev, id])}
              />
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-8 space-y-6">
              {/* AI Progress Cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* AI 분석 진도율 */}
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3b82f6]/10">
                      <Sparkles className="h-5 w-5 text-[#3b82f6]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#64748b]">AI 분석 진도율</span>
                        <span className="text-lg font-bold text-[#3b82f6]">{aiProgress}%</span>
                      </div>
                      <Progress value={aiProgress} className="mt-2 h-2" />
                      <p className="mt-2 text-xs text-[#94a3b8]">
                        {stats.aiAnalyzed}/{stats.totalItems}개 도면 분석 완료
                      </p>
                    </div>
                  </div>
                </div>

                {/* 승인 진도율 */}
                <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/10">
                      <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#64748b]">승인 진도율</span>
                        <span className="text-lg font-bold text-[#22c55e]">{approvalProgress}%</span>
                      </div>
                      <Progress
                        value={approvalProgress}
                        className="mt-2 h-2 [&>div]:bg-[#22c55e]"
                      />
                      <p className="mt-2 text-xs text-[#94a3b8]">
                        {stats.approved}/{stats.totalItems}개 승인 완료
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOM 상태 차트 & 리소스 트래킹 */}
              <div className="grid grid-cols-2 gap-4">
                <BOMStatusChart status={mockBOMStatus} />
                <ResourceTrackingCard data={mockResourceTracking} />
              </div>

              {/* 마일스톤 타임라인 */}
              <MilestoneTimeline
                milestones={mockMilestones}
                onOpenGantt={() => setIsGanttOpen(true)}
              />

              {/* 최근 도면 썸네일 */}
              <div ref={drawingsRef}>
                <RecentDrawingThumbnails
                  drawings={mockRecentDrawings}
                  highlightedItemId={highlightedItemId}
                />
              </div>

              {/* Recent Issues / Conflicts */}
              {mockIssues.length > 0 && (
                <div className="rounded-xl border border-[#fecaca] bg-gradient-to-b from-[#fef2f2] to-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                      <h3 className="font-semibold text-[#dc2626]">주의 필요 항목</h3>
                      <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-medium text-white">
                        {mockIssues.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-[#64748b]">
                      모두 보기
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {mockIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-all",
                          highlightedItemId === issue.itemId
                            ? "border-[#3b82f6] ring-2 ring-[#3b82f6]/20 shadow-md"
                            : "border-[#fecaca]/50 hover:shadow-sm"
                        )}
                        onMouseEnter={() => setHighlightedItemId(issue.itemId)}
                        onMouseLeave={() => setHighlightedItemId(null)}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            issue.severity === "error" ? "bg-[#fef2f2]" : "bg-[#fffbeb]"
                          )}
                        >
                          <AlertTriangle
                            className={cn(
                              "h-4 w-4",
                              issue.severity === "error" ? "text-[#ef4444]" : "text-[#f59e0b]"
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#0f172a]">
                              {issue.itemName}
                            </span>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                issue.type === "conflict"
                                  ? "bg-[#fef2f2] text-[#ef4444]"
                                  : "bg-[#fffbeb] text-[#f59e0b]"
                              )}
                            >
                              {issue.type === "conflict" ? "불일치" : "이슈"}
                            </span>
                          </div>
                          <p className="truncate text-xs text-[#64748b]">{issue.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* 도면 보기 버튼 */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-[#94a3b8] hover:text-[#3b82f6]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIssueHighlight(issue.itemId);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>도면 하이라이트</TooltipContent>
                          </Tooltip>
                          <span className="text-xs text-[#94a3b8]">{issue.createdAt}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-[#94a3b8] hover:text-[#3b82f6]"
                            onClick={() => navigate(`/items/${issue.itemId}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#0f172a]">폴더</h3>
                  {!hasNoFolders && (
                    <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]">
                      모두 보기
                    </Button>
                  )}
                </div>

                {hasNoFolders ? (
                  /* Empty State */
                  <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
                      <FolderPlus className="h-6 w-6 text-[#94a3b8]" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#64748b]">아직 폴더가 없습니다</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      프로젝트를 체계적으로 관리하려면 폴더를 만들어보세요
                    </p>
                    <Button className="mt-4 bg-[#3b82f6] hover:bg-[#2563eb]" size="sm">
                      <FolderPlus className="mr-2 h-4 w-4" />
                      첫 폴더 만들기
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {project.children?.map((child) => (
                      <div
                        key={child.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e2e8f0] p-3 transition-all hover:border-[#3b82f6]/30 hover:bg-[#f8fafc]"
                        onClick={() => navigate("/items")}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fef3c7]">
                          <Layers className="h-5 w-5 text-[#f59e0b]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#0f172a]">{child.name}</p>
                          <p className="text-xs text-[#64748b]">{child.itemCount ?? 0}개 아이템</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-[#94a3b8]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="col-span-4 space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <h3 className="font-semibold text-[#0f172a]">빠른 작업</h3>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/items")}
                  >
                    <Package className="mr-2 h-4 w-4 text-[#8b5cf6]" />
                    아이템 목록
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4 text-[#22c55e]" />
                    BOM 내보내기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-[#ef4444]" />
                    충돌 관리
                  </Button>
                </div>
              </div>

              {/* Team Members */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#0f172a]">팀 멤버</h3>
                  <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]">
                    초대
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {mockTeamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-sm font-medium text-white">
                        {member.name[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0f172a]">{member.name}</p>
                        <p className="text-xs text-[#64748b]">{member.role}</p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              member.lastActive === "방금 전" ? "bg-[#22c55e]" : "bg-[#94a3b8]"
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{member.lastActive}</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Tabs (활동 + 댓글) */}
              <ActivityTabs activities={mockActivities} comments={mockComments} />
            </div>
          </div>
        </div>
      </div>

      {/* 간트 차트 다이얼로그 */}
      <GanttChartDialog open={isGanttOpen} onClose={() => setIsGanttOpen(false)} items={mockGanttItems} />
    </TooltipProvider>
  );
}
