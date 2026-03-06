import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AcceptInviteScreen } from "@fabbit/components";

const defaultInvitation = {
  email: "new.member@fabbit.ai",
  inviterName: "문성하",
  isExistingUser: false,
  organizationName: "Fabbit Labs",
  roleLabel: "관리자",
};

function AcceptInviteScreenStory({
  isExistingUser = false,
  isSubmitting = false,
  status = "ready",
}: {
  isExistingUser?: boolean;
  isSubmitting?: boolean;
  status?: "missing-token" | "loading" | "invalid" | "ready";
}) {
  const [fullName, setFullName] = useState("이서준");
  const [password, setPassword] = useState("qwer1234");
  const [confirmPassword, setConfirmPassword] = useState("qwer1234");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl">
        <AcceptInviteScreen
          confirmPassword={confirmPassword}
          fullName={fullName}
          invitation={status === "ready" ? { ...defaultInvitation, isExistingUser } : undefined}
          isSubmitting={isSubmitting}
          password={password}
          showConfirmPassword={showConfirmPassword}
          showPassword={showPassword}
          status={status}
          onAcceptExistingUser={() => undefined}
          onConfirmPasswordChange={setConfirmPassword}
          onFullNameChange={setFullName}
          onPasswordChange={setPassword}
          onSubmit={(event) => event.preventDefault()}
          onToggleConfirmPasswordVisibility={() => setShowConfirmPassword((previous) => !previous)}
          onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Components/AcceptInviteScreen",
  component: AcceptInviteScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof AcceptInviteScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewUser: Story = {
  render: () => <AcceptInviteScreenStory />,
};

export const ExistingUser: Story = {
  render: () => <AcceptInviteScreenStory isExistingUser />,
};

export const Loading: Story = {
  render: () => <AcceptInviteScreenStory status="loading" />,
};

export const InvalidLink: Story = {
  render: () => <AcceptInviteScreenStory status="invalid" />,
};
