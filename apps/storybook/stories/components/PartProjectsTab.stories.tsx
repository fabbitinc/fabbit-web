import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartProjectsTab } from "@fabbit/components";

const sampleProjects = [
  {
    id: "project-1",
    name: "EV 모터 컨트롤러",
    description: "모터 제어기 구조물과 전장 부품을 함께 관리하는 프로젝트입니다.",
  },
  {
    id: "project-2",
    name: "스마트 인버터 플랫폼",
    description: "도면 표준화와 BOM 정합성 점검을 병행하는 선행 개발 프로젝트입니다.",
  },
];

const meta = {
  title: "Components/PartProjectsTab",
  component: PartProjectsTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    projects: sampleProjects,
    isLoading: false,
    onProjectClick: (_projectId) => undefined,
  },
} satisfies Meta<typeof PartProjectsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    projects: [],
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartProjectsTab {...args} />
      <PartProjectsTab {...args} projects={[]} isLoading={true} />
    </div>
  ),
};
