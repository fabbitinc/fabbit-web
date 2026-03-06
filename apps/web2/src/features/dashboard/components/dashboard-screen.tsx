import { Boxes, FolderKanban, GitPullRequestArrow, HardDrive, Sparkles } from "lucide-react";
import { DashboardScreen as DashboardScreenView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { useDashboardQuery } from "@/features/dashboard/hooks/use-dashboard-query";

interface QuickAction {
  href: string;
  label: string;
  description: string;
  icon: typeof FolderKanban;
}

interface MyWorkItem {
  id: string;
  title: string;
  href: string;
  kind: "issue" | "change";
  status: string;
  ownerName: string;
  number: number;
  projectName: string;
  updatedAt: string;
  labels: { name: string; color: string }[];
}

const quickActions: QuickAction[] = [
  {
    href: "/parts",
    label: "부품 관리",
    description: "부품과 BOM 구조를 확인합니다.",
    icon: FolderKanban,
  },
  {
    href: "/projects",
    label: "프로젝트 보기",
    description: "진행 중인 프로젝트 현황으로 이동합니다.",
    icon: Boxes,
  },
  {
    href: "/changes",
    label: "변경 관리",
    description: "이슈와 변경 요청 흐름을 확인합니다.",
    icon: GitPullRequestArrow,
  },
];

const myWorkItems: MyWorkItem[] = [
  {
    id: "1",
    title: "센서 모듈 하우징 간섭 이슈",
    href: "/changes/issues/42",
    kind: "issue",
    labels: [{ name: "긴급", color: "#ef4444" }],
    number: 42,
    status: "열림",
    ownerName: "김태현",
    projectName: "EV 모터 컨트롤러",
    updatedAt: "2시간 전",
  },
  {
    id: "2",
    title: "PCB 커넥터 핀 배열 변경",
    href: "/changes/requests/15",
    kind: "change",
    labels: [{ name: "설계변경", color: "#3b82f6" }],
    number: 15,
    status: "검토 중",
    ownerName: "이수진",
    projectName: "EV 모터 컨트롤러",
    updatedAt: "4시간 전",
  },
  {
    id: "3",
    title: "방열판 재질 전환 검토",
    href: "/changes/issues/78",
    kind: "issue",
    labels: [{ name: "검토필요", color: "#f59e0b" }],
    number: 78,
    status: "열림",
    ownerName: "박준서",
    projectName: "배터리 팩 v2",
    updatedAt: "1일 전",
  },
];

export function DashboardScreen() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentMembership = useAuthStore((state) => state.currentMembership);
  const dashboardQuery = useDashboardQuery();

  return (
    <DashboardScreenView
      myWorkItems={myWorkItems}
      quickActions={quickActions}
      stats={dashboardQuery.data}
      usageItems={[
        {
          color: "var(--brand-500)",
          icon: HardDrive,
          label: "파일 저장 용량",
          limit: 10,
          unit: "GB",
          used: 8.2,
        },
        {
          color: "var(--ai-from)",
          gradient: "linear-gradient(90deg, var(--ai-from), var(--ai-to))",
          icon: Sparkles,
          label: "AI 크레딧",
          limit: 1000,
          unit: "크레딧",
          used: 620,
        },
      ]}
      user={user ? {
        email: user.email,
        name: user.name,
        profileImageUrl: user.profileImageUrl ?? null,
      } : null}
      workspaceName={currentMembership?.organization.name ?? null}
      onMyWorkItemClick={(href) => navigate(href)}
      onOpenChanges={() => navigate("/changes")}
      onOpenParts={() => navigate("/parts")}
      onOpenTemplates={() => navigate("/parts/templates")}
      onQuickActionClick={(href) => navigate(href)}
    />
  );
}
