import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Calendar,
  Package,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/api/hooks";
import type { TreeNodeData } from "@/features/items/types";

function ProjectCard({ project }: { project: TreeNodeData }) {
  const navigate = useNavigate();

  // lastUpdated 날짜 포맷 (ISO → YYYY-MM-DD)
  const formattedDate = project.lastUpdated
    ? project.lastUpdated.length > 10
      ? project.lastUpdated.slice(0, 10)
      : project.lastUpdated
    : undefined;

  return (
    <div
      className="group cursor-pointer rounded-xl border border-[#e2e8f0] bg-white p-5 transition-all hover:border-[#3b82f6] hover:shadow-md"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8b5cf6]">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-[#0f172a]">{project.name}</h3>
            <p className="text-sm text-[#64748b]">{project.description}</p>
          </div>
        </div>
        <button
          className="rounded p-1 text-[#94a3b8] opacity-0 transition-opacity hover:bg-[#f1f5f9] group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${project.id}/settings`);
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-[#94a3b8]">
        <span className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          {project.itemCount ?? 0}개 아이템
        </span>
        {formattedDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#64748b]">진행률</span>
          <span className="font-medium text-[#3b82f6]">70%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
          <div
            className="h-full rounded-full bg-[#3b82f6]"
            style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectListPage() {
  const { mockProjects, apiProjects, isLoading, isError } = useProjects();

  const totalCount = mockProjects.length + apiProjects.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]">프로젝트</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            전체 {totalCount}개의 프로젝트
          </p>
        </div>
        <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">
          <Plus className="mr-2 h-4 w-4" />새 프로젝트
        </Button>
      </div>

      {/* API 프로젝트 섹션 */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-medium text-[#64748b]">
          프로젝트 ({isLoading ? "..." : apiProjects.length})
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] py-12">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#94a3b8]" />
            <span className="text-sm text-[#94a3b8]">
              프로젝트를 불러오는 중...
            </span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50 py-12">
            <span className="text-sm text-red-500">
              프로젝트를 불러오지 못했습니다.
            </span>
          </div>
        ) : apiProjects.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e2e8f0] py-12">
            <span className="text-sm text-[#94a3b8]">
              생성된 프로젝트가 없습니다.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apiProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Mock 프로젝트 섹션 */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-[#94a3b8]">
          [Mock] UI 설계 확인용 ({mockProjects.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
