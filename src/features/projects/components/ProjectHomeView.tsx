import { useNavigate } from "react-router-dom";
import {
  Layers,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flag,
  ChevronRight,
  Search,
  FolderOpen,
  Upload,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TreeNodeData } from "@/features/items/types";
import { useItemStore } from "@/stores/itemStore";
import { useUploadStore } from "@/stores/uploadStore";
import { useProjectTree } from "@/api";

// Mock 데이터
import {
  mockBOMStatus,
  mockMilestones,
  mockRecentDrawings,
  mockTeamMembers,
} from "../mock-data/dashboard-mock";
import { useMilestoneWarning } from "../hooks/useMilestoneWarning";
import { BOMStatusChart } from "./dashboard/BOMStatusChart";

interface ProjectHomeViewProps {
  projectId: string;
}

function findProjectById(nodes: TreeNodeData[], id: string): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === id && node.type === "project") return node;
    if (node.children) {
      const found = findProjectById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 프로젝트까지의 경로 찾기 (브레드크럼용)
function findProjectPath(
  nodes: TreeNodeData[],
  targetId: string,
  path: TreeNodeData[] = []
): TreeNodeData[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...path, node];
    }
    if (node.children) {
      const result = findProjectPath(node.children, targetId, [...path, node]);
      if (result) return result;
    }
  }
  return null;
}

export function ProjectHomeView({ projectId }: ProjectHomeViewProps) {
  const navigate = useNavigate();
  const setSelectedFolderId = useItemStore((state) => state.setSelectedFolderId);
  const setSelectedProjectId = useItemStore((state) => state.setSelectedProjectId);
  const openUploadModal = useUploadStore((state) => state.openModal);
  const { data: treeData = [] } = useProjectTree();

  const project = findProjectById(treeData, projectId);
  const projectPath = findProjectPath(treeData, projectId) ?? [];
  const milestonesWithWarning = useMilestoneWarning(mockMilestones);

  // 현재/다음 마일스톤 찾기
  const currentMilestone = milestonesWithWarning.find((m) => m.milestone.status === "current");
  const upcomingMilestones = milestonesWithWarning.filter((m) => m.milestone.status === "upcoming").slice(0, 2);

  if (!project) {
    return null;
  }

  // Mock 통계
  const stats = {
    totalItems: 24,
    aiAnalyzed: 20,
    approved: mockBOMStatus.approved,
    reviewing: mockBOMStatus.reviewing,
    conflicts: mockBOMStatus.conflicts,
  };

  const progressRate = Math.round((stats.approved / stats.totalItems) * 100);
  const aiProgress = Math.round((stats.aiAnalyzed / stats.totalItems) * 100);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedProjectId(null);
  };

  const handleViewFullDashboard = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleBreadcrumbClick = (node: TreeNodeData | null) => {
    if (!node) {
      // "모든 아이템" 클릭 - 선택 해제
      setSelectedFolderId("");
      setSelectedProjectId(null);
    } else if (node.type === "project") {
      // 프로젝트 클릭
      setSelectedFolderId("");
      setSelectedProjectId(node.id);
    } else {
      // 폴더 클릭
      setSelectedFolderId(node.id);
      setSelectedProjectId(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] shadow-lg shadow-[#8b5cf6]/25">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#0f172a]">{project.name}</h1>
              <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-medium text-[#059669]">
                진행중
              </span>
            </div>
            <p className="text-sm text-[#64748b]">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleViewFullDashboard}>
            <ExternalLink className="mr-2 h-4 w-4" />
            전체 대시보드
          </Button>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb]" onClick={openUploadModal}>
            <Upload className="mr-2 h-4 w-4" />
            도면 업로드
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f8fafc] p-6">
        {/* 브레드크럼 */}
        <div className="mb-4 flex items-center gap-1 text-sm">
          <button
            className="text-[#94a3b8] hover:text-[#64748b] transition-colors"
            onClick={() => handleBreadcrumbClick(null)}
          >
            모든 아이템
          </button>
          {projectPath.map((node, index) => (
            <span key={node.id} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-[#cbd5e1]" />
              <button
                className={cn(
                  "transition-colors",
                  index === projectPath.length - 1
                    ? "font-medium text-[#0f172a]"
                    : "text-[#64748b] hover:text-[#0f172a]"
                )}
                onClick={() => handleBreadcrumbClick(node)}
              >
                {node.name}
              </button>
            </span>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input placeholder="부품 번호 또는 이름으로 검색..." className="pl-9 bg-white" />
        </div>

        {/* 핵심 지표 그리드 */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {/* 전체 진행률 */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">전체 진행률</span>
              <span className="text-2xl font-bold text-[#8b5cf6]">{progressRate}%</span>
            </div>
            <Progress
              value={progressRate}
              className="mt-3 h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-[#8b5cf6] [&>div]:to-[#6366f1]"
            />
            <p className="mt-2 text-xs text-[#94a3b8]">{stats.approved}/{stats.totalItems}개 승인 완료</p>
          </div>

          {/* AI 분석 */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3b82f6]" />
                <span className="text-sm text-[#64748b]">AI 분석</span>
              </div>
              <span className="text-2xl font-bold text-[#3b82f6]">{aiProgress}%</span>
            </div>
            <Progress value={aiProgress} className="mt-3 h-2.5" />
            <p className="mt-2 text-xs text-[#94a3b8]">{stats.aiAnalyzed}/{stats.totalItems}개 완료</p>
          </div>

          {/* 상태 요약 */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <span className="text-sm text-[#64748b]">BOM 상태</span>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                <span className="text-lg font-bold text-[#22c55e]">{stats.approved}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#f59e0b]" />
                <span className="text-lg font-bold text-[#f59e0b]">{stats.reviewing}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
                <span className="text-lg font-bold text-[#ef4444]">{stats.conflicts}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#94a3b8]">승인 / 검토중 / 불일치</p>
          </div>

          {/* 팀 */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#64748b]" />
              <span className="text-sm text-[#64748b]">팀 멤버</span>
            </div>
            <div className="mt-3 flex -space-x-2">
              {mockTeamMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-xs font-medium text-white"
                >
                  {member.name[0]}
                </div>
              ))}
              {mockTeamMembers.length > 4 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#f1f5f9] text-xs font-medium text-[#64748b]">
                  +{mockTeamMembers.length - 4}
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-[#94a3b8]">{mockTeamMembers.length}명 참여중</p>
          </div>
        </div>

        {/* 2단 레이아웃: 마일스톤 & 하위 폴더 */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          {/* 마일스톤 */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#8b5cf6]" />
                <h3 className="font-semibold text-[#0f172a]">마일스톤</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]" onClick={handleViewFullDashboard}>
                전체 보기
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {currentMilestone && (
                <div
                  className={cn(
                    "rounded-lg border p-3",
                    currentMilestone.isWarning
                      ? "border-[#fde68a] bg-[#fffbeb]"
                      : currentMilestone.isOverdue
                        ? "border-[#fecaca] bg-[#fef2f2]"
                        : "border-[#3b82f6]/30 bg-[#eff6ff]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#0f172a]">{currentMilestone.milestone.name}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        currentMilestone.isWarning && "bg-[#f59e0b]/10 text-[#f59e0b]",
                        currentMilestone.isOverdue && "bg-[#ef4444]/10 text-[#ef4444]",
                        !currentMilestone.isWarning && !currentMilestone.isOverdue && "bg-[#3b82f6]/10 text-[#3b82f6]"
                      )}
                    >
                      {currentMilestone.isOverdue
                        ? "기한 초과"
                        : currentMilestone.isWarning
                          ? `${currentMilestone.daysUntil}일 남음`
                          : "현재 단계"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#64748b]">{currentMilestone.milestone.date}</p>
                </div>
              )}

              {upcomingMilestones.map((m) => (
                <div key={m.milestone.id} className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-3">
                  <span className="text-sm text-[#64748b]">{m.milestone.name}</span>
                  <span className="text-xs text-[#94a3b8]">{m.milestone.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하위 폴더/어셈블리 */}
          <div className="col-span-2 rounded-xl border border-[#e2e8f0] bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#0f172a]">하위 어셈블리</h3>
              <span className="text-xs text-[#94a3b8]">{project.children?.length ?? 0}개 폴더</span>
            </div>

            {project.children && project.children.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {project.children.map((child) => (
                  <button
                    key={child.id}
                    className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] p-3 text-left transition-all hover:border-[#3b82f6]/30 hover:bg-[#f8fafc] hover:shadow-sm"
                    onClick={() => handleFolderClick(child.id)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fef3c7]">
                      <FolderOpen className="h-5 w-5 text-[#f59e0b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-[#0f172a]">{child.name}</p>
                      <p className="text-xs text-[#64748b]">{child.itemCount ?? 0}개 아이템</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#94a3b8]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] py-8">
                <FolderOpen className="h-8 w-8 text-[#94a3b8]" />
                <p className="mt-2 text-sm text-[#64748b]">하위 폴더가 없습니다</p>
                <Button variant="outline" size="sm" className="mt-3">
                  폴더 만들기
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 주의 필요 항목 & 최근 도면 */}
        <div className="mt-6 grid grid-cols-3 gap-6">
          {/* 주의 필요 항목 */}
          {stats.conflicts > 0 && (
            <div className="rounded-xl border border-[#fecaca] bg-gradient-to-b from-[#fef2f2] to-white p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
                <h3 className="font-semibold text-[#dc2626]">주의 필요</h3>
                <span className="rounded-full bg-[#ef4444] px-2 py-0.5 text-xs font-medium text-white">
                  {stats.conflicts}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#64748b]">
                {stats.conflicts}개의 불일치 항목이 감지되었습니다. 확인이 필요합니다.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full border-[#fecaca] text-[#ef4444] hover:bg-[#fef2f2]"
                onClick={handleViewFullDashboard}
              >
                상세 확인
              </Button>
            </div>
          )}

          {/* 최근 도면 */}
          <div className={cn("rounded-xl border border-[#e2e8f0] bg-white p-5", stats.conflicts === 0 && "col-span-3")}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#0f172a]">최근 업로드 도면</h3>
              <Button variant="ghost" size="sm" className="text-xs text-[#3b82f6]">
                모두 보기
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {mockRecentDrawings.slice(0, 3).map((drawing) => (
                <div
                  key={drawing.id}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#f8fafc] cursor-pointer"
                  onClick={() => navigate(`/items/${drawing.itemId}`)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#f1f5f9]">
                    <Layers className="h-4 w-4 text-[#64748b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#0f172a]">{drawing.itemName}</p>
                    <p className="text-xs text-[#64748b]">{drawing.partNumber}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        drawing.status === "approved" && "bg-[#ecfdf5] text-[#22c55e]",
                        drawing.status === "reviewing" && "bg-[#fffbeb] text-[#f59e0b]",
                        drawing.status === "conflict" && "bg-[#fef2f2] text-[#ef4444]"
                      )}
                    >
                      {drawing.status === "approved" && "승인"}
                      {drawing.status === "reviewing" && "검토중"}
                      {drawing.status === "conflict" && "불일치"}
                    </span>
                    <p className="mt-0.5 text-xs text-[#94a3b8]">{drawing.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOM 차트 (불일치가 없을 때) */}
          {stats.conflicts === 0 && (
            <div className="col-span-2">
              <BOMStatusChart status={mockBOMStatus} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
