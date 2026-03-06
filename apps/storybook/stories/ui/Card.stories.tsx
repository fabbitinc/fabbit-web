import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from "@fabbit/ui";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명 영역입니다</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          카드 본문 영역입니다. 헤더, 본문, 푸터로 구성된 기본 카드입니다.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </CardFooter>
    </Card>
  ),
};

export const Showcase: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 헤더 + 본문 + 푸터 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">헤더 + 본문 + 푸터</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>설비 등록</CardTitle>
            <CardDescription>새 설비 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              설비명, 모델, 설치 위치 등의 정보를 등록합니다.
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">취소</Button>
            <Button>저장</Button>
          </CardFooter>
        </Card>
      </div>

      {/* 심플 카드 (푸터 없음) */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">심플 카드 (푸터 없음)</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              3월 15일 정기 점검으로 인해 시스템 사용이 제한됩니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 설명만 있는 카드 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">설명만 있는 카드</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>작업지시 요약</CardTitle>
            <CardDescription>
              이번 주 생산 계획에 포함된 작업지시 현황을 요약합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  ),
};
