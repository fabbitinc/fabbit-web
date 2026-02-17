import { useTranslation } from "react-i18next";
import type { ColumnMappingEntry } from "@/features/onboarding/types/onboarding.types";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import { BaseMappingCard } from "./BaseMappingCard";

interface MappingCardProps {
  mapping: ColumnMappingEntry;
  sampleData: string[];
  onApprove: (id: string) => void;
  onRemove: (id: string) => void;
}

export function MappingCard({
  mapping,
  sampleData,
  onApprove,
  onRemove,
}: MappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);

  const localProp = t(`mapping:property.${mapping.target_property}`, mapping.target_property);
  const localType = t(`common:dataType.${mapping.data_type}`, mapping.data_type);

  return (
    <BaseMappingCard
      sourceColumn={mapping.source_column}
      targetLabel={MAPPING_TERMS.targetProperty}
      targetDisplay={localProp}
      targetOriginal={mapping.target_property}
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
