import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Network,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, useCreateProject } from "@/api/hooks";
import type { ListProjectsParams, ProjectDto } from "@/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
}

const PAGE_SIZE_OPTIONS = [15, 30, 50];

// --- 정렬 ---

type SortKey = "name" | "partCount";
type SortDir = "asc" | "desc";

function SortableHeader({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  column: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = sortKey === column;
  const Icon = isActive
    ? sortDir === "asc" ? ArrowUp : ArrowDown
    : ArrowUpDown;

  return (
    <th className="py-3 px-2 pl-4">
      <button
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-colors ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <Icon className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground/50"}`} />
      </button>
    </th>
  );
}

// --- 프로젝트 생성 다이얼로그 ---

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await onCreate(name.trim(), description.trim());
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch {
      return;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 프로젝트</DialogTitle>
          <DialogDescription>
            프로젝트를 생성하고 부품을 그룹으로 관리하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">프로젝트 이름</Label>
            <Input
              id="project-name"
              placeholder="예: Drive Unit Gen4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">설명 (선택)</Label>
            <Textarea
              id="project-desc"
              placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- 메인 컴포넌트 ---

export function ProjectListPage() {
  const navigate = useNavigate();
  const createProjectMutation = useCreateProject();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [createOpen, setCreateOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("partCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const apiParams = useMemo<ListProjectsParams>(() => ({
    search: search.trim() || undefined,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  }), [search, page, pageSize]);

  const { data: projectsResponse, isLoading, isError, refetch } = useProjects(apiParams);
  const totalCount = projectsResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  const projects = useMemo<ProjectRow[]>(() => {
    return (projectsResponse?.items ?? []).map((project: ProjectDto) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      partCount: project.partCount,
    }));
  }, [projectsResponse?.items]);

  // 정렬
  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ko");
      } else if (sortKey === "partCount") {
        cmp = a.partCount - b.partCount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [projects, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  async function handleCreate(name: string, description: string) {
    await createProjectMutation.mutateAsync({
      name,
      description: description || null,
    });
  }

  return (
    <div className="min-h-full">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">프로젝트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            프로젝트별로 부품을 그룹화하여 관리합니다
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          새 프로젝트
        </Button>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="프로젝트 검색..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="flex h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-muted-foreground">프로젝트 목록을 불러오지 못했습니다.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              다시 시도
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col />
              <col style={{ width: "55%" }} />
              <col style={{ width: "80px" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <SortableHeader column="name" label="이름" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="py-3 px-2 pl-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  설명
                </th>
                <SortableHeader column="partCount" label="부품" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center">
                    <EmptyState hasSearch={!!search.trim()} onCreateClick={() => setCreateOpen(true)} />
                  </td>
                </tr>
              ) : (
                sorted.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="group h-[45px] border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <td className="py-2 pl-4 pr-2 font-medium text-foreground">
                      {project.name}
                    </td>
                    <td className="py-2 pl-4 pr-2 text-muted-foreground">
                      {project.description ? (
                        <span className="line-clamp-1">{project.description}</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="py-2 pl-4 pr-2">
                      {project.partCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <Network className="h-3.5 w-3.5" />
                          {project.partCount}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}

        {!isLoading && !isError && (
          <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}개씩</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {totalCount > 0
                  ? `${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, totalCount)} / ${totalCount}건`
                  : "0건"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                <ChevronLeft />
              </Button>
              {getPageNumbers(safePage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safePage ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => setPage(p as number)}
                    className="text-xs"
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}

// --- 서브 컴포넌트 ---

function EmptyState({ hasSearch, onCreateClick }: { hasSearch: boolean; onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderKanban className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        {hasSearch ? "검색 결과가 없습니다" : "아직 프로젝트가 없습니다"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasSearch
          ? "다른 검색어를 입력해 보세요"
          : "새 프로젝트를 만들어 부품을 관리해 보세요"}
      </p>
      {!hasSearch && (
        <Button size="sm" className="mt-4" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          새 프로젝트
        </Button>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
