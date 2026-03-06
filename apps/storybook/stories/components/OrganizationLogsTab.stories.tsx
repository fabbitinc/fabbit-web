import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationLogsTab } from "@fabbit/components";

const sampleLogs = [
  {
    id: "log-1",
    action: "조직 설정 수정",
    actor: "김지훈",
    target: "결재 워크플로우",
    ip: "203.0.113.16",
    at: "2026-02-17 17:41",
    result: "성공",
  },
  {
    id: "log-2",
    action: "IP 허용 목록 변경",
    actor: "박민서",
    target: "허용 IP +1",
    ip: "198.51.100.5",
    at: "2026-02-17 15:12",
    result: "성공",
  },
  {
    id: "log-3",
    action: "권한 정책 변경 시도",
    actor: "이도윤",
    target: "2단계 인증 필수",
    ip: "203.0.113.221",
    at: "2026-02-16 09:20",
    result: "실패",
  },
];

const meta = {
  title: "Components/OrganizationLogsTab",
  component: OrganizationLogsTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    logs: sampleLogs,
  },
} satisfies Meta<typeof OrganizationLogsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    logs: [],
    caption: "최근 7일 활동 로그가 없습니다.",
  },
};
