import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
  Input,
  Label,
  Badge,
  Separator,
} from "@fabbit/ui";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">시트 열기</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>프로필 수정</SheetTitle>
          <SheetDescription>
            프로필 정보를 변경하세요.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">이름</Label>
            <Input className="col-span-3" placeholder="이름" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">이메일</Label>
            <Input className="col-span-3" placeholder="이메일" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">변경사항 저장</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">왼쪽 열기</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>네비게이션</SheetTitle>
          <SheetDescription>사이드 네비게이션 패널</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-4">
          {["대시보드", "작업지시", "설비 관리", "품질 관리"].map((item) => (
            <Button key={item} variant="ghost" className="justify-start">
              {item}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {/* 우측 상세 패널 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">설비 상세</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>CNC-001</SheetTitle>
            <SheetDescription>5축 CNC 밀링머신</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant="success">가동</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">라인</span>
              <span className="text-sm">A동 1라인</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">모델</span>
              <span className="text-sm">DMG MORI NHX 5000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">최근 정비</span>
              <span className="text-sm">2026-02-28</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">가동률</span>
              <span className="text-sm font-semibold">94.2%</span>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline">정비 기록</Button>
            <Button>편집</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 좌측 네비게이션 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">네비게이션</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>메뉴</SheetTitle>
            <SheetDescription>페이지를 선택하세요</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 py-4">
            {["대시보드", "작업지시", "설비 관리", "품질 관리", "재고 관리", "리포트"].map((item) => (
              <Button key={item} variant="ghost" className="justify-start">
                {item}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* 하단 패널 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">하단 패널</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>빠른 필터</SheetTitle>
            <SheetDescription>조건을 선택하세요</SheetDescription>
          </SheetHeader>
          <div className="flex gap-2 py-4">
            {["전체", "가동", "정지", "정비중", "고장"].map((f) => (
              <Badge key={f} variant="outline" className="cursor-pointer">
                {f}
              </Badge>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  ),
};
