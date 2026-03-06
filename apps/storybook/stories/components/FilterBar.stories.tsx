import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SlidersHorizontal } from "lucide-react";

import { FilterBar } from "@fabbit/components";
import { Button } from "@fabbit/ui";

const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    return (
      <div className="w-[600px]">
        <FilterBar
          searchValue={search}
          searchPlaceholder="작업지시 번호, 품목명으로 검색..."
          onSearchChange={setSearch}
        />
      </div>
    );
  },
};

export const WithChips: Story = {
  render: () => {
    const [search, setSearch] = useState("");
    const [chips, setChips] = useState([
      { id: "process", label: "공정: CNC 밀링" },
      { id: "status", label: "상태: 진행중" },
      { id: "line", label: "라인: A동 2라인" },
    ]);

    return (
      <div className="w-[600px]">
        <FilterBar
          searchValue={search}
          searchPlaceholder="작업지시 번호, 품목명으로 검색..."
          chips={chips}
          onSearchChange={setSearch}
          onChipRemove={(id) => setChips((prev) => prev.filter((c) => c.id !== id))}
          onClearAll={() => setChips([])}
          actions={
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 size-4" />
              필터
            </Button>
          }
        />
      </div>
    );
  },
};
