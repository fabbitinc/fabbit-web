import { OrganizationNumberingCategoriesSection } from "@/features/organization-settings/components/organization-numbering-categories-section";
import { OrganizationPartsCategoriesTab } from "@/features/organization-settings/components/organization-parts-categories-tab";
import { OrganizationPartsPropertiesTab } from "@/features/organization-settings/components/organization-parts-properties-tab";

export function OrganizationPartsSettingsTab() {
  return (
    <div className="space-y-8">
      <OrganizationPartsPropertiesTab />
      <OrganizationPartsCategoriesTab />
      <OrganizationNumberingCategoriesSection />
    </div>
  );
}
