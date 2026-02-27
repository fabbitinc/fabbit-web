import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Upload,
  Sparkles,
  Loader2,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePartsUploadStore } from "@/stores/partsUploadStore";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/api";
import { linkPartsToProject } from "@/api/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PartsTableContent } from "@/components/parts/PartsTableContent";

export function PartsPage() {
  const navigate = useNavigate();
  const openPartsUploadModal = usePartsUploadStore((s) => s.openModal);

  const handleRowClick = useCallback((partId: string) => {
    navigate(`/parts/${partId}`);
  }, [navigate]);

  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  return (
    <div className="min-h-full">
      <div className="w-full">
        {/* 헤더 */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">부품 관리</h1>
            <p className="mt-1 text-sm text-muted-foreground">조직의 전체 부품을 관리합니다</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate("/parts/templates")}
              variant="outline"
              className="ai-outline-btn ai-theme-1"
            >
              <Sparkles className="ai-outline-btn__icon h-4 w-4" />
              속성 분석
            </Button>
            <Button variant="outline" onClick={() => openPartsUploadModal()}>
              <Upload className="h-4 w-4" />
              부품 업로드
            </Button>
            <Button>
              <Plus />
              새 부품
            </Button>
          </div>
        </div>

        <PartsTableContent
          onRowClick={handleRowClick}
          onSelectedIdsChange={setSelectedPartIds}
          selectedAction={({ selectedIds }) => (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              프로젝트 연결
            </Button>
          )}
        />
      </div>

      <LinkToProjectDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        selectedPartIds={selectedPartIds}
        onComplete={() => setSelectedPartIds(new Set())}
      />
    </div>
  );
}

// --- 프로젝트 연결 다이얼로그 ---

function LinkToProjectDialog({
  open,
  onOpenChange,
  selectedPartIds,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPartIds: Set<string>;
  onComplete: () => void;
}) {
  const { data: projectsResponse, isLoading } = useProjects(
    { offset: 0, limit: 100 },
    { enabled: open },
  );
  const [search, setSearch] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const filtered = useMemo(() => {
    const projects = projectsResponse?.items ?? [];
    if (!search.trim()) return projects;
    const q = search.trim().toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projectsResponse?.items, search]);

  // 다이얼로그 닫힐 때 상태 초기화
  function handleOpenChange(next: boolean) {
    if (!next) {
      setSearch("");
      setSelectedProjectId(null);
    }
    onOpenChange(next);
  }

  async function handleLink() {
    if (!selectedProjectId) return;
    setIsLinking(true);
    try {
      const partIds = [...selectedPartIds];
      const response = await linkPartsToProject(selectedProjectId, partIds);
      toast.success(`${response.linked_count}건의 부품이 프로젝트에 연결되었습니다`);
      onComplete();
      handleOpenChange(false);
    } catch {
      toast.error("부품 연결에 실패했습니다");
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트에 연결</DialogTitle>
          <DialogDescription>
            {selectedPartIds.size}건의 부품을 연결할 프로젝트를 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="프로젝트 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search ? "검색 결과가 없습니다" : "프로젝트가 없습니다"}
              </p>
            ) : (
              filtered.map((project) => (
                <label
                  key={project.id}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50 ${
                    selectedProjectId === project.id ? "bg-muted" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="project"
                    checked={selectedProjectId === project.id}
                    onChange={() => setSelectedProjectId(project.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    {project.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLinking}>
            취소
          </Button>
          <Button
            onClick={handleLink}
            disabled={!selectedProjectId || isLinking}
          >
            {isLinking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            연결 ({selectedPartIds.size}건)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
