import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Package, Shield, Users } from "lucide-react";
import { SettingsShell, type SettingsNavItem } from "@fabbit/components";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

const tabs: SettingsNavItem[] = [
  { id: "profile", label: "프로필", icon: Users },
  { id: "security", label: "보안", icon: Shield },
  { id: "notifications", label: "알림", icon: Bell },
  { id: "parts", label: "부품", icon: Package },
];

const meta = {
  title: "Components/SettingsShell",
  component: SettingsShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SettingsShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-screen bg-background p-6">
      <SettingsShell
        activeTab="profile"
        description="조직 운영에 필요한 설정을 영역별로 나누어 관리합니다."
        tabs={tabs}
        title="조직 설정"
        onTabChange={() => undefined}
      >
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>일반 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="accent">활성</Badge>
              <span className="text-sm text-muted-foreground">조직 프로필과 기본 정책을 수정할 수 있습니다.</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">취소</Button>
              <Button>저장</Button>
            </div>
          </CardContent>
        </Card>
      </SettingsShell>
    </div>
  ),
};

export const Showcase: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen space-y-10 bg-background p-6">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">사용자 설정 구조</p>
        <SettingsShell
          activeTab="notifications"
          description="개인 알림, 보안, 사용 환경을 한 화면 구조로 정리합니다."
          tabs={tabs}
          title="사용자 설정"
          onTabChange={() => undefined}
        >
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>알림 규칙</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium text-foreground">변경 요청 멘션 알림</span>
                <Badge variant="success">즉시 발송</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium text-foreground">BOM 업로드 실패 알림</span>
                <Badge variant="outline">메일만</Badge>
              </div>
            </CardContent>
          </Card>
        </SettingsShell>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">프로젝트 설정 구조</p>
        <SettingsShell
          activeTab="parts"
          description="프로젝트 공통 정책, 라벨, 보안 설정을 동일한 레이아웃으로 감쌉니다."
          tabs={tabs}
          title="프로젝트 설정"
          onTabChange={() => undefined}
        >
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>부품 운영 정책</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">부품 승인 플로우와 자동 담당 규칙을 설정할 수 있습니다.</p>
              <div className="flex gap-2">
                <Button variant="outline">초기화</Button>
                <Button>정책 저장</Button>
              </div>
            </CardContent>
          </Card>
        </SettingsShell>
      </div>
    </div>
  ),
};
