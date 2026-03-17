import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationSettingsScreen } from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

const mockLogs = [
  {
    id: "log-1",
    action: "조직 설정 수정",
    actor: "김지훈",
    target: "기본 결재 정책",
    ip: "203.0.113.16",
    at: "2026-03-07 10:24",
    result: "성공",
  },
  {
    id: "log-2",
    action: "허용 IP 수정",
    actor: "박민서",
    target: "보안 정책",
    ip: "198.51.100.24",
    at: "2026-03-07 09:10",
    result: "실패",
  },
];

function buildPanel(title: string, description: string) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="outline">목 데이터</Badge>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: "Components/OrganizationSettingsScreen",
  component: OrganizationSettingsScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    activeTab: "general",
    changeTab: "labels",
    memberTab: "users",
    usageTab: "storage",
    generalContent: buildPanel("조직 기본 정보", "조직명, 산업군, 로고, 멤버십 기본 정보를 관리합니다."),
    membersUsersContent: buildPanel("조직 사용자", "사용자 초대, 권한 변경, 계정 제거를 수행합니다."),
    membersTeamsContent: buildPanel("조직 팀", "팀 생성과 팀별 멤버 구성을 관리합니다."),
    partsCategoriesContent: buildPanel("부품 카테고리", "표준 카테고리 체계와 표시 순서를 조정합니다."),
    changeGeneralContent: buildPanel("변경관리 일반", "변경관리 운영 정책과 기본 동작을 설정합니다."),
    labelsContent: buildPanel("변경관리 라벨", "변경관리/이슈 공용 라벨을 관리합니다."),
    billingContent: buildPanel("결제 관리", "카드 등록, 청구 이력, 요금제 상태를 확인합니다."),
    usageStorageContent: buildPanel("스토리지 사용량", "도면, 산출물, 업로드 파일 사용량을 확인합니다."),
    usageAiContent: buildPanel("AI 사용량", "월별 AI 크레딧 사용량과 카테고리별 분포를 확인합니다."),
    securityContent: buildPanel("보안 설정", "비밀번호 정책과 접근 제어, 허용 IP를 조정합니다."),
    logs: mockLogs,
    onActiveTabChange: () => undefined,
    onChangeTabChange: () => undefined,
    onMemberTabChange: () => undefined,
    onUsageTabChange: () => undefined,
  },
} satisfies Meta<typeof OrganizationSettingsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const General: Story = {};

export const MembersTeams: Story = {
  args: {
    activeTab: "members",
    memberTab: "teams",
  },
};

export const UsageAI: Story = {
  args: {
    activeTab: "usage",
    usageTab: "ai",
  },
};
