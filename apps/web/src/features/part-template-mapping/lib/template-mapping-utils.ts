import axios from "axios";

export function toExtendedPropertyName(sourceColumn: string): string {
  const hash = Array.from(sourceColumn).reduce(
    (acc, character) => ((acc * 31 + character.charCodeAt(0)) >>> 0),
    7,
  );

  const normalizedName = sourceColumn
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return `_ext_${normalizedName || `col_${hash.toString(36)}`}`;
}

export function normalizeRelationColumns(
  relColumns: Record<string, string> | undefined,
  headers: string[],
): Record<string, string> {
  if (!relColumns) {
    return {};
  }

  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(relColumns)) {
    if (headers.includes(key)) {
      normalized[key] = value;
      continue;
    }

    if (headers.includes(value)) {
      normalized[value] = key;
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

export function extractTemplateMappingError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response.data as {
    detail?: string | Array<{ msg?: string }>;
  };

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail[0]?.msg ?? fallback;
  }

  return fallback;
}

export function formatSampleCellValue(value: unknown) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}
