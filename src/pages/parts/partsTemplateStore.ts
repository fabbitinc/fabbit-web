export type TemplateScope = "master" | "part_detail";

export interface Template {
  id: string;
  name: string;
  scope: TemplateScope;
  version: number;
  fingerprint: string;
  updatedAt: string;
}

const STORAGE_KEY = "dev-parts-templates-v1";

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "tpl-master-v1",
    name: "Part Master 속성 템플릿",
    scope: "master",
    version: 1,
    fingerprint: "material|part_name|part_number|revision|unit",
    updatedAt: "2026-02-16 09:00",
  },
  {
    id: "tpl-detail-v1",
    name: "Part Detail 속성 템플릿",
    scope: "part_detail",
    version: 1,
    fingerprint: "description|part_name|part_number|quantity|unit",
    updatedAt: "2026-02-16 09:00",
  },
];

function toStorageTemplates(value: unknown): Template[] | null {
  if (!Array.isArray(value)) return null;
  const templates = value.filter(
    (item): item is Template =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as Template).id === "string" &&
      typeof (item as Template).name === "string" &&
      ((item as Template).scope === "master" || (item as Template).scope === "part_detail") &&
      typeof (item as Template).version === "number" &&
      typeof (item as Template).fingerprint === "string" &&
      typeof (item as Template).updatedAt === "string"
  );

  return templates.length > 0 ? templates : null;
}

export function normalizeColumns(columns: string[]) {
  return columns
    .map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .sort();
}

export function buildFingerprint(columns: string[]) {
  return normalizeColumns(columns).join("|");
}

export function getTemplates() {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw);
    return toStorageTemplates(parsed) ?? DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

function setTemplates(templates: Template[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getLatestTemplate(scope: TemplateScope) {
  const templates = getTemplates().filter((item) => item.scope === scope);
  return templates.sort((a, b) => b.version - a.version)[0];
}

export function createTemplateVersion(scope: TemplateScope, columns: string[]) {
  const templates = getTemplates();
  const currentScope = templates
    .filter((item) => item.scope === scope)
    .sort((a, b) => b.version - a.version);
  const nextVersion = (currentScope[0]?.version ?? 0) + 1;

  const template: Template = {
    id: `tpl-${scope}-v${nextVersion}`,
    name: scope === "master" ? `Part Master 속성 템플릿 v${nextVersion}` : `Part Detail 속성 템플릿 v${nextVersion}`,
    scope,
    version: nextVersion,
    fingerprint: buildFingerprint(columns),
    updatedAt: new Date().toLocaleString("ko-KR"),
  };

  const nextTemplates = [template, ...templates.filter((item) => item.scope !== scope)];
  setTemplates(nextTemplates);

  return template;
}
