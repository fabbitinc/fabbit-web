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

  // 상대방 노드 컬럼: "속성: 컬럼" 형태로 표시
  const nodeColsText = Object.entries(mapping.node_columns)
    .map(([prop, col]) => `${t(`mapping:property.${prop}`, prop)}: ${col}`)
    .join(", ") || "—";

  const localTarget = t(`mapping:nodeLabel.${mapping.target_label}`, mapping.target_label);
  const localRel = t(`mapping:relType.${mapping.rel_type}`, mapping.rel_type);

  const relColEntries = Object.entries(mapping.rel_columns);
  const firstSourceColumn = relColEntries[0]?.[0] || "";
  const firstRelProp = relColEntries[0]?.[1] || "";
  const hasRelColumns = relColEntries.length > 0;

  const firstType = firstRelProp ? mapping.rel_column_types[firstRelProp] : undefined;
  const localType = firstType ? t(`common:dataType.${firstType}`, firstType) : "-";

  const typePropertyDisplay = hasRelColumns
    ? `${localRel} / ${t(`mapping:property.${firstRelProp}`, firstRelProp)}`
    : localRel;
  const typePropertyOriginal = hasRelColumns
    ? `${mapping.rel_type} / ${firstRelProp}`
    : mapping.rel_type;

  const confidenceDisplay = mapping.confidence > 0 ? `${mapping.confidence}%` : "-";

  return (
    <BaseMappingCard
      sourceColumn={firstSourceColumn}
      targetLabel={hasRelColumns ? `관계 타입 / ${MAPPING_TERMS.relationProperty}` : "관계 타입"}
      targetDisplay={typePropertyDisplay}
      targetOriginal={typePropertyOriginal}
      relationRow={{
        endpointLabel: MAPPING_TERMS.relationNodeColumn,
        endpointText: nodeColsText,
        endpointTitle: nodeColsText,
        flowDisplay: `Part -> ${localRel} -> ${localTarget}`,
        flowOriginal: `Part -> ${mapping.rel_type} -> ${mapping.target_label}`,
      }}
      sampleData={sampleData}
      dataType={localType}
      dataTypeOriginal={firstType}
      confidence={confidenceDisplay}
      confidenceReason={mapping.reason}
      approved={mapping.approved}
      dismissed={mapping.dismissed}
      dismissedReason={getDismissedReasonLabel(mapping.dismissed_reason) ?? undefined}
      onApprove={() => onApprove(mapping.id)}
      onRemove={() => onDismiss(mapping.id)}
    />
  );
}
