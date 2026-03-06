import type { Meta, StoryObj } from "@storybook/react-vite";
import { Boxes, FolderKanban, GitPullRequestArrow, HardDrive, Sparkles } from "lucide-react";
import {
  DashboardScreen,
  type DashboardScreenProps,
  type DashboardScreenQuickAction,
  type DashboardScreenUsageItem,
  type DashboardScreenWorkItem,
} from "@fabbit/components";

const quickActions = [
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
] satisfies DashboardScreenQuickAction[];

const myWorkItems = [
  {
    id: "issue-42",
    title: "센서 모듈 하우징 간섭 이슈",
    href: "/changes/issues/42",
    kind: "issue",
    labels: [{ color: "#ef4444", name: "긴급" }],
    number: 42,
    ownerName: "김태현",
    projectName: "EV 모터 컨트롤러",
    status: "열림",
    updatedAt: "2시간 전",
  },
  {
    id: "request-15",
    title: "PCB 커넥터 핀 배열 변경",
    href: "/changes/requests/15",
    kind: "change",
    labels: [{ color: "#3b82f6", name: "설계변경" }],
    number: 15,
    ownerName: "이수진",
    projectName: "EV 모터 컨트롤러",
    status: "검토 중",
    updatedAt: "4시간 전",
  },
] satisfies DashboardScreenWorkItem[];

const usageItems = [
  {
    color: "var(--ai-from)",
    gradient: "linear-gradient(90deg, var(--ai-from), var(--ai-to))",
    label: "AI 크레딧",
    icon: Sparkles,
    limit: 1000,
    unit: "크레딧",
    used: 420,
  },
  {
    color: "var(--brand-500)",
    label: "파일 저장 용량",
    icon: HardDrive,
    limit: 10,
    unit: "GB",
    used: 8.2,
  },
] satisfies DashboardScreenUsageItem[];

const baseArgs = {
  myWorkItems,
  quickActions,
  stats: {
    bomLinks: { total: 320 },
    lastSynthesis: {
      completedAt: "2026-03-06T08:20:00.000Z",
      jobId: "JOB-20260306-0812",
      nodesCreated: 142,
      relationshipsCreated: 388,
      status: "completed",
    },
    parts: {
      addedThisWeek: 12,
      total: 128,
    },
  },
  usageItems,
  user: {
    email: "moon@fabbit.ai",
    name: "문성하",
    profileImageUrl: null,
  },
  workspaceName: "EV Powertrain",
  onMyWorkItemClick: () => undefined,
  onOpenChanges: () => undefined,
  onOpenParts: () => undefined,
  onOpenTemplates: () => undefined,
  onQuickActionClick: () => undefined,
} satisfies DashboardScreenProps;

const meta = {
  title: "Components/DashboardScreen",
  component: DashboardScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: baseArgs,
} satisfies Meta<typeof DashboardScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutUsage: Story = {
  args: {
    usageItems: [],
  },
};
