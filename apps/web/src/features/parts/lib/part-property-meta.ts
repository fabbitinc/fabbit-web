import type {
  PartEditorScreenSystemField,
  PartEditorScreenSystemFieldKey,
} from "@fabbit/components";
import type { PartSystemPropertyKind, PropertyMetaModel } from "@/features/properties";

const DEFAULT_SYSTEM_FIELDS: PartEditorScreenSystemField[] = [
  { key: "partNumber", label: "품번", displayOrder: 10 },
  { key: "name", label: "품명", displayOrder: 20 },
  { key: "revision", label: "리비전", displayOrder: 30 },
  { key: "lifecycleState", label: "상태", displayOrder: 40 },
  { key: "category", label: "카테고리", displayOrder: 50 },
  { key: "material", label: "재질", displayOrder: 60 },
  { key: "unit", label: "단위", displayOrder: 70 },
  { key: "leadTimeDays", label: "리드타임", displayOrder: 80 },
  { key: "isPhantom", label: "팬텀", displayOrder: 90 },
  { key: "description", label: "설명", displayOrder: 100 },
];

const SYSTEM_FIELD_KIND_MAP: Record<PartSystemPropertyKind, PartEditorScreenSystemFieldKey> = {
  PART_NUMBER: "partNumber",
  NAME: "name",
  REVISION: "revision",
  MATERIAL: "material",
  UNIT: "unit",
  DESCRIPTION: "description",
  CATEGORY: "category",
  ITEM_TYPE: "isPhantom",
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

  return DEFAULT_SYSTEM_FIELDS.map((defaultField) => {
    const override = overrideMap.get(defaultField.key);

    return {
      ...defaultField,
      ...override,
      label: override?.label ?? defaultField.label,
      active: override?.active ?? true,
      displayOrder: override?.displayOrder ?? defaultField.displayOrder,
    };
  });
}
