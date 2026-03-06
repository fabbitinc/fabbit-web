import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Checkbox,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@fabbit/ui";

const meta = {
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CheckboxField: Story = {
  render: () => (
    <label className="flex min-w-[320px] items-start gap-3 rounded-lg border p-4">
      <Checkbox defaultChecked className="mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium">리뷰 완료 알림 받기</p>
        <p className="text-muted-foreground text-sm">
          도면 검토가 끝나면 이메일과 인앱 알림을 동시에 보냅니다.
        </p>
      </div>
    </label>
  ),
};

export const SwitchField: Story = {
  render: () => (
    <div className="flex min-w-[320px] items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">자동 보관</p>
        <p className="text-muted-foreground text-sm">
          30일 동안 변경이 없으면 프로젝트를 보관합니다.
        </p>
      </div>
      <Switch defaultChecked />
    </div>
  ),
};

export const SelectField: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-role">권한</Label>
      <Select defaultValue="editor">
        <SelectTrigger id="project-role">
          <SelectValue placeholder="권한을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">뷰어</SelectItem>
          <SelectItem value="editor">편집자</SelectItem>
          <SelectItem value="admin">관리자</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const InputOtpField: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="invite-code">초대 코드</Label>
      <InputOTP id="invite-code" maxLength={6} defaultValue="24A9B1">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "360px" }}>
      <label className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox defaultChecked className="mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">리뷰 완료 알림 받기</p>
          <p className="text-muted-foreground text-sm">도면 검토가 끝나면 알림을 보냅니다.</p>
        </div>
      </label>
      <label className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox className="mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">미확인 (체크 안됨)</p>
          <p className="text-muted-foreground text-sm">체크되지 않은 상태입니다.</p>
        </div>
      </label>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">자동 보관</p>
          <p className="text-muted-foreground text-sm">30일 후 프로젝트를 보관합니다.</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex flex-col gap-2">
        <Label>권한</Label>
        <Select defaultValue="editor">
          <SelectTrigger>
            <SelectValue placeholder="권한을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">뷰어</SelectItem>
            <SelectItem value="editor">편집자</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>초대 코드</Label>
        <InputOTP maxLength={6} defaultValue="24A9B1">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  ),
};
