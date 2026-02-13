import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Columns3,
  GitBranch,
  HelpCircle,
  Info,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockColumnMappings,
  mockMappingSampleRows,
  mockRelationMappings,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { cn } from "@/lib/utils";

type ResolveMode = "base" | "extended" | "relation_prop";

interface ExcludedCandidate {
  id: string;
  sourceColumn: string;
  reason: string;
}

type Assignment =
  | { status: "unassigned" }
  | {
      status: "assigned";
      mode: ResolveMode;
      targetDisplay: string;
      targetOriginal?: string;
      relationFlowDisplay?: string;
      relationFlowOriginal?: string;
    };

type AssignmentDraft = {
  mode: ResolveMode;
  baseLabel: string;
  baseProperty: string;
  extLabel: string;
  extPropertyName: string;
  relType: string;
  relFrom: string;
  relTo: string;
  relProperty: string;
};

const labelOptions = ["Part", "Supplier", "Project", "Drawing"];
const basePropertyByLabel: Record<string, string[]> = {
  Part: ["part_number", "name", "description", "material"],
  Supplier: ["company_name", "lead_time", "contact"],
  Project: ["project_code", "name"],
  Drawing: ["drawing_number", "revision"],
};
const relationTypeOptions = [
  "CONSISTS_OF",
  "DEFINED_BY",
  "HAS_ITEM",
  "SUPPLIED_BY",
];
const relationPropertyByType: Record<string, string[]> = {
  CONSISTS_OF: ["quantity", "unit"],
  DEFINED_BY: ["reference_designator"],
  HAS_ITEM: ["find_number"],
  SUPPLIED_BY: ["contract_type"],
};

const labelKo: Record<string, string> = {
  Part: "부품",
  Supplier: "공급사",
  Project: "프로젝트",
  Drawing: "도면",
};

const propertyKo: Record<string, string> = {
  part_number: "품번",
  name: "품명",
  description: "설명",
  material: "재질",
  company_name: "회사명",
  lead_time: "납기",
  contact: "담당자",
  project_code: "프로젝트 코드",
  drawing_number: "도면번호",
  revision: "리비전",
  quantity: "수량",
  unit: "단위",
  reference_designator: "참조기호",
  find_number: "아이템 번호",
  contract_type: "계약 유형",
};

const relKo: Record<string, string> = {
  CONSISTS_OF: "구성",
  DEFINED_BY: "정의됨",
  HAS_ITEM: "항목 포함",
  SUPPLIED_BY: "공급됨",
};
const excludedCandidates: ExcludedCandidate[] = [
  { id: "ex-1", sourceColumn: "Reference(s)", reason: "기본 매핑 없음" },
  { id: "ex-2", sourceColumn: "Item", reason: "기본 매핑 없음" },
  { id: "ex-3", sourceColumn: "Note", reason: "확장/관계 속성 후보" },
];
const mockExtended = [
  { source: "Reference(s)", target: "Part._ext_reference_s" },
  { source: "Note", target: "Part._ext_note" },
];

const staticBaseMappings = mockColumnMappings.slice(0, 3);
const staticRelationMappings = mockRelationMappings.slice(0, 2);
const staticExtendedMappings = mockExtended;

const relationFromToOptions = Array.from(
  new Set(mockColumnMappings.slice(0, 6).map((cm) => cm.source_column)),
);

function getSample(column: string) {
  const values = [
    ...new Set(mockMappingSampleRows.map((row) => row[column]).filter(Boolean)),
  ];
  return values.slice(0, 2).join(", ") || "샘플 없음";
}

function modeLabel(mode: ResolveMode) {
  if (mode === "base") return "기본 속성";
  if (mode === "extended") return "확장 속성";
  return "관계 속성";
}

function toDataTypeText(type?: string) {
  if (!type) return "-";
  if (type === "string") return "문자 (string)";
  if (type === "integer") return "정수 (integer)";
  if (type === "float") return "실수 (float)";
  return type;
}

function labelDisplay(value: string) {
  return labelKo[value] || value;
}

function propertyDisplay(value: string) {
  return propertyKo[value] || value;
}

function relationDisplay(value: string) {
  return relKo[value] || value;
}

function MaybeOriginal({
  display,
  original,
}: {
  display: string;
  original: string;
}) {
  if (display === original) {
    return <span>{display}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span>{display}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex cursor-help items-center text-gray-400"
            aria-label="원문 보기"
          >
            <Info className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>{original}</TooltipContent>
      </Tooltip>
    </span>
  );
}

function initialDraft(sourceColumn: string): AssignmentDraft {
  const baseLabel = "Part";
  const relType = relationTypeOptions[0];
  return {
    mode: "base",
    baseLabel,
    baseProperty: basePropertyByLabel[baseLabel][0],
    extLabel: "Part",
    extPropertyName: `_ext_${sourceColumn.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    relType,
    relFrom: relationFromToOptions[0] || "",
    relTo: relationFromToOptions[1] || relationFromToOptions[0] || "",
    relProperty: relationPropertyByType[relType][0],
  };
}

function toAssignment(draft: AssignmentDraft): Assignment {
  if (draft.mode === "base") {
    if (!draft.baseLabel || !draft.baseProperty)
      return { status: "unassigned" };
    return {
      status: "assigned",
      mode: "base",
      targetDisplay: `${labelDisplay(draft.baseLabel)} / ${propertyDisplay(draft.baseProperty)}`,
      targetOriginal: `${draft.baseLabel} / ${draft.baseProperty}`,
    };
  }
  if (draft.mode === "extended") {
    if (!draft.extLabel || !draft.extPropertyName.startsWith("_ext_"))
      return { status: "unassigned" };
    return {
      status: "assigned",
      mode: "extended",
      targetDisplay: `${labelDisplay(draft.extLabel)} / ${propertyDisplay(draft.extPropertyName)}`,
      targetOriginal: `${draft.extLabel} / ${draft.extPropertyName}`,
    };
  }
  if (!draft.relType || !draft.relFrom || !draft.relTo || !draft.relProperty)
    return { status: "unassigned" };
  return {
    status: "assigned",
    mode: "relation_prop",
    targetDisplay: `${relationDisplay(draft.relType)} / ${propertyDisplay(draft.relProperty)}`,
    targetOriginal: `${draft.relType} / ${draft.relProperty}`,
    relationFlowDisplay: `${draft.relFrom} -> ${relationDisplay(draft.relType)} -> ${draft.relTo}`,
    relationFlowOriginal: `${draft.relFrom} -> ${draft.relType} -> ${draft.relTo}`,
  };
}

function statusText(a: Assignment) {
  return a.status === "assigned" ? "할당됨" : "미할당";
}

function statusClass(a: Assignment) {
  return a.status === "assigned"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700";
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">{label}</Label>
      {children}
    </div>
  );
}

function SharedMappingCard({
  source,
  targetDisplay,
  targetOriginal,
  sample,
  assignment,
  relationFlowDisplay,
  relationFlowOriginal,
  dataType,
  confidence,
  selected,
  onClick,
  actions,
}: {
  source: string;
  targetDisplay: string;
  targetOriginal?: string;
  sample: string;
  assignment: Assignment;
  relationFlowDisplay?: string;
  relationFlowOriginal?: string;
  dataType?: string;
  confidence?: number;
  selected?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white px-4 py-3 transition-all",
        selected ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200",
        onClick && "cursor-pointer hover:border-gray-300",
      )}
      onClick={onClick}
    >
      <div className="grid grid-cols-[160px_1fr] gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            원본 컬럼
          </p>
          <p
            className="truncate text-[15px] font-bold text-gray-900"
            title={source}
          >
            {source}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            라벨 / 속성
          </p>
          <p
            className="truncate text-sm font-semibold text-gray-700"
            title={targetOriginal || targetDisplay}
          >
            <MaybeOriginal
              display={targetDisplay}
              original={targetOriginal || targetDisplay}
            />
          </p>
        </div>
      </div>
      {relationFlowDisplay && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            관계 흐름
          </p>
          <p className="text-sm font-semibold text-gray-700">
            <MaybeOriginal
              display={relationFlowDisplay}
              original={relationFlowOriginal || relationFlowDisplay}
            />
          </p>
        </div>
      )}
      <div className="mt-3 grid grid-cols-[minmax(180px,1fr)_140px_120px_auto] items-center gap-3 border-t border-gray-100 pt-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            샘플 데이터
          </p>
          <p className="truncate text-sm text-gray-500" title={sample}>
            {sample}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            데이터 타입
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {toDataTypeText(dataType)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            신뢰도
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {typeof confidence === "number" ? `${confidence}%` : "-"}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", statusClass(assignment))}
          >
            {statusText(assignment)}
          </Badge>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

function AssignmentEditor({
  sourceColumn,
  draft,
  onChange,
  onApply,
  applyLabel = "적용",
}: {
  sourceColumn: string;
  draft: AssignmentDraft;
  onChange: (next: AssignmentDraft) => void;
  onApply: () => void;
  applyLabel?: string;
}) {
  const baseProps = basePropertyByLabel[draft.baseLabel] || [];
  const relProps = relationPropertyByType[draft.relType] || [];

  const containerClass = "space-y-2";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(["base", "extended", "relation_prop"] as ResolveMode[]).map(
          (mode) => (
            <Button
              key={mode}
              size="sm"
              variant={draft.mode === mode ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => onChange({ ...draft, mode })}
            >
              {modeLabel(mode)}
            </Button>
          ),
        )}
      </div>

      {draft.mode === "base" && (
        <div className={containerClass}>
          <FormField label="라벨">
            <Select
              value={draft.baseLabel}
              onValueChange={(value) =>
                onChange({
                  ...draft,
                  baseLabel: value,
                  baseProperty: (basePropertyByLabel[value] || [""])[0],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {labelOptions.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="속성">
            <Select
              value={draft.baseProperty}
              onValueChange={(value) =>
                onChange({ ...draft, baseProperty: value })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseProps.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}

      {draft.mode === "extended" && (
        <div className={containerClass}>
          <FormField label="라벨">
            <Select
              value={draft.extLabel}
              onValueChange={(value) => onChange({ ...draft, extLabel: value })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {labelOptions.map((label) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="속성">
            <Input
              className="h-9 text-xs"
              value={draft.extPropertyName}
              onChange={(e) =>
                onChange({ ...draft, extPropertyName: e.target.value })
              }
              placeholder="_ext_property"
            />
          </FormField>
        </div>
      )}

      {draft.mode === "relation_prop" && (
        <div className="space-y-2">
          <FormField label="타입">
            <Select
              value={draft.relType}
              onValueChange={(value) =>
                onChange({
                  ...draft,
                  relType: value,
                  relProperty: (relationPropertyByType[value] || [""])[0],
                })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="원본 기준 컬럼">
            <Select
              value={draft.relFrom}
              onValueChange={(value) => onChange({ ...draft, relFrom: value })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationFromToOptions.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="대상 기준 컬럼">
            <Select
              value={draft.relTo}
              onValueChange={(value) => onChange({ ...draft, relTo: value })}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationFromToOptions.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="속성">
            <Select
              value={draft.relProperty}
              onValueChange={(value) =>
                onChange({ ...draft, relProperty: value })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relProps.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}

      <p className="text-xs text-gray-500">선택 컬럼: {sourceColumn}</p>
      <Button size="sm" className="h-8 w-full text-xs" onClick={onApply}>
        {applyLabel}
      </Button>
    </div>
  );
}

function CurrentBaseMappingCards() {
  return (
    <div className="space-y-3">
      {staticBaseMappings.map((cm) => (
        <SharedMappingCard
          key={cm.id}
          source={cm.source_column}
          targetDisplay={`${labelDisplay(cm.target_label)} / ${propertyDisplay(cm.target_property)}`}
          targetOriginal={`${cm.target_label} / ${cm.target_property}`}
          sample={getSample(cm.source_column)}
          assignment={{
            status: "assigned",
            mode: "base",
            targetDisplay: `${labelDisplay(cm.target_label)} / ${propertyDisplay(cm.target_property)}`,
            targetOriginal: `${cm.target_label} / ${cm.target_property}`,
          }}
          dataType={cm.data_type}
          confidence={cm.confidence}
          actions={
            <Button variant="outline" size="sm" className="h-7 text-xs">
              수정
            </Button>
          }
        />
      ))}
    </div>
  );
}

function CurrentRelationMappingCards() {
  return (
    <div className="space-y-3">
      {staticRelationMappings.map((rm) => {
        const firstPropKey = Object.values(rm.properties)[0] || "";
        const firstPropType = firstPropKey
          ? rm.property_types[firstPropKey]
          : undefined;

        return (
          <SharedMappingCard
            key={rm.id}
            source={`${Object.values(rm.from_columns).join(", ")} -> ${Object.values(rm.to_columns).join(", ")}`}
            targetDisplay={`${relationDisplay(rm.rel_type)} / ${firstPropKey ? propertyDisplay(firstPropKey) : "-"}`}
            targetOriginal={`${rm.rel_type} / ${firstPropKey || "-"}`}
            relationFlowDisplay={`${labelDisplay(rm.from_label)} -> ${relationDisplay(rm.rel_type)} -> ${labelDisplay(rm.to_label)}`}
            relationFlowOriginal={`${rm.from_label} -> ${rm.rel_type} -> ${rm.to_label}`}
            sample={Object.keys(rm.properties).join(", ") || "-"}
            assignment={{
              status: "assigned",
              mode: "relation_prop",
              targetDisplay: relationDisplay(rm.rel_type),
              targetOriginal: rm.rel_type,
              relationFlowDisplay: `${labelDisplay(rm.from_label)} -> ${relationDisplay(rm.rel_type)} -> ${labelDisplay(rm.to_label)}`,
              relationFlowOriginal: `${rm.from_label} -> ${rm.rel_type} -> ${rm.to_label}`,
            }}
            dataType={firstPropType}
            actions={
              <Button variant="outline" size="sm" className="h-7 text-xs">
                수정
              </Button>
            }
          />
        );
      })}
    </div>
  );
}

function CurrentExtendedMappingCards() {
  return (
    <div className="space-y-3">
      {staticExtendedMappings.map((item) => {
        const [label, property] = item.target.split(".");
        return (
          <SharedMappingCard
            key={item.source}
            source={item.source}
            targetDisplay={`${labelDisplay(label)} / ${propertyDisplay(property)}`}
            targetOriginal={`${label} / ${property}`}
            sample={getSample(item.source)}
            assignment={{
              status: "assigned",
              mode: "extended",
              targetDisplay: `${labelDisplay(label)} / ${propertyDisplay(property)}`,
              targetOriginal: `${label} / ${property}`,
            }}
            dataType="string"
            confidence={0}
            actions={
              <Button variant="outline" size="sm" className="h-7 text-xs">
                수정
              </Button>
            }
          />
        );
      })}
    </div>
  );
}

function InlineOptionDesign({
  draftById,
  setDraftById,
  assignmentById,
  setAssignmentById,
  openId,
  setOpenId,
}: {
  draftById: Record<string, AssignmentDraft>;
  setDraftById: React.Dispatch<React.SetStateAction<Record<string, AssignmentDraft>>>;
  assignmentById: Record<string, Assignment>;
  setAssignmentById: React.Dispatch<React.SetStateAction<Record<string, Assignment>>>;
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <div className="space-y-2">
      {excludedCandidates.map((item) => {
        const draft = draftById[item.id] || initialDraft(item.sourceColumn);
        const assignment = assignmentById[item.id] || {
          status: "unassigned" as const,
        };
        return (
          <div key={item.id} className="space-y-1.5">
            <SharedMappingCard
              source={item.sourceColumn}
              targetDisplay={
                assignment.status === "assigned"
                  ? assignment.targetDisplay
                  : "미할당"
              }
              targetOriginal={
                assignment.status === "assigned"
                  ? assignment.targetOriginal
                  : undefined
              }
              relationFlowDisplay={
                assignment.status === "assigned"
                  ? assignment.relationFlowDisplay
                  : undefined
              }
              relationFlowOriginal={
                assignment.status === "assigned"
                  ? assignment.relationFlowOriginal
                  : undefined
              }
              sample={getSample(item.sourceColumn)}
              assignment={assignment}
              selected={openId === item.id}
              onClick={() =>
                setOpenId((prev) => (prev === item.id ? null : item.id))
              }
              actions={
                <Button variant="outline" size="sm" className="h-7 px-2">
                  {openId === item.id ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              }
            />
            {openId === item.id && (
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <AssignmentEditor
                  sourceColumn={item.sourceColumn}
                  draft={draft}
                  onChange={(next) =>
                    setDraftById((prev) => ({ ...prev, [item.id]: next }))
                  }
                  onApply={() =>
                    setAssignmentById((prev) => ({
                      ...prev,
                      [item.id]: toAssignment(draft),
                    }))
                  }
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreviewBlock({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-baseline gap-3">
        <Badge className="h-7 w-7 justify-center rounded-lg">{index}</Badge>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{description}</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            기본 매핑
          </h3>
          <CurrentBaseMappingCards />
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-violet-600">
            관계 매핑
          </h3>
          <CurrentRelationMappingCards />
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            확장 매핑
          </h3>
          <CurrentExtendedMappingCards />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600">
          제외 항목 (통합 관리)
        </h3>
        {children}
      </div>
    </section>
  );
}

function PreviewDashboard({
  columnMappingCount,
  relationMappingCount,
  extendedMappingCount,
  excludedCount,
  approvedCount,
  totalMappings,
  onReset,
  onApproveAll,
}: {
  columnMappingCount: number;
  relationMappingCount: number;
  extendedMappingCount: number;
  excludedCount: number;
  approvedCount: number;
  totalMappings: number;
  onReset: () => void;
  onApproveAll: () => void;
}) {
  const progressPercent = totalMappings > 0 ? Math.round((approvedCount / totalMappings) * 100) : 0;
  const pendingCount = totalMappings - approvedCount;

  const metrics = [
    {
      key: "base",
      label: "기본 매핑",
      value: columnMappingCount,
      icon: Columns3,
      tone: "text-blue-600",
    },
    {
      key: "relation",
      label: "관계 매핑",
      value: relationMappingCount,
      icon: GitBranch,
      tone: "text-violet-600",
    },
    {
      key: "extended",
      label: "확장 매핑",
      value: extendedMappingCount,
      icon: ScrollText,
      tone: "text-amber-600",
    },
    {
      key: "approved",
      label: "승인됨",
      value: `${approvedCount} / ${totalMappings}`,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      key: "excluded",
      label: "제외됨",
      value: excludedCount,
      icon: HelpCircle,
      tone: "text-red-600",
    },
  ] as const;

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-2.5">
              <div className="mb-1 flex items-center gap-1.5">
                <Icon className={cn("size-4", item.tone)} />
                <span className={cn("text-xs font-semibold", item.tone)}>{item.label}</span>
              </div>
              <div className="flex items-center justify-end pr-1">
                <p className="text-right text-xl font-bold text-gray-800">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">승인 진행률</span>
            <span className="font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gray-800 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onReset}>
            리셋
          </Button>
          <Button
            size="sm"
            className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
            disabled={pendingCount === 0}
            onClick={onApproveAll}
          >
            모두 승인 ({pendingCount})
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MappingCardPreview() {
  const [draftById, setDraftById] = useState<Record<string, AssignmentDraft>>({});
  const [assignmentById, setAssignmentById] = useState<Record<string, Assignment>>({});
  const [openId, setOpenId] = useState<string | null>(excludedCandidates[0].id);

  const assignedEntries = Object.values(assignmentById).filter(
    (item): item is Extract<Assignment, { status: "assigned" }> =>
      item.status === "assigned",
  );
  const assignedBase = assignedEntries.filter((item) => item.mode === "base").length;
  const assignedRelation = assignedEntries.filter(
    (item) => item.mode === "relation_prop",
  ).length;
  const assignedExtended = assignedEntries.filter(
    (item) => item.mode === "extended",
  ).length;

  const columnMappingCount = staticBaseMappings.length + assignedBase;
  const relationMappingCount = staticRelationMappings.length + assignedRelation;
  const extendedMappingCount = staticExtendedMappings.length + assignedExtended;
  const unresolvedExcluded = excludedCandidates.filter(
    (item) => assignmentById[item.id]?.status !== "assigned",
  ).length;

  const staticMappedCount =
    staticBaseMappings.length +
    staticRelationMappings.length +
    staticExtendedMappings.length;
  const totalMappings = staticMappedCount + excludedCandidates.length;
  const approvedCount = staticMappedCount + assignedEntries.length;

  return (
    <div className="min-h-screen bg-gray-50/80 px-6 py-12">
      <div className="mx-auto mb-3 flex w-full max-w-[1200px] items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl font-semibold text-gray-500">Fabbit</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[960px] flex-col space-y-4">
        <div className="px-8 pb-2 pt-6 text-center lg:px-10">
          <div className="mb-3 flex justify-center">
            <Sparkles className="size-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-3xl">
            The Bridge - AI 매핑
          </h1>
          <p className="mt-5 text-xl font-semibold leading-tight text-gray-500 md:text-xl">
            AI가 원본 데이터와 표준 속성을 매핑했습니다. 확인하고 수정해 주세요.
          </p>
        </div>

        <div className="space-y-4 px-8 lg:px-10">
          <PreviewDashboard
            columnMappingCount={columnMappingCount}
            relationMappingCount={relationMappingCount}
            extendedMappingCount={extendedMappingCount}
            excludedCount={unresolvedExcluded}
            approvedCount={approvedCount}
            totalMappings={totalMappings}
            onApproveAll={() => {
              const next: Record<string, Assignment> = {};
              excludedCandidates.forEach((item) => {
                next[item.id] = toAssignment(draftById[item.id] || initialDraft(item.sourceColumn));
              });
              setAssignmentById(next);
            }}
            onReset={() => {
              setDraftById({});
              setAssignmentById({});
              setOpenId(excludedCandidates[0].id);
            }}
          />

          <PreviewBlock index={2} title="2안-B 세로 인라인" description="항목별 한 줄 배치">
            <InlineOptionDesign
              draftById={draftById}
              setDraftById={setDraftById}
              assignmentById={assignmentById}
              setAssignmentById={setAssignmentById}
              openId={openId}
              setOpenId={setOpenId}
            />
          </PreviewBlock>

          <div className="flex items-center justify-between pb-8 pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-12 border-gray-200 px-8 text-base font-semibold transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              이전
            </Button>
            <Button
              type="button"
              className="h-12 bg-blue-600 px-8 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
