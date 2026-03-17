import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  PartRevisionDiff,
  type PartRevisionDiffData,
  type PartRevisionDiffRevisionOption,
} from "@fabbit/components";

const revisions: PartRevisionDiffRevisionOption[] = [
  { value: "A", label: "Rev A", status: "대체됨" },
  { value: "B", label: "Rev B", status: "배포됨" },
  { value: "C", label: "Rev C", status: "검토 중" },
];

const diffs: Record<string, PartRevisionDiffData> = {
  "A→B": {
    properties: [
      { label: "재질", fromValue: "AL6061-T6", toValue: "AL7075-T6", changeType: "changed" },
      { label: "리드타임", fromValue: "14일", toValue: "7일", changeType: "changed" },
      { label: "카테고리", fromValue: "기구", toValue: "기구", changeType: "unchanged" },
      { label: "단위", fromValue: "EA", toValue: "EA", changeType: "unchanged" },
    ],
    files: [
      { fileName: "DRV-BASE-0142_RevA.dwg", changeType: "removed" },
      { fileName: "DRV-BASE-0142_RevB.dwg", changeType: "added" },
    ],
    bom: [
      { partNumber: "SH-BOLT-M8", name: "M8 볼트", changeType: "changed", field: "수량", fromValue: "4", toValue: "6" },
      { partNumber: "SH-SEAL-012", name: "오링", changeType: "added" },
    ],
  },
  "B→C": {
    properties: [
      { label: "재질", fromValue: "AL7075-T6", toValue: "SUS316L", changeType: "changed" },
      { label: "단위", fromValue: "EA", toValue: "SET", changeType: "changed" },
      { label: "리드타임", fromValue: "7일", toValue: "7일", changeType: "unchanged" },
      { label: "카테고리", fromValue: "기구", toValue: "기구", changeType: "unchanged" },
    ],
    files: [
      { fileName: "DRV-BASE-0142_RevB.dwg", changeType: "removed" },
      { fileName: "DRV-BASE-0142_RevC.step", changeType: "added" },
      { fileName: "DRV-BASE-0142_검사기준서_v1.pdf", changeType: "removed" },
      { fileName: "DRV-BASE-0142_검사기준서_v2.pdf", changeType: "added" },
    ],
    bom: [
      { partNumber: "SH-SHAFT-001", name: "샤프트", changeType: "changed", field: "수량", fromValue: "1", toValue: "2" },
      { partNumber: "SH-SEAL-012", name: "오링", changeType: "removed" },
    ],
  },
  "A→C": {
    properties: [
      { label: "재질", fromValue: "AL6061-T6", toValue: "SUS316L", changeType: "changed" },
      { label: "리드타임", fromValue: "14일", toValue: "7일", changeType: "changed" },
      { label: "단위", fromValue: "EA", toValue: "SET", changeType: "changed" },
      { label: "카테고리", fromValue: "기구", toValue: "기구", changeType: "unchanged" },
    ],
    files: [
      { fileName: "DRV-BASE-0142_RevA.dwg", changeType: "removed" },
      { fileName: "DRV-BASE-0142_RevC.step", changeType: "added" },
      { fileName: "DRV-BASE-0142_검사기준서_v1.pdf", changeType: "removed" },
      { fileName: "DRV-BASE-0142_검사기준서_v2.pdf", changeType: "added" },
    ],
    bom: [
      { partNumber: "SH-BOLT-M8", name: "M8 볼트", changeType: "changed", field: "수량", fromValue: "4", toValue: "6" },
      { partNumber: "SH-SHAFT-001", name: "샤프트", changeType: "changed", field: "수량", fromValue: "1", toValue: "2" },
    ],
  },
};

function getDiff(from: string | null, to: string | null): PartRevisionDiffData | null {
  if (!from || !to) return null;
  return diffs[`${from}→${to}`] ?? diffs[`${to}→${from}`] ?? null;
}

function PartRevisionDiffStory() {
  const [from, setFrom] = useState<string | null>("A");
  const [to, setTo] = useState<string | null>("B");

  return (
    <PartRevisionDiff
      revisions={revisions}
      diff={getDiff(from, to)}
      fromRevision={from}
      toRevision={to}
      onFromChange={setFrom}
      onToChange={setTo}
    />
  );
}

const meta = {
  title: "Components/PartRevisionDiff",
  component: PartRevisionDiffStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PartRevisionDiffStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartRevisionDiffStory />,
};

export const NoSelection: Story = {
  render: () => (
    <PartRevisionDiff
      revisions={revisions}
      diff={null}
      fromRevision={null}
      toRevision={null}
      onFromChange={() => undefined}
      onToChange={() => undefined}
    />
  ),
};
