import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  ProjectDetailScreen,
  type ProjectDetailScreenProject,
  type ProjectDetailScreenView,
} from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

function panel(title: string, description: string) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant="secondary">프로젝트 상세</Badge>
      </CardContent>
    </Card>
  );
}

const sampleProject = {
  createdAt: "2026-02-10T09:00:00.000Z",
  description: "모터 제어기와 연계되는 전장/기구 부품을 묶어 관리하는 프로젝트입니다.",
  id: "project-1",
  isArchived: false,
  name: "EV 모터 컨트롤러",
  partCount: 128,
  updatedAt: "2026-03-05T14:20:00.000Z",
} satisfies ProjectDetailScreenProject;

function ProjectDetailScreenStory({
  initialView = "overview",
  isError = false,
  isLoading = false,
  project = sampleProject,
}: {
  initialView?: ProjectDetailScreenView;
  isError?: boolean;
  isLoading?: boolean;
  project?: ProjectDetailScreenProject;
}) {
  const [activeView, setActiveView] = useState<ProjectDetailScreenView>(initialView);

  return (
    <ProjectDetailScreen
      activeView={activeView}
      activityContent={panel("프로젝트 활동", "멤버 추가, 부품 연결, 상태 변경 이력이 표시됩니다.")}
      isError={isError}
      isLoading={isLoading}
      partsContent={panel("연결된 부품", "프로젝트에 포함된 핵심 부품과 연결 현황을 관리합니다.")}
      project={project}
      settingsContent={panel("프로젝트 설정", "일반 정보, 멤버, 라벨, 위험 영역 설정을 제어합니다.")}
      onActiveViewChange={setActiveView}
      onBackClick={() => undefined}
      onRetry={() => undefined}
    />
  );
}

const meta = {
  title: "Components/ProjectDetailScreen",
  component: ProjectDetailScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProjectDetailScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <ProjectDetailScreenStory />,
};

export const Parts: Story = {
  render: () => <ProjectDetailScreenStory initialView="parts" />,
};

export const Settings: Story = {
  render: () => <ProjectDetailScreenStory initialView="settings" />,
};

export const ErrorState: Story = {
  render: () => <ProjectDetailScreenStory isError project={undefined} />,
};
