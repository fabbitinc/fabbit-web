import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  PartDetailScreen,
  type PartDetailScreenTab,
  type PartHeaderCardPart,
  PartHistoryTab,
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
        <Badge variant="secondary">부품 상세</Badge>
      </CardContent>
    </Card>
  );
}

function captureShell(content: ReactNode) {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-[1360px] px-8 py-10">
        <div className="rounded-[28px] border border-border/60 bg-background px-8 py-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)]">
          {content}
        </div>
      </div>
    </div>
  );
}

const samplePart = {
  category: "기구",
  childrenCount: 14,
  filesCount: 8,
  lifecycleState: "양산",
  material: "AL6061-T6",
  name: "드라이브 유닛 베이스 플레이트",
  parentsCount: 3,
  partNumber: "DRV-PLATE-0142",
  projectsCount: 4,
  revision: "C",
  suppliersCount: 2,
  unit: "EA",
} satisfies PartHeaderCardPart;

function PartDetailScreenStory({
  initialTab = "properties",
  isError = false,
  isLoading = false,
  part = samplePart,
}: {
  initialTab?: PartDetailScreenTab;
  isError?: boolean;
  isLoading?: boolean;
  part?: PartHeaderCardPart;
}) {
  const [activeTab, setActiveTab] = useState<PartDetailScreenTab>(initialTab);

  return (
    <PartDetailScreen
      activeTab={activeTab}
      attachmentsContent={panel("첨부 파일", "도면, 데이터시트, CAD 산출물을 관리합니다.")}
      bomContent={panel("BOM", "부품 간 부모/자식 관계와 수량 정보를 표시합니다.")}
      historyContent={<PartHistoryTab />}
      isError={isError}
      isLoading={isLoading}
      part={part}
      projectsContent={panel("프로젝트", "해당 부품이 연결된 프로젝트 목록을 제공합니다.")}
      propertiesContent={panel("속성", "기본 정보, 리드타임, 카테고리, 도면 프리뷰를 확인합니다.")}
      suppliersContent={panel("공급사", "공급사 코드와 단가 정보를 정리합니다.")}
      onBackClick={() => undefined}
      onRetry={() => undefined}
      onTabChange={setActiveTab}
    />
  );
}

const meta = {
  title: "Components/PartDetailScreen",
  component: PartDetailScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartDetailScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartDetailScreenStory />,
};

export const Attachments: Story = {
  render: () => <PartDetailScreenStory initialTab="attachments" />,
};

export const History: Story = {
  render: () => <PartDetailScreenStory initialTab="history" />,
};

export const HistoryCapture: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => captureShell(<PartDetailScreenStory initialTab="history" />),
};

export const ErrorState: Story = {
  render: () => <PartDetailScreenStory isError part={undefined} />,
};
