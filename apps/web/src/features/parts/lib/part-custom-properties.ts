import type { PartEditorScreenExtendedField, PartPropertiesTableRow } from "@fabbit/components";
import { formatPropertyValue, parsePropertyFieldValue, sortPropertyMeta, toPropertyInputValue } from "@/features/properties/lib/property-values";
import type { PropertyMetaModel } from "@/features/properties/types/properties-model";

export function buildPartCustomPropertyFields(
  metas: PropertyMetaModel[],
  extendedProperties: Record<string, unknown>,
): PartEditorScreenExtendedField[] {
  return sortPropertyMeta(metas)
    .filter((meta) => !meta.system && meta.active && meta.propertyKey)
    .map((meta) => ({
      id: meta.propertyKey,
      label: meta.displayName,
      helperText: meta.description ?? undefined,
      optionMode: meta.optionMode,
      options: meta.options
        .filter((option) => option.active)
        .map((option) => ({ value: option.value, label: option.label })),
      placeholder: buildPlaceholder(meta),
      required: meta.required,
      value: toPropertyInputValue(meta, extendedProperties[meta.propertyKey]),
      valueType: meta.valueType,
    }));
}

export function buildPartCustomPropertiesPayload(
  metas: PropertyMetaModel[],
  fields: PartEditorScreenExtendedField[],
) {
  const allowedMetas = sortPropertyMeta(metas).filter((meta) => !meta.system && meta.active && meta.propertyKey);
  const fieldMap = new Map(fields.map((field) => [field.id, field]));
  const extendedProperties: Record<string, unknown> = {};

  allowedMetas.forEach((meta) => {
    const field = fieldMap.get(meta.propertyKey);
    const parsed = parsePropertyFieldValue(
      field?.value ?? "",
      meta.valueType,
      meta.optionMode,
      meta.options.filter((option) => option.active).map((option) => option.value),
    );

    if (parsed !== undefined) {
      extendedProperties[meta.propertyKey] = parsed;
    }
  });

  return extendedProperties;
}

export function buildPartCustomPropertyRows(
  metas: PropertyMetaModel[],
  extendedProperties: Record<string, unknown>,
): PartPropertiesTableRow[] {
  return sortPropertyMeta(metas)
    .filter((meta) => !meta.system && meta.active && meta.propertyKey)
    .map((meta) => ({
      label: meta.displayName,
      required: meta.required,
      value: formatPropertyValue(meta, extendedProperties[meta.propertyKey]),
    }));
}

function buildPlaceholder(meta: PropertyMetaModel) {
  if (meta.valueType === "OPTION") {
    if (meta.optionMode === "CREATABLE") {
      return "옵션을 선택하거나 입력하세요";
    }

    return "옵션을 선택하세요";
  }

  if (meta.valueType === "INTEGER") {
    return "정수를 입력하세요";
  }

  if (meta.valueType === "FLOAT") {
    return "숫자를 입력하세요";
  }

  return meta.displayName;
}
