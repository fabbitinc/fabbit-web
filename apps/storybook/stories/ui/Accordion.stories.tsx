import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@fabbit/ui";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>CNC 가공이란?</AccordionTrigger>
        <AccordionContent>
          컴퓨터 수치 제어(CNC)를 이용하여 금속이나 플라스틱을 정밀하게 절삭 가공하는 방식입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>OEE는 어떻게 계산하나요?</AccordionTrigger>
        <AccordionContent>
          OEE = 가용률 × 성능 × 품질. 세 가지 지표를 곱하여 설비의 종합 효율을 측정합니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>예방 정비 주기는?</AccordionTrigger>
        <AccordionContent>
          설비 유형에 따라 다르지만, 일반적으로 500~1,000 가동 시간마다 점검을 권장합니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">단일 열기</p>
        <Accordion type="single" collapsible className="w-[400px]">
          <AccordionItem value="faq-1">
            <AccordionTrigger>작업지시를 수정할 수 있나요?</AccordionTrigger>
            <AccordionContent>
              진행 전 상태의 작업지시는 수정 가능합니다. 진행중인 작업지시는 보류 후 수정하세요.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger>불량 유형은 어떻게 등록하나요?</AccordionTrigger>
            <AccordionContent>
              품질 관리 &gt; 불량 유형 설정에서 새 유형을 추가할 수 있습니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger>LOT 추적은 어디서 확인하나요?</AccordionTrigger>
            <AccordionContent>
              재고 관리 &gt; LOT 추적 메뉴에서 원자재부터 완제품까지의 이력을 조회할 수 있습니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">복수 열기</p>
        <Accordion type="multiple" className="w-[400px]">
          <AccordionItem value="spec-1">
            <AccordionTrigger>재질</AccordionTrigger>
            <AccordionContent>SUS304, AL6061, S45C</AccordionContent>
          </AccordionItem>
          <AccordionItem value="spec-2">
            <AccordionTrigger>표면 처리</AccordionTrigger>
            <AccordionContent>아노다이징, 도금, 도장</AccordionContent>
          </AccordionItem>
          <AccordionItem value="spec-3">
            <AccordionTrigger>공차</AccordionTrigger>
            <AccordionContent>±0.01mm ~ ±0.05mm</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  ),
};
