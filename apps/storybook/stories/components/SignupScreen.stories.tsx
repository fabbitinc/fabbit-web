import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SignupScreen } from "@fabbit/components";

function securityWidget() {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
      Cloudflare Turnstile 영역
    </div>
  );
}

function SignupStepOneStory() {
  const [email, setEmail] = useState("builder@fabbit.ai");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <SignupScreen
        confirmPassword=""
        email={email}
        emailStatus="available"
        emailStatusMessage="사용 가능한 이메일입니다."
        loginAction={
          <button className="font-medium text-primary" type="button">
            로그인
          </button>
        }
        name=""
        password=""
        resendLabel="재발송"
        showConfirmPassword={false}
        showPassword={false}
        step={1}
        verificationCode=""
        verificationWidget={securityWidget()}
        onCompleteSignup={(event) => event.preventDefault()}
        onConfirmPasswordChange={() => undefined}
        onEditEmail={() => undefined}
        onEmailChange={setEmail}
        onNameChange={() => undefined}
        onPasswordChange={() => undefined}
        onResend={() => undefined}
        onSendVerification={(event) => event.preventDefault()}
        onToggleConfirmPasswordVisibility={() => undefined}
        onTogglePasswordVisibility={() => undefined}
        onVerificationCodeChange={() => undefined}
        onVerifyCode={(event) => event.preventDefault()}
      />
    </div>
  );
}

function SignupStepTwoStory({
  errorMessage,
  isResendDisabled = false,
  isVerifyPending = false,
  resendLabel = "42s",
}: {
  errorMessage?: string;
  isResendDisabled?: boolean;
  isVerifyPending?: boolean;
  resendLabel?: string;
}) {
  const [verificationCode, setVerificationCode] = useState("381245");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <SignupScreen
        confirmPassword=""
        email="builder@fabbit.ai"
        emailStatus="available"
        emailStatusMessage="사용 가능한 이메일입니다."
        errorMessage={errorMessage}
        isResendDisabled={isResendDisabled}
        isVerifyPending={isVerifyPending}
        loginAction={
          <button className="font-medium text-primary" type="button">
            로그인
          </button>
        }
        name=""
        password=""
        resendLabel={resendLabel}
        showConfirmPassword={false}
        showPassword={false}
        step={2}
        verificationCode={verificationCode}
        onCompleteSignup={(event) => event.preventDefault()}
        onConfirmPasswordChange={() => undefined}
        onEditEmail={() => undefined}
        onEmailChange={() => undefined}
        onNameChange={() => undefined}
        onPasswordChange={() => undefined}
        onResend={() => undefined}
        onSendVerification={(event) => event.preventDefault()}
        onToggleConfirmPasswordVisibility={() => undefined}
        onTogglePasswordVisibility={() => undefined}
        onVerificationCodeChange={setVerificationCode}
        onVerifyCode={(event) => event.preventDefault()}
      />
    </div>
  );
}

function SignupStepThreeStory({
  errorMessage,
}: {
  errorMessage?: string;
}) {
  const [name, setName] = useState("문성하");
  const [password, setPassword] = useState("qwer1234");
  const [confirmPassword, setConfirmPassword] = useState("qwer1234");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <SignupScreen
        confirmPassword={confirmPassword}
        email="builder@fabbit.ai"
        emailStatus="available"
        emailStatusMessage="사용 가능한 이메일입니다."
        errorMessage={errorMessage}
        loginAction={
          <button className="font-medium text-primary" type="button">
            로그인
          </button>
        }
        name={name}
        password={password}
        resendLabel="재발송"
        showConfirmPassword={showConfirmPassword}
        showPassword={showPassword}
        step={3}
        verificationCode="381245"
        onCompleteSignup={(event) => event.preventDefault()}
        onConfirmPasswordChange={setConfirmPassword}
        onEditEmail={() => undefined}
        onEmailChange={() => undefined}
        onNameChange={setName}
        onPasswordChange={setPassword}
        onResend={() => undefined}
        onSendVerification={(event) => event.preventDefault()}
        onToggleConfirmPasswordVisibility={() => setShowConfirmPassword((previous) => !previous)}
        onTogglePasswordVisibility={() => setShowPassword((previous) => !previous)}
        onVerificationCodeChange={() => undefined}
        onVerifyCode={(event) => event.preventDefault()}
      />
    </div>
  );
}

const meta = {
  title: "Components/SignupScreen",
  component: SignupStepOneStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SignupStepOneStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmailStep: Story = {
  render: () => <SignupStepOneStory />,
};

export const VerificationStep: Story = {
  render: () => <SignupStepTwoStory />,
};

export const VerificationPending: Story = {
  render: () => <SignupStepTwoStory isResendDisabled isVerifyPending resendLabel="58s" />,
};

export const VerificationError: Story = {
  render: () => <SignupStepTwoStory errorMessage="인증코드를 다시 확인해 주세요." />,
};

export const ProfileStep: Story = {
  render: () => <SignupStepThreeStory />,
};

export const ProfileError: Story = {
  render: () => <SignupStepThreeStory errorMessage="비밀번호가 일치하지 않습니다." />,
};
