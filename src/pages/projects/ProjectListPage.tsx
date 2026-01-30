import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Calendar,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFolders } from "@/features/items/mock-data";

export function ProjectListPage() {
  const navigate = useNavigate();

  // 프로젝트만 필터링
  const projects = mockFolders.filter((folder) => folder.type === "project");

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]">프로젝트</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            전체 {projects.length}개의 프로젝트
          </p>
        </div>
        <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">
          <Plus className="mr-2 h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
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
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {project.lastUpdated}
              </span>
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
        ))}
      </div>
    </div>
  );
}
