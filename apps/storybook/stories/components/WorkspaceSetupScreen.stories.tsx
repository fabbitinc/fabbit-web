import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { WorkspaceSetupScreen } from "@fabbit/components";

const industryOptions = [
  { value: "manufacturing", label: "제조업" },
  { value: "automotive", label: "자동차" },
  { value: "electronics", label: "전자/반도체" },
  { value: "aerospace", label: "항공/우주" },
  { value: "shipbuilding", label: "조선/해양" },
  { value: "construction", label: "건설/플랜트" },
  { value: "custom", label: "직접입력" },
];

const teamSizeOptions = [
  { value: "1-10", label: "1~10명" },
  { value: "11-50", label: "11~50명" },
  { value: "51-200", label: "51~200명" },
  { value: "201+", label: "200명 이상" },
];

const roleOptions = [
  { value: "engineer", label: "설계 엔지니어" },
  { value: "manager", label: "프로젝트 관리자" },
  { value: "quality", label: "품질 관리" },
  { value: "procurement", label: "구매/조달" },
  { value: "executive", label: "경영진" },
  { value: "custom", label: "직접입력" },
];

function WorkspaceSetupScreenStory() {
  const [organizationName, setOrganizationName] = useState("Fabbit Manufacturing");
  const [slug, setSlug] = useState("fabbit-lab");
  const [industry, setIndustry] = useState("manufacturing");
  const [teamSize, setTeamSize] = useState("11-50");
  const [role, setRole] = useState("engineer");
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [isCustomRole, setIsCustomRole] = useState(false);

  const slugStatus = useMemo(() => {
    if (!slug) {
      return "idle";
    }

    if (slug === "admin") {
      return "taken";
    }

    if (slug.length < 2) {
      return "invalid";
    }

    return "available";
  }, [slug]);

  const slugStatusMessage = useMemo(() => {
    if (slugStatus === "available") {
      return "사용 가능한 주소입니다.";
    }

    if (slugStatus === "taken") {
      return "이미 사용 중인 주소입니다.";
    }

    if (slugStatus === "invalid") {
      return "2자 이상 입력해 주세요.";
    }

    return "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  }, [slugStatus]);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl">
        <WorkspaceSetupScreen
          industry={industry}
          industryOptions={industryOptions}
          isCustomIndustry={isCustomIndustry}
          isCustomRole={isCustomRole}
          isSubmitDisabled={slugStatus !== "available"}
          organizationName={organizationName}
          role={role}
          roleOptions={roleOptions}
          slug={slug}
          slugStatus={slugStatus}
          slugStatusMessage={slugStatusMessage}
          teamSize={teamSize}
          teamSizeOptions={teamSizeOptions}
          onIndustryInputChange={setIndustry}
          onIndustrySelect={(value) => {
            setIsCustomIndustry(value === "custom");
            setIndustry(value === "custom" ? "" : value);
          }}
          onOrganizationNameChange={setOrganizationName}
          onRoleInputChange={setRole}
          onRoleSelect={(value) => {
            setIsCustomRole(value === "custom");
            setRole(value === "custom" ? "" : value);
          }}
          onSlugChange={setSlug}
          onSubmit={(event) => event.preventDefault()}
          onTeamSizeChange={setTeamSize}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Components/WorkspaceSetupScreen",
  component: WorkspaceSetupScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof WorkspaceSetupScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <WorkspaceSetupScreenStory />,
};
