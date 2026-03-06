import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ProjectCreateDialog } from "@fabbit/components";

function ProjectCreateDialogStory() {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("Drive Unit Gen4");
  const [description, setDescription] = useState("프로젝트 목표와 관리 범위를 정의합니다.");

  return (
    <ProjectCreateDialog
      description={description}
      isPending={false}
      name={name}
      open={open}
      onDescriptionChange={setDescription}
      onNameChange={setName}
      onOpenChange={setOpen}
      onSubmit={() => undefined}
    />
  );
}

const meta = {
  title: "Components/ProjectCreateDialog",
  component: ProjectCreateDialogStory,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ProjectCreateDialogStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
