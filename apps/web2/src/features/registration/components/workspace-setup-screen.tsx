import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { WorkspaceSetupScreen as WorkspaceSetupScreenView } from "@fabbit/components";
import { industryOptions, roleOptions, teamSizeOptions } from "@/features/registration/mock-data/registration-mock";
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

export function WorkspaceSetupScreen() {
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

  const slugStatusMessage = useMemo(() => {
    if (slugStatus === "available") {
      return "사용 가능한 주소입니다.";
    }

    if (slugStatus === "checking") {
      return "주소 사용 가능 여부를 확인하고 있습니다.";
    }

    if (slugStatus === "invalid") {
      return slugValidation.message;
    }

    if (slugStatus === "taken") {
      return slugAvailabilityQuery.data?.message ?? "이미 사용 중인 주소입니다.";
    }

    return "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  }, [slugAvailabilityQuery.data?.message, slugStatus, slugValidation.message]);

  if (!scopedToken && !signupData.verificationToken) {
    return <Navigate replace to="/signup" />;
  }

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
    <WorkspaceSetupScreenView
      industry={workspaceData.industry}
      industryOptions={industryOptions}
      isCustomIndustry={isCustomIndustry}
      isCustomRole={isCustomRole}
      isSubmitDisabled={slugStatus !== "available"}
      organizationName={workspaceData.organizationName}
      role={workspaceData.role}
      roleOptions={roleOptions}
      slug={workspaceData.slug}
      slugStatus={slugStatus}
      slugStatusMessage={slugStatusMessage}
      teamSize={workspaceData.teamSize}
      teamSizeOptions={teamSizeOptions}
      onIndustryInputChange={(value) => setWorkspaceData({ industry: value })}
      onIndustrySelect={(value) => {
        setIsCustomIndustry(value === "custom");
        setWorkspaceData({ industry: value === "custom" ? "" : value });
      }}
      onOrganizationNameChange={handleOrganizationNameChange}
      onRoleInputChange={(value) => setWorkspaceData({ role: value })}
      onRoleSelect={(value) => {
        setIsCustomRole(value === "custom");
        setWorkspaceData({ role: value === "custom" ? "" : value });
      }}
      onSlugChange={handleSlugChange}
      onSubmit={handleSubmit}
      onTeamSizeChange={(value) => setWorkspaceData({ teamSize: value })}
    />
  );
}
