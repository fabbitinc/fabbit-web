import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserSettingsScreen } from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

function panel(title: string, description: string) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="outline">사용자 환경</Badge>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: "Components/UserSettingsScreen",
  component: UserSettingsScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    activeTab: "profile",
    profileContent: panel("프로필", "이름, 연락처, 프로필 이미지를 수정합니다."),
    securityContent: panel("보안", "비밀번호 변경과 보안 정책을 관리합니다."),
    notificationsContent: panel("알림", "메일/앱 알림 채널을 조정합니다."),
    preferencesContent: panel("개인화", "언어, 기본 뷰, 선호 설정을 관리합니다."),
    onTabChange: () => undefined,
  },
} satisfies Meta<typeof UserSettingsScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Profile: Story = {};

export const Notifications: Story = {
  args: {
    activeTab: "notifications",
  },
};
