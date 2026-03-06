import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  industryOptions,
  roleOptions,
  teamSizeOptions,
} from "@/features/registration/mock-data/registration-mock";
import { useSlugAvailabilityQuery } from "@/features/registration/hooks/use-slug-availability-query";
import { useRegistrationStore } from "@/features/registration/stores/registration-store";

const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "app",
  "admin",
  "auth",
  "login",
  "signup",
  "register",
  "billing",
  "help",
  "docs",
  "status",
  "localhost",
  "dev",
  "test",
  "qa",
  "prod",
  "fabbit",
  "root",
];

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validateSubdomain(slug: string) {
  if (!slug) {
    return { valid: false, message: "주소를 입력해 주세요." };
  }

  if (slug.length < 2) {
    return { valid: false, message: "2자 이상 입력해 주세요." };
  }

  if (slug.length > 63) {
    return { valid: false, message: "63자 이하로 입력해 주세요." };
  }

  if (/^-|-$/.test(slug) || /--/.test(slug)) {
    return { valid: false, message: "하이픈(-) 규칙을 확인해 주세요." };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, message: "영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }

  if (/^\d+$/.test(slug)) {
    return { valid: false, message: "숫자로만 구성할 수 없습니다." };
  }

  if (RESERVED_SUBDOMAINS.includes(slug)) {
    return { valid: false, message: "예약된 주소입니다." };
  }

  return { valid: true, message: "" };
}

export function WorkspaceSetupPage() {
  const navigate = useNavigate();
  const signupData = useRegistrationStore((state) => state.signupData);
  const scopedToken = useRegistrationStore((state) => state.scopedToken);
  const workspaceData = useRegistrationStore((state) => state.workspaceData);
  const setWorkspaceData = useRegistrationStore((state) => state.setWorkspaceData);
  const [debouncedSlug, setDebouncedSlug] = useState(workspaceData.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(workspaceData.slug));
  const [isCustomIndustry, setIsCustomIndustry] = useState(workspaceData.industry === "custom");
  const [isCustomRole, setIsCustomRole] = useState(workspaceData.role === "custom");

  const slugValidation = validateSubdomain(workspaceData.slug);
  const slugAvailabilityQuery = useSlugAvailabilityQuery(
    debouncedSlug,
    slugValidation.valid && Boolean(debouncedSlug),
  );

  useEffect(() => {
    if (!scopedToken && !signupData.verificationToken) {
      navigate("/signup", { replace: true });
    }
  }, [navigate, scopedToken, signupData.verificationToken]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSlug(workspaceData.slug);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [workspaceData.slug]);

  const slugStatus = useMemo(() => {
    if (!workspaceData.slug) {
      return "idle";
    }

    if (!slugValidation.valid) {
      return "invalid";
    }

    if (slugAvailabilityQuery.isFetching) {
      return "checking";
    }

    if (slugAvailabilityQuery.data?.available) {
      return "available";
    }

    if (slugAvailabilityQuery.data && !slugAvailabilityQuery.data.available) {
      return "taken";
    }

    return "idle";
  }, [slugAvailabilityQuery.data, slugAvailabilityQuery.isFetching, slugValidation.valid, workspaceData.slug]);

  const handleOrganizationNameChange = (value: string) => {
    setWorkspaceData({ organizationName: value });

    if (!slugTouched) {
      setWorkspaceData({ slug: toSlug(value) });
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setWorkspaceData({
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!workspaceData.organizationName.trim() || slugStatus !== "available") {
      return;
    }

    navigate("/plan");
  };

  return (
    <section className="app-panel rounded-[32px] p-6 sm:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">워크스페이스 설정</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">조직 정보를 입력합니다</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          워크스페이스 이름과 접속 주소를 정하고, 기본 정보를 선택해 주세요.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="organization-name">워크스페이스 이름</Label>
          <Input
            id="organization-name"
            className="h-12"
            placeholder="예: Fabbit Manufacturing"
            value={workspaceData.organizationName}
            onChange={(event) => handleOrganizationNameChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace-slug">접속 주소</Label>
          <Input
            id="workspace-slug"
            className="h-12"
            placeholder="예: fabbit-lab"
            value={workspaceData.slug}
            onChange={(event) => handleSlugChange(event.target.value)}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {slugStatus === "checking" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {slugStatus === "available" ? <Check className="size-3.5 text-primary" /> : null}
            {slugStatus === "invalid" || slugStatus === "taken" ? (
              <AlertCircle className="size-3.5 text-destructive" />
            ) : null}
            <span>
              {slugStatus === "available" && "사용 가능한 주소입니다."}
              {slugStatus === "checking" && "주소 사용 가능 여부를 확인하고 있습니다."}
              {slugStatus === "invalid" && slugValidation.message}
              {slugStatus === "taken" &&
                (slugAvailabilityQuery.data?.message ?? "이미 사용 중인 주소입니다.")}
              {slugStatus === "idle" && "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다."}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>산업군</Label>
            <Select
              value={isCustomIndustry ? "custom" : workspaceData.industry || undefined}
              onValueChange={(value) => {
                setIsCustomIndustry(value === "custom");
                setWorkspaceData({ industry: value === "custom" ? "" : value });
              }}
            >
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
                value={workspaceData.industry}
                onChange={(event) => setWorkspaceData({ industry: event.target.value })}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>팀 규모</Label>
            <Select
              value={workspaceData.teamSize || undefined}
              onValueChange={(value) => setWorkspaceData({ teamSize: value })}
            >
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
          <Select
            value={isCustomRole ? "custom" : workspaceData.role || undefined}
            onValueChange={(value) => {
              setIsCustomRole(value === "custom");
              setWorkspaceData({ role: value === "custom" ? "" : value });
            }}
          >
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
              value={workspaceData.role}
              onChange={(event) => setWorkspaceData({ role: event.target.value })}
            />
          ) : null}
        </div>

        <Button className="h-12 w-full" disabled={slugStatus !== "available"} type="submit">
          다음 단계로 이동
        </Button>
      </form>
    </section>
  );
}
