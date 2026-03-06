import type { Meta, StoryObj } from "@storybook/react-vite";
import { FolderKanban, FileX, Search } from "lucide-react";

import { EmptyState } from "@fabbit/components";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: FolderKanban,
    title: "프로젝트가 아직 없습니다",
    description:
      "첫 프로젝트를 만들어 부품과 변경 흐름을 묶어 관리하세요.",
    actionLabel: "프로젝트 생성",
    onAction: () => {},
  },
};

export const SearchEmpty: Story = {
  args: {
    icon: Search,
    title: "검색 결과가 없습니다",
    description:
      "검색어를 조정하거나 필터를 변경해 보세요.",
  },
};

export const NoDocument: Story = {
  args: {
    icon: FileX,
    title: "등록된 도면이 없습니다",
    description:
      "CAD 파일을 업로드하면 자동으로 BOM이 생성됩니다.",
    actionLabel: "도면 업로드",
    onAction: () => {},
  },
};
