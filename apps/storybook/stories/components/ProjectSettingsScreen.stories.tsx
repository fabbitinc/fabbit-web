import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectSettingsScreen } from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

function panel(title: string, description: string) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="secondary">프로젝트 설정</Badge>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: "Components/ProjectSettingsScreen",
  component: ProjectSettingsScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    activeTab: "general",
    generalContent: panel("프로젝트 일반 정보", "프로젝트명, 설명, 상태를 수정합니다."),
    membersContent: panel("프로젝트 멤버", "참여자와 권한을 관리합니다."),
    labelsContent: panel("프로젝트 라벨", "공용 라벨 정책과 연결된 안내를 표시합니다."),
    dangerContent: panel("위험 영역", "보관, 복구, 삭제와 같은 파괴적 작업을 처리합니다."),
    onTabChange: () => undefined,
  },
} satisfies Meta<typeof ProjectSettingsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const General: Story = {};

export const Danger: Story = {
  args: {
    activeTab: "danger",
  },
};
