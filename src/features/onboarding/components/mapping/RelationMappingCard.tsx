import { useTranslation } from "react-i18next";
import type { RelationMappingEntry } from "@/features/onboarding/types/onboarding.types";
import {
  getDismissedReasonLabel,
  MAPPING_TERMS,
} from "@/features/onboarding/constants/mappingTerminology";
import { BaseMappingCard } from "./BaseMappingCard";

interface RelationMappingCardProps {
  mapping: RelationMappingEntry;
  sampleData: string[];
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function RelationMappingCard({
  mapping,
  sampleData,
  onApprove,
  onDismiss,
}: RelationMappingCardProps) {
  const { t } = useTranslation(["common", "mapping"]);

  const fromCols = Object.values(mapping.from_columns);
  const toCols = Object.values(mapping.to_columns);
  const fromColsText = fromCols.join(", ") || "—";
  const toColsText = toCols.join(", ") || "—";

  const localFrom = t(`mapping:nodeLabel.${mapping.from_label}`, mapping.from_label);
  const localTo = t(`mapping:nodeLabel.${mapping.to_label}`, mapping.to_label);
  const localRel = t(`mapping:relType.${mapping.rel_type}`, mapping.rel_type);

  const propEntries = Object.entries(mapping.properties);
  const firstSourceColumn = propEntries[0]?.[0] || "";
  const firstRelProp = propEntries[0]?.[1] || "";
  const hasProperties = propEntries.length > 0;

  const firstType = firstRelProp ? mapping.property_types[firstRelProp] : undefined;
  const localType = firstType ? t(`common:dataType.${firstType}`, firstType) : "-";

  const typePropertyDisplay = hasProperties
    ? `${localRel} / ${t(`mapping:property.${firstRelProp}`, firstRelProp)}`
    : localRel;
  const typePropertyOriginal = hasProperties
    ? `${mapping.rel_type} / ${firstRelProp}`
    : mapping.rel_type;

  const endpointText = `${fromColsText} -> ${toColsText}`;

  return (
    <BaseMappingCard
      sourceColumn={firstSourceColumn}
      targetLabel={hasProperties ? `관계 타입 / ${MAPPING_TERMS.relationProperty}` : "관계 타입"}
      targetDisplay={typePropertyDisplay}
      targetOriginal={typePropertyOriginal}
      relationRow={{
        endpointLabel: `${MAPPING_TERMS.relationKeySource} / ${MAPPING_TERMS.relationKeyTarget}`,
        endpointText,
        endpointTitle: endpointText,
        flowDisplay: `${localFrom} -> ${localRel} -> ${localTo}`,
        flowOriginal: `${mapping.from_label} -> ${mapping.rel_type} -> ${mapping.to_label}`,
      }}
      sampleData={sampleData}
      dataType={localType}
      dataTypeOriginal={firstType}
      confidence="-"
      approved={mapping.approved}
      dismissed={mapping.dismissed}
      dismissedReason={getDismissedReasonLabel(mapping.dismissed_reason) ?? undefined}
      onApprove={() => onApprove(mapping.id)}
      onRemove={() => onDismiss(mapping.id)}
    />
  );
}
