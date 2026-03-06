import type { Meta, StoryObj } from "@storybook/react-vite";

import { DescriptionList } from "@fabbit/components";
import { Badge } from "@fabbit/ui";

const meta = {
  title: "Components/DescriptionList",
  component: DescriptionList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[500px]">
      <DescriptionList
        items={[
          { label: "작업지시 번호", value: "WO-2026-0198" },
          { label: "품목", value: "AL-BRACKET-V3" },
          { label: "목표 수량", value: "500개" },
          { label: "납기일", value: "2026-03-15" },
          {
            label: "상태",
            value: <Badge variant="info">진행중</Badge>,
          },
          { label: "담당자", value: "박기계" },
        ]}
      />
    </div>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <div className="w-[700px]">
      <DescriptionList
        columns={3}
        items={[
          { label: "설비 코드", value: "CNC-003" },
          { label: "설비명", value: "5축 CNC 밀링" },
          { label: "제조사", value: "DMG MORI" },
          { label: "모델", value: "DMU 50 3rd Gen" },
          { label: "설치일", value: "2024-06-15" },
          { label: "최근 정비일", value: "2026-03-06" },
          {
            label: "가동 상태",
            value: <Badge variant="success">가동중</Badge>,
          },
          { label: "가동률", value: "94.2%" },
          { label: "누적 가동시간", value: "12,480시간" },
        ]}
      />
    </div>
  ),
};

export const SingleColumn: Story = {
  render: () => (
    <div className="w-[400px]">
      <DescriptionList
        columns={1}
        items={[
          { label: "불량 유형", value: "치수 초과 (Over-tolerance)" },
          { label: "발생 공정", value: "2차 가공 (CNC 밀링)" },
          { label: "검출 방법", value: "CMM 자동 검사" },
          { label: "불량 수량", value: "3개 / 500개 (0.6%)" },
          {
            label: "조치 사항",
            value: "공구 마모 확인 → T3 엔드밀 교체 후 재가공",
          },
        ]}
      />
    </div>
  ),
};
