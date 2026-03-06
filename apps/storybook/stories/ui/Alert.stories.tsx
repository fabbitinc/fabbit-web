import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CheckCircle, Info, TriangleAlert } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "@fabbit/ui";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-[450px]">
      <Info className="size-4" />
      <AlertTitle>안내</AlertTitle>
      <AlertDescription>
        시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다.
      </AlertDescription>
    </Alert>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "450px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본</p>
        <Alert>
          <Info className="size-4" />
          <AlertTitle>안내</AlertTitle>
          <AlertDescription>
            시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">성공</p>
        <Alert variant="success">
          <CheckCircle className="size-4" />
          <AlertTitle>입고 완료</AlertTitle>
          <AlertDescription>
            PO-2026-0087 발주 건 전량 입고 처리되었습니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">경고</p>
        <Alert variant="warning">
          <TriangleAlert className="size-4" />
          <AlertTitle>재고 부족 경고</AlertTitle>
          <AlertDescription>
            AL-6061 원자재 재고가 안전 재고(100kg) 이하입니다. 발주를 검토하세요.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">위험</p>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>설비 이상 감지</AlertTitle>
          <AlertDescription>
            CNC-003 주축 온도가 임계값(85°C)을 초과했습니다. 즉시 점검이 필요합니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">정보</p>
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>ECN 적용 알림</AlertTitle>
          <AlertDescription>
            ECN-0023이 승인되어 BOM Rev.3이 활성화되었습니다.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
};
