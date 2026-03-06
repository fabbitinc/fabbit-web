import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  BomExploreScreen,
  type BomExploreDirection,
  type BomExploreDisplayNode,
  type BomExploreView,
} from "@fabbit/components";

const sampleTree = {
  category: "구동계",
  children: [
    {
      category: "기구",
      children: [
        {
          category: "기구",
          children: [],
          lifecycleState: "양산",
          material: "AL6061-T6",
          name: "브래킷",
          nodeKey: "root.0.0",
          partId: "part-3",
          partNumber: "DRV-BRACKET-001",
          quantity: 2,
          revision: "B",
          unit: "EA",
        },
      ],
      lifecycleState: "양산",
      material: "ADC12",
      name: "하우징",
      nodeKey: "root.0",
      partId: "part-2",
      partNumber: "DRV-HOUSING-001",
      quantity: 1,
      revision: "C",
      unit: "EA",
    },
    {
      category: "전장",
      children: [],
      lifecycleState: "개발",
      material: "FR-4",
      name: "제어 PCB",
      nodeKey: "root.1",
      partId: "part-4",
      partNumber: "DRV-PCB-002",
      quantity: 1,
      revision: "F",
      unit: "EA",
    },
  ],
  lifecycleState: "양산",
  material: "ASSY",
  name: "드라이브 유닛",
  nodeKey: "root",
  partId: "part-1",
  partNumber: "DRV-ASSY-001",
  quantity: 1,
  revision: "D",
  unit: "EA",
} satisfies BomExploreDisplayNode;

function BomExploreScreenStory() {
  const [direction, setDirection] = useState<BomExploreDirection>("forward");
  const [viewType, setViewType] = useState<BomExploreView>("multi-level");
  const [searchQuery, setSearchQuery] = useState("");
  const [singleLevelRootKey, setSingleLevelRootKey] = useState("root");

  return (
    <BomExploreScreen
      direction={direction}
      isError={false}
      isExporting={false}
      isLoading={false}
      partId="part-1"
      searchQuery={searchQuery}
      singleLevelRootKey={singleLevelRootKey}
      totalCount={4}
      tree={sampleTree}
      viewType={viewType}
      onDirectionChange={setDirection}
      onExport={() => undefined}
      onNavigateBom={() => undefined}
      onNavigateDetail={() => undefined}
      onSearchChange={setSearchQuery}
      onSingleLevelRootKeyChange={setSingleLevelRootKey}
      onViewTypeChange={setViewType}
    />
  );
}

const meta = {
  title: "Components/BomExploreScreen",
  component: BomExploreScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BomExploreScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <BomExploreScreenStory />,
};
