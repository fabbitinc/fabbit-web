import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectOverviewTab, type ProjectOverviewTabProps } from "@fabbit/components";

const sampleProject = {
  description: "양산 전 BOM과 승인 흐름을 통합 정리하는 프로젝트입니다.",
  partCount: 148,
  createdAt: "2026-02-03T08:20:00Z",
  updatedAt: "2026-03-07T02:10:00Z",
  isArchived: false,
} satisfies ProjectOverviewTabProps["project"];

const meta = {
  title: "Components/ProjectOverviewTab",
  component: ProjectOverviewTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    project: sampleProject,
    onActivityClick: () => undefined,
    onPartsClick: () => undefined,
    onSettingsClick: () => undefined,
  },
} satisfies Meta<typeof ProjectOverviewTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Archived: Story = {
  args: {
    project: {
      ...sampleProject,
      description: null,
      isArchived: true,
    },
  },
};
