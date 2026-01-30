import { useNavigate } from "react-router-dom";
import {
  Layers,
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flag,
  ChevronRight,
  Search,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { mockFolders } from "@/features/items/mock-data";
import type { FolderData } from "@/features/items/types";
import { useItemStore } from "@/stores/itemStore";

// Mock 데이터
import {
  mockBOMStatus,
  mockMilestones,
} from "../mock-data/dashboard-mock";
import { useMilestoneWarning } from "../hooks/useMilestoneWarning";

interface ProjectSummaryPanelProps {
  projectId: string;
  onClose: () => void;
}

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

export function ProjectSummaryPanel({ projectId, onClose }: ProjectSummaryPanelProps) {
  const navigate = useNavigate();
  const setSelectedFolderId = useItemStore((state) => state.setSelectedFolderId);
  const setSelectedProjectId = useItemStore((state) => state.setSelectedProjectId);

  const project = findProjectById(mockFolders, projectId);
  const milestonesWithWarning = useMilestoneWarning(mockMilestones);

  // 현재 마일스톤 찾기
  const currentMilestone = milestonesWithWarning.find((m) => m.milestone.status === "current");

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

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedProjectId(null);
  };

  const handleViewFullDashboard = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="flex h-full flex-col border-l border-[#e2e8f0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6366f1]">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0f172a]">{project.name}</h2>
            <p className="text-xs text-[#64748b]">프로젝트 요약</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="부품 번호 또는 이름 검색..."
            className="pl-9"
          />
        </div>

        {/* 핵심 지표 */}
        <div className="mt-4 space-y-3">
          {/* 전체 진행률 */}
          <div className="rounded-lg border border-[#e2e8f0] p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#64748b]">전체 진행률</span>
              <span className="text-lg font-bold text-[#8b5cf6]">{progressRate}%</span>
            </div>
            <Progress
              value={progressRate}
              className="mt-2 h-2 [&>div]:bg-gradient-to-r [&>div]:from-[#8b5cf6] [&>div]:to-[#6366f1]"
            />
          </div>

          {/* 상태 요약 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-[#ecfdf5] p-2 text-center">
              <CheckCircle2 className="mx-auto h-4 w-4 text-[#22c55e]" />
              <p className="mt-1 text-lg font-bold text-[#22c55e]">{stats.approved}</p>
              <p className="text-[10px] text-[#64748b]">승인됨</p>
            </div>
            <div className="rounded-lg bg-[#fffbeb] p-2 text-center">
              <Sparkles className="mx-auto h-4 w-4 text-[#f59e0b]" />
              <p className="mt-1 text-lg font-bold text-[#f59e0b]">{stats.reviewing}</p>
              <p className="text-[10px] text-[#64748b]">검토중</p>
            </div>
            <div className="rounded-lg bg-[#fef2f2] p-2 text-center">
              <AlertTriangle className="mx-auto h-4 w-4 text-[#ef4444]" />
              <p className="mt-1 text-lg font-bold text-[#ef4444]">{stats.conflicts}</p>
              <p className="text-[10px] text-[#64748b]">불일치</p>
            </div>
          </div>

          {/* 현재 마일스톤 */}
          {currentMilestone && (
            <div
              className={cn(
                "rounded-lg border p-3",
                currentMilestone.isWarning
                  ? "border-[#fde68a] bg-[#fffbeb]"
                  : currentMilestone.isOverdue
                    ? "border-[#fecaca] bg-[#fef2f2]"
                    : "border-[#e2e8f0] bg-[#f8fafc]"
              )}
            >
              <div className="flex items-center gap-2">
                <Flag
                  className={cn(
                    "h-4 w-4",
                    currentMilestone.isWarning
                      ? "text-[#f59e0b]"
                      : currentMilestone.isOverdue
                        ? "text-[#ef4444]"
                        : "text-[#8b5cf6]"
                  )}
                />
                <span className="text-sm font-medium text-[#0f172a]">현재 단계</span>
              </div>
              <p className="mt-1 text-sm text-[#64748b]">{currentMilestone.milestone.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#94a3b8]">{currentMilestone.milestone.date}</span>
                {currentMilestone.isWarning && (
                  <span className="flex items-center gap-1 rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-xs font-medium text-[#f59e0b]">
                    <AlertTriangle className="h-3 w-3" />
                    {currentMilestone.daysUntil}일 남음
                  </span>
                )}
                {currentMilestone.isOverdue && (
                  <span className="flex items-center gap-1 rounded-full bg-[#ef4444]/10 px-2 py-0.5 text-xs font-medium text-[#ef4444]">
                    <AlertTriangle className="h-3 w-3" />
                    기한 초과
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 하위 어셈블리 */}
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[#64748b]">
            하위 어셈블리
          </h3>
          <div className="space-y-1">
            {project.children && project.children.length > 0 ? (
              project.children.map((child) => (
                <button
                  key={child.id}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-[#f8fafc]"
                  onClick={() => handleFolderClick(child.id)}
                >
                  <FolderOpen className="h-4 w-4 text-[#f59e0b]" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[#0f172a]">{child.name}</p>
                    <p className="text-xs text-[#64748b]">{child.itemCount ?? 0}개 아이템</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94a3b8]" />
                </button>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-[#94a3b8]">하위 폴더가 없습니다</p>
            )}
          </div>
        </div>

        {/* 주의 필요 항목 (불일치가 있을 때만) */}
        {stats.conflicts > 0 && (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
              <span className="text-sm font-medium text-[#dc2626]">주의 필요</span>
            </div>
            <p className="mt-1 text-xs text-[#64748b]">
              {stats.conflicts}개의 불일치 항목이 있습니다. 확인이 필요합니다.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-[#fecaca] text-[#ef4444] hover:bg-[#fef2f2]"
              onClick={handleViewFullDashboard}
            >
              상세 보기
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#e2e8f0] p-4">
        <Button
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
          onClick={handleViewFullDashboard}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          전체 대시보드 보기
        </Button>
      </div>
    </div>
  );
}
