import { ArrowRight, Equal } from "lucide-react";
import {
  Badge,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";

// ── 타입 ──────────────────────────────────────────────────

export type PartRevisionDiffChangeType = "added" | "removed" | "changed" | "unchanged";

export interface PartRevisionDiffFieldChange {
  label: string;
  fromValue: string | null;
  toValue: string | null;
  changeType: PartRevisionDiffChangeType;
}

export interface PartRevisionDiffFileChange {
  fileName: string;
  changeType: "added" | "removed";
}

export interface PartRevisionDiffBomChange {
  partNumber: string;
  name?: string;
  changeType: "added" | "removed" | "changed";
  field?: string;
  fromValue?: string;
  toValue?: string;
}

export interface PartRevisionDiffData {
  properties: PartRevisionDiffFieldChange[];
  files: PartRevisionDiffFileChange[];
  bom: PartRevisionDiffBomChange[];
}

export interface PartRevisionDiffRevisionOption {
  value: string;
  label: string;
  status?: string;
}

export interface PartRevisionDiffProps {
  revisions: PartRevisionDiffRevisionOption[];
  diff: PartRevisionDiffData | null;
  fromRevision: string | null;
  toRevision: string | null;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

// ── 내부 컴포넌트 ────────────────────────────────────────

function ChangeTypeBadge({ type }: { type: PartRevisionDiffChangeType | PartRevisionDiffFileChange["changeType"] | PartRevisionDiffBomChange["changeType"] }) {
  if (type === "added") {
    return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">추가</Badge>;
  }
  if (type === "removed") {
    return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">삭제</Badge>;
  }
  if (type === "changed") {
    return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">변경</Badge>;
  }
  return null;
}

function DiffValue({ value, type }: { value: string | null; type: "from" | "to" }) {
  if (value == null) return <span className="text-muted-foreground/40">—</span>;
  return (
    <span className={cn(
      "rounded bg-muted px-1.5 py-0.5 font-mono text-xs",
      type === "from" && "text-red-700 dark:text-red-300",
      type === "to" && "text-emerald-700 dark:text-emerald-300",
    )}>
      {value}
    </span>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function PropertyDiffTable({ changes }: { changes: PartRevisionDiffFieldChange[] }) {
  const meaningful = changes.filter((c) => c.changeType !== "unchanged");
  if (meaningful.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">변경된 속성이 없습니다.</p>;
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">속성</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">이전</th>
            <th className="w-8" />
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">이후</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">상태</th>
          </tr>
        </thead>
        <tbody>
          {meaningful.map((change) => (
            <tr key={change.label} className="border-b border-border/40 last:border-b-0">
              <td className="px-4 py-2.5 text-sm font-medium text-foreground">{change.label}</td>
              <td className="px-4 py-2.5">
                <DiffValue value={change.fromValue} type="from" />
              </td>
              <td className="py-2.5 text-center">
                <ArrowRight className="inline h-3 w-3 text-muted-foreground" />
              </td>
              <td className="px-4 py-2.5">
                <DiffValue value={change.toValue} type="to" />
              </td>
              <td className="px-4 py-2.5 text-right">
                <ChangeTypeBadge type={change.changeType} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileDiffList({ changes }: { changes: PartRevisionDiffFileChange[] }) {
  if (changes.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">변경된 파일이 없습니다.</p>;
  }

  return (
    <div className="rounded-lg border divide-y divide-border/40">
      {changes.map((change) => (
        <div key={change.fileName} className="flex items-center justify-between px-4 py-2.5">
          <p className={cn(
            "text-sm",
            change.changeType === "removed" && "text-red-700 line-through dark:text-red-300",
            change.changeType === "added" && "text-emerald-700 dark:text-emerald-300",
          )}>
            {change.fileName}
          </p>
          <ChangeTypeBadge type={change.changeType} />
        </div>
      ))}
    </div>
  );
}

function BomDiffList({ changes }: { changes: PartRevisionDiffBomChange[] }) {
  if (changes.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">변경된 BOM 항목이 없습니다.</p>;
  }

  return (
    <div className="rounded-lg border divide-y divide-border/40">
      {changes.map((change) => (
        <div key={`${change.partNumber}-${change.field ?? ""}`} className="flex items-center justify-between px-4 py-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{change.partNumber}</span>
              {change.name ? <span className="text-sm text-foreground">{change.name}</span> : null}
            </div>
            {change.field && change.fromValue && change.toValue ? (
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{change.field}</span>
                <DiffValue value={change.fromValue} type="from" />
                <ArrowRight className="h-3 w-3" />
                <DiffValue value={change.toValue} type="to" />
              </div>
            ) : null}
          </div>
          <ChangeTypeBadge type={change.changeType} />
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────

export function PartRevisionDiff({
  revisions,
  diff,
  fromRevision,
  toRevision,
  onFromChange,
  onToChange,
}: PartRevisionDiffProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={fromRevision ?? undefined} onValueChange={onFromChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="이전 리비전" />
          </SelectTrigger>
          <SelectContent>
            {revisions.map((rev) => (
              <SelectItem key={rev.value} value={rev.value} disabled={rev.value === toRevision}>
                {rev.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ArrowRight className="h-4 w-4 text-muted-foreground" />

        <Select value={toRevision ?? undefined} onValueChange={onToChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="이후 리비전" />
          </SelectTrigger>
          <SelectContent>
            {revisions.map((rev) => (
              <SelectItem key={rev.value} value={rev.value} disabled={rev.value === fromRevision}>
                {rev.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!diff ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-sm text-muted-foreground">비교할 리비전을 선택하세요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diff.properties.length > 0 ? (
            <div className="space-y-3">
              <SectionHeader title="속성" count={diff.properties.filter((c) => c.changeType !== "unchanged").length} />
              <PropertyDiffTable changes={diff.properties} />
            </div>
          ) : null}

          {diff.files.length > 0 ? (
            <div className="space-y-3">
              <SectionHeader title="파일" count={diff.files.length} />
              <FileDiffList changes={diff.files} />
            </div>
          ) : null}

          {diff.bom.length > 0 ? (
            <div className="space-y-3">
              <SectionHeader title="BOM" count={diff.bom.length} />
              <BomDiffList changes={diff.bom} />
            </div>
          ) : null}

          {diff.properties.filter((c) => c.changeType !== "unchanged").length === 0
            && diff.files.length === 0
            && diff.bom.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed py-12">
              <Equal className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">두 리비전 간 차이가 없습니다.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
