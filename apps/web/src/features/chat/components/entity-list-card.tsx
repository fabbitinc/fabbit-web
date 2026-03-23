import { Badge } from "@fabbit/ui";
import type { EntityListBlock } from "../types/chat-artifact";

interface EntityListCardProps {
  artifact: EntityListBlock;
}

const ENTITY_LABELS: Record<string, string> = {
  part: "부품",
  PART: "부품",
  issue: "이슈",
  ISSUE: "이슈",
};

// 내부 UUID 필드 — 렌더링에서 제외
const HIDDEN_FIELDS = new Set([
  "id",
  "partId",
  "part_id",
  "issueId",
  "issue_id",
  "revisionId",
  "revision_id",
  "projectId",
  "project_id",
  "organizationId",
  "organization_id",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
]);

// 표시 우선순위 필드
const DISPLAY_FIELDS: Record<string, string[]> = {
  part: ["number", "partNumber", "part_number", "name", "description", "revision", "status"],
  PART: ["number", "partNumber", "part_number", "name", "description", "revision", "status"],
  issue: ["issueNumber", "issue_number", "number", "title", "status", "priority"],
  ISSUE: ["issueNumber", "issue_number", "number", "title", "status", "priority"],
};

const FIELD_LABELS: Record<string, string> = {
  number: "품번",
  partNumber: "품번",
  part_number: "품번",
  name: "이름",
  description: "설명",
  revision: "리비전",
  status: "상태",
  title: "제목",
  issueNumber: "이슈 번호",
  issue_number: "이슈 번호",
  priority: "우선순위",
  bodySummary: "요약",
  body_summary: "요약",
};

export function EntityListCard({ artifact }: EntityListCardProps) {
  const { entityType, items } = artifact;
  const label = ENTITY_LABELS[entityType] ?? entityType;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        {label} 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label} 목록
        </span>
        <Badge variant="secondary" className="ml-2 text-xs">
          {items.length}건
        </Badge>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item, index) => (
          <EntityListItem
            key={item.id ?? index}
            item={item}
            entityType={entityType}
          />
        ))}
      </ul>
    </div>
  );
}

function EntityListItem({
  item,
  entityType,
}: {
  item: Record<string, unknown>;
  entityType: string;
}) {
  const fields = extractDisplayFields(item, entityType);
  const primaryLabel = getPrimaryLabel(item, entityType);
  const statusValue = typeof item.status === "string" ? item.status : null;

  return (
    <li className="px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
      {/* 1줄 요약: 주요 라벨 + 상태 뱃지 */}
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{primaryLabel}</span>
        {statusValue && (
          <Badge variant="outline" className="ml-2 shrink-0 text-xs">
            {statusValue}
          </Badge>
        )}
      </div>
      {/* 추가 필드 */}
      {fields.length > 0 && (
        <div className="mt-0.5 space-y-0 text-xs text-muted-foreground">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <span className="text-muted-foreground/70">{label}:</span>{" "}
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

// 주요 라벨 추출 (1줄 요약)
function getPrimaryLabel(
  item: Record<string, unknown>,
  entityType: string,
): string {
  const et = entityType.toUpperCase();

  if (et === "PART") {
    const number = item.number ?? item.partNumber ?? item.part_number;
    const name = item.name;
    if (number && name) return `${number} · ${name}`;
    if (number) return String(number);
    if (name) return String(name);
  }

  if (et === "ISSUE") {
    const number = item.issueNumber ?? item.issue_number ?? item.number;
    const title = item.title;
    if (number && title) return `${number} ${title}`;
    if (title) return String(title);
    if (number) return String(number);
  }

  // 범용 fallback
  return String(
    item.title ?? item.name ?? item.number ?? item.label ?? item.id ?? "",
  );
}

// 표시용 필드 추출 (주요 라벨과 상태는 제외)
function extractDisplayFields(
  item: Record<string, unknown>,
  entityType: string,
): Array<{ label: string; value: string }> {
  const priority = DISPLAY_FIELDS[entityType] ?? [];
  const primaryKeys = getPrimaryKeys(entityType);
  const result: Array<{ label: string; value: string }> = [];

  // 우선순위 필드 먼저
  for (const key of priority) {
    if (primaryKeys.has(key)) continue;
    if (key === "status") continue; // 뱃지로 표시
    if (HIDDEN_FIELDS.has(key)) continue;

    const value = item[key];
    if (value === null || value === undefined || value === "") continue;

    result.push({
      label: FIELD_LABELS[key] ?? key,
      value: String(value),
    });
  }

  // 나머지 필드 (priority에 없는 것)
  for (const [key, value] of Object.entries(item)) {
    if (HIDDEN_FIELDS.has(key)) continue;
    if (primaryKeys.has(key)) continue;
    if (key === "status") continue;
    if (priority.includes(key)) continue;
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") continue;

    result.push({
      label: FIELD_LABELS[key] ?? key,
      value: String(value),
    });
  }

  return result;
}

function getPrimaryKeys(entityType: string): Set<string> {
  const et = entityType.toUpperCase();
  if (et === "PART") return new Set(["number", "partNumber", "part_number", "name"]);
  if (et === "ISSUE") return new Set(["issueNumber", "issue_number", "number", "title"]);
  return new Set(["name", "title", "number", "label"]);
}
