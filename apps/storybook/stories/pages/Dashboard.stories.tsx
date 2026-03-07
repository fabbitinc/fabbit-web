import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequestArrow,
  Package,
  CircleDot,
  User,
  Building2,
  ArrowRight,
  HardDrive,
  Sparkles,
} from "lucide-react";

import {
  AppShell,
  AppHeader,
  AppSidebar,
  StatGroup,
  SummaryCard,
  ActivityList,
  UsageCard,
  KpiCard,
} from "@fabbit/components";
import { Badge, Button } from "@fabbit/ui";

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
      { id: "dashboard", label: "대시보드", icon: LayoutDashboard, active: true, onClick: () => {} },
      { id: "projects", label: "프로젝트", icon: FolderKanban, onClick: () => {} },
      { id: "changes", label: "변경 관리", icon: GitPullRequestArrow, onClick: () => {} },
      { id: "parts", label: "부품관리", icon: Package, onClick: () => {} },
    ],
  },
];

/* ─── 대시보드 콘텐츠 ─── */

function DashboardContent() {
  return (
    <div className="space-y-6 p-6">
      {/* 내 현황 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">내 현황</h2>
        <StatGroup columns={3}>
          <SummaryCard icon={CircleDot} label="할당된 이슈" value="3건" sub="열린 이슈" onClick={() => {}} />
          <SummaryCard icon={GitPullRequestArrow} label="할당된 변경요청" value="2건" sub="진행 중인 CR" onClick={() => {}} />
          <SummaryCard icon={Package} label="관리 중인 부품" value="1,234개" sub="전체 부품 수" onClick={() => {}} />
        </StatGroup>
      </section>

      {/* 내 작업 */}
      <ActivityList
        title="내 작업"
        action={
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
            전체 보기 <ArrowRight className="size-3" />
          </Button>
        }
        items={[
          { id: "1", icon: CircleDot, iconClassName: "text-emerald-500", number: "#42", title: "센서 모듈 하우징 간섭 이슈", subtitle: "EV 모터 컨트롤러 · 2시간 전", label: { name: "긴급", color: "#ef4444" }, status: { text: "열림", variant: "outline" }, author: "김태현", onClick: () => {} },
          { id: "2", icon: GitPullRequestArrow, iconClassName: "text-blue-500", number: "#15", title: "PCB 커넥터 핀 배열 변경", subtitle: "EV 모터 컨트롤러 · 4시간 전", label: { name: "설계변경", color: "#3b82f6" }, status: { text: "검토 중", variant: "outline" }, author: "이수진", onClick: () => {} },
          { id: "3", icon: CircleDot, iconClassName: "text-emerald-500", number: "#78", title: "방열판 재질 SUS304 → AL6061 검토", subtitle: "배터리 팩 v2 · 1일 전", label: { name: "검토필요", color: "#f59e0b" }, status: { text: "열림", variant: "outline" }, author: "박준서", onClick: () => {} },
          { id: "4", icon: GitPullRequestArrow, iconClassName: "text-blue-500", number: "#8", title: "메인 하우징 도면 Rev.C 반영", subtitle: "배터리 팩 v2 · 2일 전", status: { text: "초안", variant: "outline" }, author: "최민정", onClick: () => {} },
          { id: "5", icon: CircleDot, iconClassName: "text-emerald-500", number: "#103", title: "볼트 체결 토크 규격 정의", subtitle: "EV 모터 컨트롤러 · 3일 전", label: { name: "규격", color: "#8b5cf6" }, status: { text: "열림", variant: "outline" }, author: "정하은", onClick: () => {} },
        ]}
      />

      {/* 부품 현황 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">부품 현황</h2>
        <StatGroup columns={3}>
          <KpiCard label="관리 중인 부품" value="1,234개" change="+48" changePositive extra={<span className="text-xs text-muted-foreground">이번 주</span>} className="sm:col-span-2" />
          <KpiCard label="BOM 연결" value="3,891개" extra={<span className="text-xs text-muted-foreground">부품 간 구성 관계 수</span>} />
        </StatGroup>
      </section>

      {/* 사용량 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">사용량</h2>
        <StatGroup columns={2}>
          <UsageCard icon={HardDrive} label="파일 저장 용량" used={8.2} limit={10} unit="GB" />
          <UsageCard icon={Sparkles} label="AI 크레딧" used={620} limit={1000} unit="크레딧" />
        </StatGroup>
      </section>
    </div>
  );
}

/* ─── 스토리 ─── */

const meta = {
  title: "Pages/Dashboard",
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
          search={{
            triggerLabel: "검색",
            dialogPlaceholder: "품목, 도면, BOM 검색...",
          }}
          menuItems={mockMenuItems}
          onLogout={() => {}}
        />
      }
      sidebar={<AppSidebar isDesktop sections={navSections} />}
      isDesktop
      mainClassName="p-0"
    >
      <DashboardContent />
    </AppShell>
  ),
};
