import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@fabbit/ui";

const meta = {
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div style={{ width: "420px" }}>
      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="timeline">타임라인</TabsTrigger>
            <TabsTrigger value="members">멤버</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">프로젝트 개요</p>
              <p className="text-muted-foreground text-sm">최신 변경관리, 분석 상태, 검토 현황을 한 화면에서 확인합니다.</p>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="pt-4">
            <ScrollArea className="h-32 rounded-xl border">
              <div className="space-y-3 p-4">
                {["도면 업로드", "속성 매핑 검토", "BOM 비교 완료"].map((item, i) => (
                  <div key={item} className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item}</span>
                      <span className="text-muted-foreground">{i + 1}단계</span>
                    </div>
                    {i < 2 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="members" className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>디자인 팀</span>
                <span className="text-muted-foreground">4명</span>
              </div>
              <div className="flex items-center justify-between">
                <span>품질 팀</span>
                <span className="text-muted-foreground">2명</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  ),
};

export const ProjectWorkspace: Story = {
  render: () => (
    <div className="w-[420px] rounded-2xl border bg-background p-4 shadow-sm">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
          <TabsTrigger value="members">멤버</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">프로젝트 개요</p>
            <p className="text-muted-foreground text-sm">
              최신 변경관리, 분석 상태, 검토 현황을 한 화면에서 빠르게 확인합니다.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="timeline" className="pt-4">
          <ScrollArea className="h-44 rounded-xl border">
            <div className="space-y-4 p-4">
              {[
                "도면 업로드",
                "속성 매핑 검토",
                "BOM 비교 완료",
                "변경관리 발행",
                "최종 승인",
              ].map((item, index) => (
                <div key={item} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item}</span>
                    <span className="text-muted-foreground">{index + 1}단계</span>
                  </div>
                  {index < 4 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="members" className="pt-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>디자인 팀</span>
              <span className="text-muted-foreground">4명</span>
            </div>
            <div className="flex items-center justify-between">
              <span>품질 팀</span>
              <span className="text-muted-foreground">2명</span>
            </div>
            <div className="flex items-center justify-between">
              <span>외부 협력사</span>
              <span className="text-muted-foreground">1명</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  ),
};
