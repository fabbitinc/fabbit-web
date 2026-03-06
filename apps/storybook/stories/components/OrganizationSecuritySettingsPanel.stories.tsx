import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OrganizationSecuritySettingsPanel, type OrganizationSecurityAllowedIp } from "@fabbit/components";

function OrganizationSecuritySettingsPanelStory() {
  const [enforceSso, setEnforceSso] = useState(false);
  const [requireMfa, setRequireMfa] = useState(true);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(true);
  const [newIp, setNewIp] = useState("");
  const [allowedIps, setAllowedIps] = useState<OrganizationSecurityAllowedIp[]>([
    { id: "ip-1", cidr: "203.0.113.0/24" },
    { id: "ip-2", cidr: "198.51.100.10/32" },
  ]);

  return (
    <OrganizationSecuritySettingsPanel
      allowedIps={allowedIps}
      enforceSso={enforceSso}
      ipRestrictionEnabled={ipRestrictionEnabled}
      newIp={newIp}
      requireMfa={requireMfa}
      onAddAllowedIp={() => {
        if (!newIp.trim()) {
          return;
        }

        setAllowedIps((current) => [...current, { id: `ip-${current.length + 1}`, cidr: newIp.trim() }]);
        setNewIp("");
      }}
      onEnforceSsoChange={setEnforceSso}
      onIpRestrictionEnabledChange={setIpRestrictionEnabled}
      onNewIpChange={setNewIp}
      onRemoveAllowedIp={(id) => setAllowedIps((current) => current.filter((entry) => entry.id !== id))}
      onRequireMfaChange={setRequireMfa}
    />
  );
}

const meta = {
  title: "Components/OrganizationSecuritySettingsPanel",
  component: OrganizationSecuritySettingsPanelStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof OrganizationSecuritySettingsPanelStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
