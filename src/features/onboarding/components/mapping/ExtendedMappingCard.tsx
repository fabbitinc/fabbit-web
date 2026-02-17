import { useTranslation } from "react-i18next";
import type { ColumnMappingEntry } from "@/features/onboarding/types/onboarding.types";
import { BaseMappingCard } from "./BaseMappingCard";

interface ExtendedMappingCardProps {
  mapping: ColumnMappingEntry;
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

  const localType = t(`common:dataType.${mapping.data_type}`, mapping.data_type);

  return (
    <BaseMappingCard
      sourceColumn={mapping.source_column}
      targetLabel="속성"
      targetDisplay="확장 속성"
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
