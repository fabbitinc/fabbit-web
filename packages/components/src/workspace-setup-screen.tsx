import type { FormEventHandler } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { OnboardingScreenShell } from "./onboarding-screen-shell";

export type WorkspaceSetupScreenSlugStatus = "idle" | "invalid" | "checking" | "available" | "taken";

export interface WorkspaceSetupScreenOption {
  value: string;
  label: string;
}

export interface WorkspaceSetupScreenProps {
  organizationName: string;
  slug: string;
  domain: string;
  industry: string;
  teamSize: string;
  role: string;
  industryOptions: WorkspaceSetupScreenOption[];
  teamSizeOptions: WorkspaceSetupScreenOption[];
  roleOptions: WorkspaceSetupScreenOption[];
  slugStatus: WorkspaceSetupScreenSlugStatus;
  slugStatusMessage: string;
  isCustomIndustry?: boolean;
  isCustomRole?: boolean;
  isSubmitDisabled?: boolean;
  onIndustryInputChange: (value: string) => void;
  onIndustrySelect: (value: string) => void;
  onOrganizationNameChange: (value: string) => void;
  onRoleInputChange: (value: string) => void;
  onRoleSelect: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onTeamSizeChange: (value: string) => void;
}

export function WorkspaceSetupScreen({
  organizationName,
  slug,
  domain,
  industry,
  teamSize,
  role,
  industryOptions,
  teamSizeOptions,
  roleOptions,
  slugStatus,
  slugStatusMessage,
  isCustomIndustry = false,
  isCustomRole = false,
  isSubmitDisabled = false,
  onIndustryInputChange,
  onIndustrySelect,
  onOrganizationNameChange,
  onRoleInputChange,
  onRoleSelect,
  onSlugChange,
  onSubmit,
  onTeamSizeChange,
}: WorkspaceSetupScreenProps) {
  return (
    <OnboardingScreenShell
      description="워크스페이스 이름과 접속 주소를 정하고, 기본 정보를 선택해 주세요."
      eyebrow="워크스페이스 설정"
      title="조직 정보를 입력합니다"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="organization-name">워크스페이스 이름</Label>
          <Input
            id="organization-name"
            className="h-12"
            placeholder="예: Fabbit Manufacturing"
            value={organizationName}
            onChange={(event) => onOrganizationNameChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace-slug">접속 주소</Label>
          <div className="flex items-center gap-2">
            <Input
              id="workspace-slug"
              className="h-12"
              placeholder="예: fabbit-lab"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
            />
            <span className="shrink-0 text-sm text-muted-foreground">.{domain}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {slugStatus === "checking" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {slugStatus === "available" ? <Check className="size-3.5 text-primary" /> : null}
            {slugStatus === "invalid" || slugStatus === "taken" ? (
              <AlertCircle className="size-3.5 text-destructive" />
            ) : null}
            <span className={slugStatus === "invalid" || slugStatus === "taken" ? "text-destructive" : undefined}>
              {slugStatusMessage}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>산업군</Label>
            <Select value={isCustomIndustry ? "custom" : industry || undefined} onValueChange={onIndustrySelect}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="산업군 선택" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCustomIndustry ? (
              <Input
                className="h-12"
                placeholder="직접 입력"
                value={industry}
                onChange={(event) => onIndustryInputChange(event.target.value)}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>팀 규모</Label>
            <Select value={teamSize || undefined} onValueChange={onTeamSizeChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="팀 규모 선택" />
              </SelectTrigger>
              <SelectContent>
                {teamSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>주요 역할</Label>
          <Select value={isCustomRole ? "custom" : role || undefined} onValueChange={onRoleSelect}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="역할 선택" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isCustomRole ? (
            <Input
              className="h-12"
              placeholder="직접 입력"
              value={role}
              onChange={(event) => onRoleInputChange(event.target.value)}
            />
          ) : null}
        </div>

        <Button className="h-12 w-full" disabled={isSubmitDisabled} type="submit">
          다음 단계로 이동
        </Button>
      </form>
    </OnboardingScreenShell>
  );
}
