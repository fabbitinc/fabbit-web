import { useTranslation } from "react-i18next";
import type { ExtendedPropertyEntry } from "@/features/onboarding/types/onboarding.types";
import { BaseMappingCard } from "./BaseMappingCard";

interface ExtendedMappingCardProps {
  mapping: ExtendedPropertyEntry;
  sampleData: string[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ExtendedMappingCard({
  mapping,
  sampleData,
  onApprove,
  onRemove,
}: ExtendedMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);

  const localLabel = t(`mapping:nodeLabel.${mapping.target_label}`, mapping.target_label);
  const localProp = t(`mapping:property.${mapping.property_name}`, mapping.property_name);
  const localType = t(`common:dataType.${mapping.data_type}`, mapping.data_type);

  return (
    <BaseMappingCard
      sourceColumn={mapping.source_column}
      targetLabel="라벨 / 속성"
      targetDisplay={`${localLabel} / ${localProp}`}
      targetOriginal={`${mapping.target_label} / ${mapping.property_name}`}
      sampleData={sampleData}
      dataType={localType}
      dataTypeOriginal={mapping.data_type}
      confidence={`${mapping.confidence}%`}
      confidenceReason={mapping.reason}
      approved={mapping.approved}
      onApprove={() => onApprove(mapping.id)}
      onRemove={() => onRemove(mapping.id)}
    />
  );
}
