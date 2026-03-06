import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "lucide-react";

import { MultiSelectPopover, Button, Badge } from "@fabbit/ui";

/* ── Mock 데이터 ── */

const LABELS = [
  { value: "improvement", label: "개선", color: "#14b8a6" },
  { value: "supplier", label: "공급사", color: "#f97316" },
  { value: "design-change", label: "설계변경", color: "#3b82f6" },
  { value: "test", label: "시험검증", color: "#64748b" },
  { value: "priority-low", label: "우선순위:낮음", color: "#22c55e" },
  { value: "priority-high", label: "우선순위:높음", color: "#ef4444" },
  { value: "review", label: "검토중", color: "#8b5cf6" },
  { value: "production", label: "양산", color: "#06b6d4" },
  { value: "prototype", label: "시작품", color: "#eab308" },
  { value: "cost-down", label: "원가절감", color: "#ec4899" },
];

const INITIAL = ["supplier", "design-change", "priority-low"];

/* ── 공통 트리거 생성 ── */

function renderTrigger(count: number) {
  return (
    <Button variant="outline" size="sm">
      <Tag className="size-4" />
      라벨
      {count > 0 && (
        <Badge variant="secondary" className="ml-1 size-5 p-0 text-[10px]">
          {count}
        </Badge>
      )}
    </Button>
  );
}

/* ── Meta ── */

const meta = {
  component: MultiSelectPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MultiSelectPopover>;

export default meta;

type Story = StoryObj<typeof meta>;

/* ── 1. Default: 컬러 배지 + 체크박스 + 확인 버튼 ── */

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return (
      <MultiSelectPopover
        items={LABELS}
        selectedValues={selected}
        onSelectedChange={setSelected}
        title="라벨 추가"
        searchPlaceholder="라벨 검색"
        submitLabel="라벨 적용"
        design="default"
        trigger={renderTrigger(selected.length)}
      />
    );
  },
};

/* ── 2. Minimal: 컬러 텍스트 + 체크마크 + 구분선 ── */

export const Minimal: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return (
      <MultiSelectPopover
        items={LABELS}
        selectedValues={selected}
        onSelectedChange={setSelected}
        title="라벨 추가"
        searchPlaceholder="라벨 검색"
        submitLabel="라벨 적용"
        design="minimal"
        trigger={renderTrigger(selected.length)}
      />
    );
  },
};

/* ── 3. Chip: 사각 컬러 칩 + 체크박스 ── */

export const Chip: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return (
      <MultiSelectPopover
        items={LABELS}
        selectedValues={selected}
        onSelectedChange={setSelected}
        title="라벨 추가"
        searchPlaceholder="라벨 검색"
        submitLabel="라벨 적용"
        design="chip"
        trigger={renderTrigger(selected.length)}
      />
    );
  },
};

/* ── 4. Bordered: 색상 도트 + 두꺼운 테두리 + 채움 하이라이트 ── */

export const Bordered: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return (
      <MultiSelectPopover
        items={LABELS}
        selectedValues={selected}
        onSelectedChange={setSelected}
        title="라벨 추가"
        searchPlaceholder="라벨 검색"
        submitLabel="라벨 적용"
        design="bordered"
        trigger={renderTrigger(selected.length)}
      />
    );
  },
};

/* ── 5. Pill: 솔리드 둥근 배지 + 원형 체크 + 둥근 UI ── */

export const Pill: Story = {
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return (
      <MultiSelectPopover
        items={LABELS}
        selectedValues={selected}
        onSelectedChange={setSelected}
        title="라벨 추가"
        searchPlaceholder="라벨 검색"
        submitLabel="라벨 적용"
        design="pill"
        trigger={renderTrigger(selected.length)}
      />
    );
  },
};

/* ── Showcase: 5가지 디자인 한눈에 비교 ── */

export const Showcase: Story = {
  parameters: { layout: "padded" },
  render: () => {
    const [s1, setS1] = React.useState(INITIAL);
    const [s2, setS2] = React.useState(INITIAL);
    const [s3, setS3] = React.useState(INITIAL);
    const [s4, setS4] = React.useState(INITIAL);
    const [s5, setS5] = React.useState(INITIAL);

    const designs = [
      { name: "Default", desc: "컬러 배지 + 체크박스 + 확인 버튼", design: "default" as const, val: s1, set: setS1 },
      { name: "Minimal", desc: "컬러 텍스트 + 체크마크 + 구분선", design: "minimal" as const, val: s2, set: setS2 },
      { name: "Chip", desc: "사각 컬러 칩 + 테두리 배지", design: "chip" as const, val: s3, set: setS3 },
      { name: "Bordered", desc: "색상 도트 + 두꺼운 테두리 + 하이라이트", design: "bordered" as const, val: s4, set: setS4 },
      { name: "Pill", desc: "솔리드 둥근 배지 + 원형 체크", design: "pill" as const, val: s5, set: setS5 },
    ];

    return (
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-semibold">MultiSelectPopover 디자인 변형</h2>
          <p className="text-muted-foreground text-sm">
            동일한 데이터/트리거에 팝오버 내부 디자인만 다릅니다. 각 버튼을 클릭해 비교해보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => (
            <div key={d.name} className="flex flex-col gap-3 rounded-lg border p-4">
              <div>
                <span className="text-sm font-medium">{d.name}</span>
                <p className="text-muted-foreground text-xs">{d.desc}</p>
              </div>
              <MultiSelectPopover
                items={LABELS}
                selectedValues={d.val}
                onSelectedChange={d.set}
                title="라벨 추가"
                searchPlaceholder="라벨 검색"
                submitLabel="라벨 적용"
                design={d.design}
                trigger={renderTrigger(d.val.length)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};
