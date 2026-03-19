import type { PropertyMetaModel } from "@/features/properties/types/properties-model";

export type PropertyInputValue = string | boolean;

function findPropertyOptionLabel(property: PropertyMetaModel, value: string) {
  const normalizedValue = value.trim();
  return property.options.find((option) => option.value === normalizedValue)?.label ?? normalizedValue;
}

export function toPropertyInputValue(
  property: PropertyMetaModel,
  value: unknown,
): PropertyInputValue {
  if (property.valueType === "BOOLEAN") {
    return value === true;
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

export function normalizePropertyFieldValue(value: unknown, valueType: PropertyMetaModel["valueType"]): string {
  if (valueType === "BOOLEAN") {
    return value === true ? "true" : value === false ? "false" : "";
  }

  if (value == null) {
    return "";
  }

  return String(value);
}

export function toPropertyRequestValue(
  property: PropertyMetaModel,
  value: PropertyInputValue,
): unknown | undefined {
  if (property.valueType === "BOOLEAN") {
    if (value === "") {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    throw new Error(`"${property.displayName}"의 불리언 값이 올바르지 않습니다.`);
  }

  const stringValue = String(value ?? "").trim();

  if (stringValue === "") {
    return undefined;
  }

  if (property.valueType === "INTEGER") {
    const parsed = Number(stringValue);

    if (!Number.isInteger(parsed)) {
      throw new Error(`"${property.displayName}"은(는) 정수만 입력할 수 있습니다.`);
    }

    return parsed;
  }

  if (property.valueType === "FLOAT") {
    const parsed = Number(stringValue);

    if (!Number.isFinite(parsed)) {
      throw new Error(`"${property.displayName}"은(는) 숫자만 입력할 수 있습니다.`);
    }

    return parsed;
  }

  return stringValue;
}

export function parsePropertyFieldValue(
  value: string | boolean,
  valueType: PropertyMetaModel["valueType"],
  optionMode: PropertyMetaModel["optionMode"],
  allowedValues: string[],
) {
  const property = {
    displayName: "속성",
    optionMode,
    options: allowedValues.map((optionValue) => ({
      active: true,
      displayOrder: 0,
      label: optionValue,
      value: optionValue,
    })),
    propertyKey: "",
    valueType,
  } as PropertyMetaModel;

  const parsed = toPropertyRequestValue(
    property,
    valueType === "BOOLEAN" ? value : String(value ?? "").trim(),
  );

  if (valueType === "OPTION" && optionMode === "FIXED" && parsed != null) {
    const normalizedValue = String(parsed);
    if (!allowedValues.includes(normalizedValue)) {
      throw new Error("고정 옵션 속성은 정의된 옵션만 선택할 수 있습니다.");
    }
  }

  return parsed;
}

export function formatPropertyValueForDisplay(property: PropertyMetaModel, value: unknown) {
  if (value == null || value === "") {
    return "—";
  }

  if (property.valueType === "BOOLEAN") {
    return value === true ? "예" : "아니오";
  }

  if (property.valueType === "OPTION") {
    return findPropertyOptionLabel(property, String(value));
  }

  return String(value);
}

export function formatPropertyValue(property: PropertyMetaModel, value: unknown) {
  return formatPropertyValueForDisplay(property, value);
}

export function sortPropertyMeta(metas: PropertyMetaModel[]) {
  return [...metas].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }

    return left.displayName.localeCompare(right.displayName, "ko");
  });
}
