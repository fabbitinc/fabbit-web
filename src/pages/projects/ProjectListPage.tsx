import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FolderKanban,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// --- Mock 데이터 ---

interface MockProject {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
  createdAt: string;
}

const INITIAL_PROJECTS: MockProject[] = [
  {
    id: "drive-unit-gen4",
    name: "Drive Unit Gen4",
    description: "4세대 구동 유닛 개발 프로젝트. 기존 대비 효율 15% 향상 목표.",
    partCount: 24,
    createdAt: "2025-01-15",
  },
  {
    id: "ev-inverter-rev2",
    name: "EV Inverter Rev2",
    description: "전기차 인버터 2차 리비전. IGBT 모듈 변경 및 방열 구조 개선.",
    partCount: 18,
    createdAt: "2025-02-01",
  },
  {
    id: "robot-arm-v3",
    name: "Robot Arm V3",
    description: "산업용 로봇팔 3세대. 6축 관절 구조 및 감속기 모듈 재설계.",
    partCount: 42,
    createdAt: "2024-11-20",
  },
  {
    id: "battery-pack-module",
    name: "Battery Pack Module",
    description: "배터리 팩 모듈 설계. 셀 배치 최적화 및 냉각 구조 검증.",
    partCount: 9,
    createdAt: "2025-01-28",
  },
  {
    id: "sensor-housing-asm",
    name: "Sensor Housing Assembly",
    description: "센서 하우징 조립체. IP67 방수 규격 대응 설계 완료.",
    partCount: 0,
    createdAt: "2024-09-05",
  },
];

// --- 헬퍼 ---

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- 정렬 ---

type SortKey = "name" | "partCount" | "createdAt";
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
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName("");
    setDescription("");
    onOpenChange(false);
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
  const [projects, setProjects] = useState<MockProject[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("partCount");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // 클라이언트 사이드 검색
  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [projects, search]);

  // 정렬
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "ko");
      } else if (sortKey === "partCount") {
        cmp = a.partCount - b.partCount;
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function handleCreate(name: string, description: string) {
    const newProject: MockProject = {
      id: `project-${Date.now()}`,
      name,
      description: description || null,
      partCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) => [newProject, ...prev]);
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col />
              <col style={{ width: "45%" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "15%" }} />
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <SortableHeader column="name" label="이름" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="py-3 px-2 pl-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  설명
                </th>
                <SortableHeader column="partCount" label="부품" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader column="createdAt" label="생성일" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
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
                    <td className="py-2 pl-4 pr-2 text-muted-foreground text-sm">
                      {formatDate(project.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 총 건수 */}
        {sorted.length > 0 && (
          <div className="border-t bg-muted/30 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              총 <span className="font-semibold text-foreground">{sorted.length}</span>개 프로젝트
            </span>
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
