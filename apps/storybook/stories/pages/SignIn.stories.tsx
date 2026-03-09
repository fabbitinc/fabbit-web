import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LoginScreen } from "@fabbit/components";
import { Button } from "@fabbit/ui";

function SignInPageStory({
  errorMessage,
  isRegisterDomain = true,
  isSubmitting = false,
}: {
  errorMessage?: string;
  isRegisterDomain?: boolean;
  isSubmitting?: boolean;
}) {
  const [email, setEmail] = useState("seongha@fabbit.ai");
  const [password, setPassword] = useState("qwer1234");
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
      }
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={(event) => event.preventDefault()}
      onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
    />
  );
}

const meta = {
  title: "Pages/SignIn",
  component: SignInPageStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SignInPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SignInPageStory />,
};

export const ErrorState: Story = {
  render: () => <SignInPageStory errorMessage="이메일 또는 비밀번호를 다시 확인해 주세요." />,
};

export const WorkspaceDomain: Story = {
  render: () => <SignInPageStory isRegisterDomain={false} />,
};
