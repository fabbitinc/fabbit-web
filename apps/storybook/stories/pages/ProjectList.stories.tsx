import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  User,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

import {
  AppShell,
  AppHeader,
  AppSidebar,
  FilterBar,
  EmptyState,
} from "@fabbit/components";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  UserAvatar,
} from "@fabbit/ui";

/* ─── 공통 레이아웃 mock ─── */

const brand = (
  <div className="flex items-center gap-2">
    <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <span className="text-sm font-semibold">Fabbit</span>
  </div>
);

const mockUser = { name: "문성하", email: "seongha@fabbit.io" };
const mockMenuItems = [
  { id: "profile", label: "개인 설정", icon: User, onClick: () => {} },
  { id: "org", label: "조직 설정", icon: Building2, onClick: () => {} },
];

const navSections = [
  {
    id: "main",
    items: [
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, onClick: () => {} },
      { id: "projects", label: "프로젝트", icon: FolderKanban, active: true, onClick: () => {} },
      { id: "changes", label: "변경 관리", icon: GitPullRequestArrow, onClick: () => {} },
      { id: "parts", label: "부품관리", icon: Package, onClick: () => {} },
    ],
  },
];

/* ─── 프로젝트 mock 데이터 ─── */

const projects = [
  { id: "1", name: "EV 모터 컨트롤러", description: "전기차 구동 모터 제어 모듈 설계", partCount: 342, owner: "김태현", status: "운영 중", updated: "2026-03-07" },
  { id: "2", name: "배터리 팩 v2", description: "2세대 배터리 팩 구조 설계", partCount: 218, owner: "이수진", status: "운영 중", updated: "2026-03-06" },
  { id: "3", name: "센서 어셈블리", description: "온도/진동 센서 통합 모듈", partCount: 87, owner: "박준서", status: "운영 중", updated: "2026-03-05" },
  { id: "4", name: "냉각 시스템 R&D", description: "액냉 시스템 시제품 개발", partCount: 156, owner: "최민정", status: "운영 중", updated: "2026-03-04" },
  { id: "5", name: "커넥터 규격화", description: "사내 커넥터 표준화 프로젝트", partCount: 64, owner: "정하은", status: "보관됨", updated: "2026-02-28" },
];

/* ─── 프로젝트 목록 콘텐츠 ─── */

function ProjectListContent() {
  const [search, setSearch] = useState("");
  const [chips, setChips] = useState([
    { id: "status", label: "상태: 운영 중" },
  ]);

  const filtered = projects.filter((p) =>
    p.name.includes(search) || p.description.includes(search),
  );

  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">프로젝트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            부품과 변경 흐름을 프로젝트 단위로 관리합니다.
          </p>
        </div>
        <Button>+ 프로젝트 생성</Button>
      </div>

      {/* 필터 */}
      <FilterBar
        searchValue={search}
        searchPlaceholder="프로젝트 이름, 설명으로 검색..."
        chips={chips}
        onSearchChange={setSearch}
        onChipRemove={(id) => setChips((prev) => prev.filter((c) => c.id !== id))}
        onClearAll={() => setChips([])}
        actions={
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 size-4" />
            필터
          </Button>
        }
      />

      {/* 테이블 */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로젝트</TableHead>
              <TableHead>부품 수</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>최근 수정</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id} className="cursor-pointer hover:bg-accent/40">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{project.partCount.toLocaleString()}개</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={project.owner} className="size-6" />
                    <span className="text-sm">{project.owner}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={project.status === "운영 중" ? "accent" : "outline"}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">1 - 5 / 5</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/ProjectList",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          onSearchClick={() => {}}
          searchPlaceholder="품목, 도면, BOM 검색..."
          onNotificationClick={() => {}}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar sections={navSections} />}
    >
      <ProjectListContent />
    </AppShell>
  ),
};

export const Empty: Story = {
  render: () => (
    <AppShell
      header={
        <AppHeader
          brand={brand}
          user={mockUser}
          onToggleSidebar={() => {}}
          onSearchClick={() => {}}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar sections={navSections} />}
    >
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">프로젝트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            부품과 변경 흐름을 프로젝트 단위로 관리합니다.
          </p>
        </div>
        <div className="rounded-lg border bg-card py-12">
          <EmptyState
            icon={FolderKanban}
            title="프로젝트가 아직 없습니다"
            description="첫 프로젝트를 만들어 부품과 변경 흐름을 묶어 관리하세요."
            actionLabel="프로젝트 생성"
            onAction={() => {}}
          />
        </div>
      </div>
    </AppShell>
  ),
};
