import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LoginScreen } from "@fabbit/components";
import { Button } from "@fabbit/ui";

function LoginScreenStory({
  errorMessage,
  initialEmail = "seongha@fabbit.ai",
  initialPassword = "qwer1234",
  isRegisterDomain = true,
  isSubmitting = false,
  withSocialLogin = true,
}: {
  errorMessage?: string;
  initialEmail?: string;
  initialPassword?: string;
  isRegisterDomain?: boolean;
  isSubmitting?: boolean;
  withSocialLogin?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <LoginScreen
      email={email}
      errorMessage={errorMessage}
      forgotPasswordAction={
        <button className="cursor-pointer text-xs text-primary" type="button">
          비밀번호 찾기
        </button>
      }
      isRegisterDomain={isRegisterDomain}
      isSubmitting={isSubmitting}
      password={password}
      showPassword={showPassword}
      signupAction={
        <button className="font-medium text-primary" type="button">
          회원가입
        </button>
      }
      socialLoginSection={
        withSocialLogin ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">또는 다음 방법으로 계속</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button className="justify-center" type="button" variant="outline">
                Google로 계속
              </Button>
              <Button className="justify-center" type="button" variant="outline">
                Microsoft로 계속
              </Button>
            </div>
          </div>
        ) : undefined
      }
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={(event) => event.preventDefault()}
      onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
    />
  );
}

const meta = {
  title: "Components/LoginScreen",
  component: LoginScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LoginScreenStory />,
};

export const EmptyForm: Story = {
  render: () => <LoginScreenStory initialEmail="" initialPassword="" withSocialLogin={false} />,
};

export const ErrorState: Story = {
  render: () => <LoginScreenStory errorMessage="이메일 또는 비밀번호를 다시 확인해 주세요." />,
};

export const WorkspaceDomain: Story = {
  render: () => <LoginScreenStory isRegisterDomain={false} />,
};

export const Submitting: Story = {
  render: () => <LoginScreenStory isSubmitting />,
};
