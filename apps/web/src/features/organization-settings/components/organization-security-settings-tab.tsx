import { useState } from "react";
import { toast } from "sonner";
import { OrganizationSecuritySettingsPanel } from "@fabbit/components";
import { useOrganizationSettingsStore } from "@/features/organization-settings/stores/organization-settings-store";

export function OrganizationSecuritySettingsTab() {
  const security = useOrganizationSettingsStore((state) => state.security);
  const setSecurity = useOrganizationSettingsStore((state) => state.setSecurity);
  const addAllowedIp = useOrganizationSettingsStore((state) => state.addAllowedIp);
  const removeAllowedIp = useOrganizationSettingsStore((state) => state.removeAllowedIp);
  const [newIp, setNewIp] = useState("");

  function handleAddAllowedIp() {
    const nextValue = newIp.trim();
    if (!nextValue) {
      return;
    }

    addAllowedIp(nextValue);
    setNewIp("");
    toast.success("허용 IP를 추가했습니다.");
  }

  return (
    <OrganizationSecuritySettingsPanel
      allowedIps={security.allowedIps}
      enforceSso={security.enforceSso}
      ipRestrictionEnabled={security.ipRestrictionEnabled}
      newIp={newIp}
      requireMfa={security.requireMfa}
      onAddAllowedIp={handleAddAllowedIp}
      onEnforceSsoChange={(checked) => setSecurity({ enforceSso: checked })}
      onIpRestrictionEnabledChange={(checked) => setSecurity({ ipRestrictionEnabled: checked })}
      onNewIpChange={setNewIp}
      onRemoveAllowedIp={removeAllowedIp}
      onRequireMfaChange={(checked) => setSecurity({ requireMfa: checked })}
    />
  );
}
