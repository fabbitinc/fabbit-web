import type {
  PartEditorScreenSystemField,
  PartEditorScreenSystemFieldKey,
} from "@fabbit/components";
import type { PartSystemPropertyKind, PropertyMetaModel } from "@/features/properties";

// itemType과 category는 first-class 필드로, property meta와 무관하게 항상 최상단에 표시
const FIRST_CLASS_FIELDS: PartEditorScreenSystemField[] = [
  { key: "itemType", label: "아이템 유형", displayOrder: -20 },
  { key: "category", label: "카테고리", displayOrder: -10 },
];

const DEFAULT_SYSTEM_FIELDS: PartEditorScreenSystemField[] = [
  { key: "partNumber", label: "품번", displayOrder: 10 },
  { key: "name", label: "품명", displayOrder: 20 },
  { key: "revision", label: "리비전", displayOrder: 30 },
  { key: "lifecycleState", label: "상태", displayOrder: 40 },
  { key: "material", label: "재질", displayOrder: 50 },
  { key: "unit", label: "단위", displayOrder: 60 },
  { key: "leadTimeDays", label: "리드타임", displayOrder: 70 },
  { key: "description", label: "설명", displayOrder: 80 },
];

const SYSTEM_FIELD_KIND_MAP: Partial<Record<PartSystemPropertyKind, PartEditorScreenSystemFieldKey>> = {
  PART_NUMBER: "partNumber",
  NAME: "name",
  REVISION: "revision",
  MATERIAL: "material",
  UNIT: "unit",
  DESCRIPTION: "description",
  LIFECYCLE_STATE: "lifecycleState",
  LEAD_TIME_DAYS: "leadTimeDays",
};

function resolveSystemFieldKey(property: PropertyMetaModel): PartEditorScreenSystemFieldKey | null {
  const propertyKind = property.partSystemPropertyKind;
  return propertyKind ? SYSTEM_FIELD_KIND_MAP[propertyKind] ?? null : null;
}

export function buildPartSystemFields(properties: PropertyMetaModel[] | undefined): PartEditorScreenSystemField[] {
  const overrideMap = new Map<PartEditorScreenSystemFieldKey, PartEditorScreenSystemField>();

  for (const property of properties ?? []) {
    if (!property.system) {
      continue;
    }

    const fieldKey = resolveSystemFieldKey(property);

    if (!fieldKey) {
      continue;
    }

    overrideMap.set(fieldKey, {
      key: fieldKey,
      label: property.displayName,
      active: property.active,
      displayOrder: property.displayOrder,
    });
  }

  const metaFields = DEFAULT_SYSTEM_FIELDS.map((defaultField) => {
    const override = overrideMap.get(defaultField.key);

    return {
      ...defaultField,
      ...override,
      label: override?.label ?? defaultField.label,
      active: override?.active ?? true,
      displayOrder: override?.displayOrder ?? defaultField.displayOrder,
    };
  });

  // first-class 필드를 항상 최상단에 배치, 그 뒤에 property meta 기반 필드
  return [...FIRST_CLASS_FIELDS, ...metaFields];
}
