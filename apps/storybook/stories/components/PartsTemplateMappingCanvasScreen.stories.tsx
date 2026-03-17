import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { AlertTriangle, ChevronDown, RotateCcw, Sparkles, Table2 } from "lucide-react";
import {
  PartsTemplateMappingCanvasScreen,
  resolvePartsTemplateMappingCanvasRelationLabel,
  type PartsTemplateMappingCanvasEdge,
  type PartsTemplateMappingCanvasFieldMappingEngineeringChange,
  type PartsTemplateMappingCanvasFieldOption,
  type PartsTemplateMappingCanvasNode,
  type PartsTemplateMappingCanvasNodeTone,
  type PartsTemplateMappingCanvasField,
  type PartsTemplateMappingCanvasPropertyMoveRequest,
} from "@fabbit/components";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from "@fabbit/ui";

const CANVAS_SAFE_MARGIN = 96;
const WORKAREA_WIDTH = 4200 - CANVAS_SAFE_MARGIN * 2;
const WORKAREA_HEIGHT = 2800 - CANVAS_SAFE_MARGIN * 2;
const NODE_WIDTH = 260;
const WORKAREA_CENTER_X = CANVAS_SAFE_MARGIN + WORKAREA_WIDTH / 2;
const WORKAREA_CENTER_Y = CANVAS_SAFE_MARGIN + WORKAREA_HEIGHT / 2;
const NEW_NODE_GAP_X = 420;
const NEW_NODE_GAP_Y = 280;
const TWO_NODE_COLUMN_OFFSET = 440;
const MULTI_LEFT_COLUMN_OFFSET = 520;
const MULTI_RIGHT_COLUMN_OFFSET = 420;
const MULTI_COLUMN_GAP_Y = 56;
const EDGE_CARD_WIDTH = 196;
const EDGE_CARD_OFFSET_Y = 54;
const DEFAULT_DATASET_ID = "multi";
const NODE_HEADER_HEIGHT = 72;
const NODE_FOOTER_HEIGHT = 68;
const NODE_PROPERTY_SECTION_PADDING = 32;
const NODE_PROPERTY_EMPTY_HEIGHT = 56;
const PROPERTY_ROW_HEIGHT = 56;
const PROPERTY_ROW_GAP = 8;
const PROPERTY_LABEL_ORDER = [
  "품번",
  "품명",
  "규격",
  "재질",
  "도면 번호",
  "개정",
  "공급사 코드",
  "공급사명",
  "프로젝트 코드",
  "프로젝트명",
  "단위",
  "중량",
  "승인 상태",
  "납기 조건",
  "연결 키",
  "적용 규칙",
] as const;

const NODE_TONE_PRIORITY: Record<PartsTemplateMappingCanvasNodeTone, number> = {
  part: 0,
  drawing: 1,
  supplier: 2,
  project: 3,
};

type CanvasDatasetId = "single" | "pair" | "multi";
type CanvasDatasetPreviewRow = Record<string, string | number>;
type CanvasPreviewHeaderOwner = PartsTemplateMappingCanvasNodeTone | "unassigned";

interface CanvasDatasetDefinition {
  id: CanvasDatasetId;
  label: string;
  fileName: string;
  description: string;
  nodes: PartsTemplateMappingCanvasNode[];
  edges: PartsTemplateMappingCanvasEdge[];
  previewHeaders: string[];
  previewRows: CanvasDatasetPreviewRow[];
  unassignedProperties: PartsTemplateMappingCanvasField[];
}

interface CanvasDatasetGraph {
  nodes: PartsTemplateMappingCanvasNode[];
  edges: PartsTemplateMappingCanvasEdge[];
  unassignedProperties: PartsTemplateMappingCanvasField[];
}

const PREVIEW_HEADER_STYLE_BY_OWNER: Record<PartsTemplateMappingCanvasNodeTone, CSSProperties> = {
  part: {
    backgroundColor: "color-mix(in srgb, var(--brand-500) 12%, var(--theme-surface))",
    borderRightColor: "color-mix(in srgb, var(--brand-500) 22%, var(--theme-border))",
    color: "var(--brand-600)",
  },
  drawing: {
    backgroundColor: "color-mix(in srgb, var(--status-warning) 12%, var(--theme-surface))",
    borderRightColor: "color-mix(in srgb, var(--status-warning) 22%, var(--theme-border))",
    color: "var(--status-warning)",
  },
  supplier: {
    backgroundColor: "color-mix(in srgb, var(--status-success) 12%, var(--theme-surface))",
    borderRightColor: "color-mix(in srgb, var(--status-success) 22%, var(--theme-border))",
    color: "var(--status-success)",
  },
  project: {
    backgroundColor: "color-mix(in srgb, var(--status-accent) 12%, var(--theme-surface))",
    borderRightColor: "color-mix(in srgb, var(--status-accent) 22%, var(--theme-border))",
    color: "var(--status-accent)",
  },
};

function buildPreviewHeaderOwnerMap(graph: CanvasDatasetGraph) {
  const ownerMap = new Map<string, CanvasPreviewHeaderOwner>();

  graph.nodes.forEach((node) => {
    const tone = node.tone ?? "part";

    (node.fields ?? []).forEach((field) => {
      ownerMap.set(field.label, tone);
    });
  });

  graph.unassignedProperties.forEach((field) => {
    ownerMap.set(field.label, "unassigned");
  });

  return ownerMap;
}

function getPreviewHeaderStyle(owner?: CanvasPreviewHeaderOwner) {
  if (!owner || owner === "unassigned") {
    return undefined;
  }

  return PREVIEW_HEADER_STYLE_BY_OWNER[owner];
}

function CanvasDatasetSourcePreview({
  dataset,
  headerOwners,
}: {
  dataset: CanvasDatasetDefinition;
  headerOwners: Map<string, CanvasPreviewHeaderOwner>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:bg-muted/30">
        <div className="inline-flex size-9 items-center justify-center rounded-full border bg-background/80 text-muted-foreground">
          <Table2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">원본 데이터 미리보기</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {dataset.previewRows.length}행 x {dataset.previewHeaders.length}열
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 overflow-auto overscroll-none rounded-lg border bg-card shadow-sm">
          <table className="w-full min-w-max text-xs">
            <thead>
              <tr className="border-b border-border/70 bg-muted">
                <th className="sticky left-0 z-10 min-w-12 border-r border-border/70 bg-muted px-3 py-2 text-center font-semibold text-muted-foreground">
                  #
                </th>
                {dataset.previewHeaders.map((header) => {
                  const owner = headerOwners.get(header);

                  return (
                    <th
                      key={header}
                      className={cn(
                        "min-w-[132px] border-r border-border/60 px-3 py-2 text-left font-semibold last:border-r-0",
                        owner ? "" : "bg-muted text-foreground",
                        owner === "unassigned" ? "bg-muted text-foreground" : "",
                      )}
                      style={getPreviewHeaderStyle(owner)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {owner === "unassigned" ? (
                          <AlertTriangle className="size-3 text-[var(--status-warning)]" aria-hidden="true" />
                        ) : null}
                        {header}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {dataset.previewRows.map((row, rowIndex) => (
                <tr
                  key={`${dataset.id}-preview-row-${rowIndex + 1}`}
                  className="border-b border-border/60 last:border-b-0"
                >
                  <td className="sticky left-0 z-10 border-r border-border/60 bg-background px-3 py-2 text-center text-muted-foreground">
                    {rowIndex + 1}
                  </td>
                  {dataset.previewHeaders.map((header) => (
                    <td
                      key={`${dataset.id}-preview-cell-${rowIndex + 1}-${header}`}
                      className="border-r border-border/50 px-3 py-2 text-foreground/90 last:border-r-0"
                    >
                      {String(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CanvasAppliedHeader({
  fileName,
  onResetClick,
}: {
  fileName: string;
  onResetClick: () => void;
}) {
  return (
    <section className="rounded-lg border bg-card px-6 py-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">매핑 확인</h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5"
          onClick={onResetClick}
        >
          <RotateCcw className="size-3.5" />
          초기화
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {fileName
          ? `${fileName} 분석 결과를 검토하고 관계와 항목 배치를 조정하세요.`
          : "분석 결과를 검토하고 관계와 항목 배치를 조정하세요."}
      </p>
    </section>
  );
}

const PART_FIELD_OPTIONS: PartsTemplateMappingCanvasFieldOption[] = [
  { value: "part-number", label: "품번" },
  { value: "part-name", label: "부품명" },
  { value: "part-category", label: "분류" },
  { value: "part-spec", label: "규격" },
  { value: "part-unit", label: "단위" },
  { value: "part-material", label: "재질" },
];

const DRAWING_FIELD_OPTIONS: PartsTemplateMappingCanvasFieldOption[] = [
  { value: "drawing-number", label: "도면 번호" },
  { value: "drawing-revision", label: "개정" },
];

const SUPPLIER_FIELD_OPTIONS: PartsTemplateMappingCanvasFieldOption[] = [
  { value: "supplier-code", label: "공급사 코드" },
  { value: "supplier-name", label: "공급사명" },
];

const PROJECT_FIELD_OPTIONS: PartsTemplateMappingCanvasFieldOption[] = [
  { value: "project-code", label: "프로젝트 코드" },
  { value: "project-name", label: "프로젝트명" },
];

const RELATION_FIELD_OPTIONS: PartsTemplateMappingCanvasFieldOption[] = [
  { value: "relation-key", label: "연결 키" },
  { value: "relation-rule", label: "적용 규칙" },
  { value: "relation-note", label: "비고" },
];

function cloneFieldOptions(options?: PartsTemplateMappingCanvasFieldOption[]) {
  return options?.map((option) => ({ ...option })) ?? [];
}

function getNodeFieldOptions(tone: PartsTemplateMappingCanvasNodeTone) {
  switch (tone) {
    case "supplier":
      return cloneFieldOptions(SUPPLIER_FIELD_OPTIONS);
    case "drawing":
      return cloneFieldOptions(DRAWING_FIELD_OPTIONS);
    case "project":
      return cloneFieldOptions(PROJECT_FIELD_OPTIONS);
    default:
      return cloneFieldOptions(PART_FIELD_OPTIONS);
  }
}

function getRelationFieldOptions() {
  return cloneFieldOptions(RELATION_FIELD_OPTIONS);
}

function applyFieldMappingOptions(
  field: PartsTemplateMappingCanvasField,
  options?: PartsTemplateMappingCanvasFieldOption[],
) {
  const nextOptions = cloneFieldOptions(options);
  const nextMappedValue = nextOptions.some((option) => option.value === field.mappedValue)
    ? field.mappedValue ?? null
    : null;

  return {
    ...field,
    mappedValue: nextMappedValue,
    mappingOptions: nextOptions.length ? nextOptions : undefined,
  };
}

function clearFieldMappingContext(field: PartsTemplateMappingCanvasField) {
  return {
    ...field,
    mappedValue: null,
    mappingOptions: undefined,
  };
}

function cloneNodes(nodes: PartsTemplateMappingCanvasNode[]) {
  return nodes.map((node) => ({
    ...node,
    fields: cloneFields(node.fields ?? []),
  }));
}

function cloneFields(fields: PartsTemplateMappingCanvasField[]) {
  return fields.map((field) => ({
    ...field,
    mappingOptions: cloneFieldOptions(field.mappingOptions),
  }));
}

function cloneEdges(edges: PartsTemplateMappingCanvasEdge[]) {
  return edges.map((edge) => ({
    ...edge,
    properties: cloneFields(edge.properties ?? []),
  }));
}

function getPropertyOrder(
  label: string,
  headerOrder: string[],
) {
  const headerIndex = headerOrder.indexOf(label);

  if (headerIndex !== -1) {
    return headerIndex;
  }

  const fallbackIndex = PROPERTY_LABEL_ORDER.indexOf(label as (typeof PROPERTY_LABEL_ORDER)[number]);

  if (fallbackIndex !== -1) {
    return headerOrder.length + fallbackIndex;
  }

  return headerOrder.length + PROPERTY_LABEL_ORDER.length + Number.MAX_SAFE_INTEGER / 4;
}

function sortCanvasProperties(
  properties: PartsTemplateMappingCanvasField[],
  headerOrder: string[],
) {
  return cloneFields(properties).sort((left, right) => {
    const orderGap = getPropertyOrder(left.label, headerOrder) - getPropertyOrder(right.label, headerOrder);

    if (orderGap !== 0) {
      return orderGap;
    }

    return left.label.localeCompare(right.label, "ko");
  });
}

function getNodeHeight(
  node: Pick<PartsTemplateMappingCanvasNode, "fields" | "description">,
) {
  const fieldCount = node.fields?.length ?? 0;

  if (fieldCount === 0) {
    return NODE_HEADER_HEIGHT + NODE_PROPERTY_SECTION_PADDING + NODE_PROPERTY_EMPTY_HEIGHT + NODE_FOOTER_HEIGHT;
  }

  return NODE_HEADER_HEIGHT
    + NODE_PROPERTY_SECTION_PADDING
    + fieldCount * PROPERTY_ROW_HEIGHT
    + (fieldCount - 1) * PROPERTY_ROW_GAP
    + NODE_FOOTER_HEIGHT;
}

function getEdgeCardHeight(edge: Pick<PartsTemplateMappingCanvasEdge, "properties">) {
  const propertyCount = edge.properties?.length ?? 0;

  if (propertyCount === 0) {
    return 132;
  }

  return 96 + propertyCount * 54 + (propertyCount - 1) * 8;
}

function buildDatasetNode({
  id,
  tone,
  subtitle,
  description,
  fields,
}: {
  id: string;
  tone: PartsTemplateMappingCanvasNodeTone;
  subtitle?: string;
  description?: string;
  fields: Array<{ label: string; hint: string; mappedValue?: string | null }>;
}): PartsTemplateMappingCanvasNode {
  const titleByTone: Record<PartsTemplateMappingCanvasNodeTone, string> = {
    supplier: "공급사",
    part: "부품",
    drawing: "도면",
    project: "프로젝트",
  };

  return {
    id,
    title: titleByTone[tone],
    ...(subtitle ? { subtitle } : {}),
    ...(description ? { description } : {}),
    tone,
    x: WORKAREA_CENTER_X - NODE_WIDTH / 2,
    y: WORKAREA_CENTER_Y,
    fields: fields.map((field, index) =>
      applyFieldMappingOptions(
        {
          id: `${id}-field-${index + 1}`,
          label: field.label,
          hint: field.hint,
          mappedValue: field.mappedValue ?? null,
        },
        getNodeFieldOptions(tone),
      ),
    ),
  };
}

function buildRelationProperties(
  edgeId: string,
  sourceTitle: string,
  targetTitle: string,
): PartsTemplateMappingCanvasEdge["properties"] {
  return [
    applyFieldMappingOptions(
      {
        id: `${edgeId}-key`,
        label: "연결 키",
        hint: `${sourceTitle} -> ${targetTitle}`,
        mappedValue: "relation-key",
      },
      getRelationFieldOptions(),
    ),
    applyFieldMappingOptions(
      {
        id: `${edgeId}-rule`,
        label: "적용 규칙",
        hint: "관계 조건 설정",
        mappedValue: "relation-rule",
      },
      getRelationFieldOptions(),
    ),
  ];
}

function buildUnassignedProperties(
  prefix: string,
  items: Array<{ label: string; hint: string }>,
) {
  return items.map((item, index) => ({
    id: `${prefix}-unassigned-${index + 1}`,
    label: item.label,
    hint: item.hint,
  }));
}

function buildEdgeCardPosition(
  source: Pick<PartsTemplateMappingCanvasNode, "x" | "y" | "fields" | "description">,
  target: Pick<PartsTemplateMappingCanvasNode, "x" | "y" | "fields" | "description">,
  offsetX = 0,
  offsetY = 0,
) {
  const sourceHeight = getNodeHeight(source);
  const targetHeight = getNodeHeight(target);

  return {
    x: (source.x + 130 + target.x + 130) / 2 - EDGE_CARD_WIDTH / 2 + offsetX,
    y: (source.y + sourceHeight / 2 + target.y + targetHeight / 2) / 2 - EDGE_CARD_OFFSET_Y + offsetY,
  };
}

function buildNodeDefinition(type: PartsTemplateMappingCanvasNodeTone): Omit<PartsTemplateMappingCanvasNode, "id" | "x" | "y"> {
  switch (type) {
    case "supplier":
      return {
        title: "공급사",
        tone: "supplier",
        fields: [],
      };
    case "drawing":
      return {
        title: "도면",
        tone: "drawing",
        fields: [],
      };
    case "project":
      return {
        title: "프로젝트",
        tone: "project",
        fields: [],
      };
    default:
      return {
        title: "부품",
        tone: "part",
        fields: [],
      };
  }
}

const DATASET_DEFINITIONS: CanvasDatasetDefinition[] = [
  {
    id: "single",
    label: "카드 1개",
    fileName: "dataset_single.fig",
    description: "카드 하나만 배치한 예시입니다.",
    nodes: [
      buildDatasetNode({
        id: "single-part",
        tone: "part",
        subtitle: "핵심",
        description: "부품 기본 정보",
        fields: [
          { label: "품번", hint: "식별 키", mappedValue: "part-number" },
          { label: "품명", hint: "대표 이름", mappedValue: "part-name" },
          { label: "규격", hint: "기본 규격", mappedValue: "part-spec" },
          { label: "재질", hint: "소재 정보", mappedValue: "part-material" },
        ],
      }),
    ],
    edges: [],
    previewHeaders: ["품번", "품명", "규격", "재질", "단위", "중량"],
    previewRows: [
      {
        "품번": "PRT-1001",
        "품명": "구동 브래킷",
        "규격": "120 x 48 x 6",
        "재질": "AL6061",
        "단위": "EA",
        "중량": "1.2kg",
      },
      {
        "품번": "PRT-1002",
        "품명": "센서 플레이트",
        "규격": "84 x 36 x 4",
        "재질": "SUS304",
        "단위": "EA",
        "중량": "0.6kg",
      },
    ],
    unassignedProperties: buildUnassignedProperties("single", [
      { label: "단위", hint: "기본 단위" },
      { label: "중량", hint: "기초 중량" },
    ]),
  },
  {
    id: "pair",
    label: "카드 2개",
    fileName: "dataset_pair.fig",
    description: "카드 두 장을 연결한 예시입니다.",
    nodes: [
      buildDatasetNode({
        id: "pair-part",
        tone: "part",
        subtitle: "기준",
        description: "부품 정보",
        fields: [
          { label: "품번", hint: "식별 키", mappedValue: "part-number" },
          { label: "품명", hint: "대표 이름", mappedValue: "part-name" },
          { label: "분류", hint: "카테고리", mappedValue: "part-category" },
        ],
      }),
      buildDatasetNode({
        id: "pair-drawing",
        tone: "drawing",
        fields: [
          { label: "도면 번호", hint: "문서 키", mappedValue: "drawing-number" },
          { label: "개정", hint: "버전 정보", mappedValue: "drawing-revision" },
        ],
      }),
    ],
    edges: [
      {
        id: "edge-pair-drawing-part",
        sourceId: "pair-drawing",
        targetId: "pair-part",
        label: "참조",
        properties: buildRelationProperties("edge-pair-drawing-part", "도면", "부품"),
      },
    ],
    previewHeaders: ["품번", "품명", "분류", "도면 번호", "개정", "승인 상태", "납기 조건"],
    previewRows: [
      {
        "품번": "ASSY-2201",
        "품명": "메인 브래킷",
        "분류": "가공품",
        "도면 번호": "DWG-2201-A",
        "개정": "A",
        "승인 상태": "검토 완료",
        "납기 조건": "양산 기준",
      },
      {
        "품번": "ASSY-2202",
        "품명": "커버 플레이트",
        "분류": "판금품",
        "도면 번호": "DWG-2202-B",
        "개정": "B",
        "승인 상태": "승인 대기",
        "납기 조건": "초도 2주",
      },
    ],
    unassignedProperties: buildUnassignedProperties("pair", [
      { label: "승인 상태", hint: "검토 상태" },
      { label: "납기 조건", hint: "기본 납기 정보" },
    ]),
  },
  {
    id: "multi",
    label: "카드 3개 이상",
    fileName: "dataset_multi.fig",
    description: "여러 카드를 한 화면에서 배치한 예시입니다.",
    nodes: [
      buildDatasetNode({
        id: "multi-part",
        tone: "part",
        subtitle: "핵심",
        description: "부품 기본 정보",
        fields: [
          { label: "품번", hint: "식별 키", mappedValue: "part-number" },
          { label: "품명", hint: "대표 이름", mappedValue: "part-name" },
          { label: "규격", hint: "기본 규격", mappedValue: "part-spec" },
          { label: "재질", hint: "소재 정보", mappedValue: "part-material" },
        ],
      }),
      buildDatasetNode({
        id: "multi-drawing",
        tone: "drawing",
        fields: [
          { label: "도면 번호", hint: "문서 키", mappedValue: "drawing-number" },
          { label: "개정", hint: "버전 정보", mappedValue: "drawing-revision" },
        ],
      }),
      buildDatasetNode({
        id: "multi-supplier",
        tone: "supplier",
        fields: [
          { label: "공급사 코드", hint: "거래처 식별", mappedValue: "supplier-code" },
          { label: "공급사명", hint: "표시 이름", mappedValue: "supplier-name" },
        ],
      }),
      buildDatasetNode({
        id: "multi-project",
        tone: "project",
        subtitle: "컨텍스트",
        description: "프로젝트 정보",
        fields: [
          { label: "프로젝트 코드", hint: "관리 코드", mappedValue: "project-code" },
          { label: "프로젝트명", hint: "대표 이름", mappedValue: "project-name" },
        ],
      }),
    ],
    edges: [
      {
        id: "edge-multi-drawing-part",
        sourceId: "multi-drawing",
        targetId: "multi-part",
        label: "참조",
        properties: buildRelationProperties("edge-multi-drawing-part", "도면", "부품"),
      },
      {
        id: "edge-multi-supplier-part",
        sourceId: "multi-supplier",
        targetId: "multi-part",
        label: "공급",
        properties: buildRelationProperties("edge-multi-supplier-part", "공급사", "부품"),
      },
      {
        id: "edge-multi-project-part",
        sourceId: "multi-project",
        targetId: "multi-part",
        label: "관리",
        properties: buildRelationProperties("edge-multi-project-part", "프로젝트", "부품"),
      },
    ],
    previewHeaders: [
      "품번",
      "품명",
      "규격",
      "재질",
      "도면 번호",
      "개정",
      "공급사 코드",
      "공급사명",
      "프로젝트 코드",
      "프로젝트명",
      "단위",
      "중량",
      "승인 상태",
      "납기 조건",
    ],
    previewRows: [
      {
        "품번": "MTR-001",
        "품명": "모터 하우징",
        "규격": "210 x 180 x 95",
        "재질": "AL6061",
        "도면 번호": "DWG-9001-A",
        "개정": "A",
        "공급사 코드": "SUP-014",
        "공급사명": "세명정밀",
        "프로젝트 코드": "PJ-ALPHA",
        "프로젝트명": "알파 라인",
        "단위": "EA",
        "중량": "3.8kg",
        "승인 상태": "승인 완료",
        "납기 조건": "월 2회 입고",
      },
      {
        "품번": "MTR-002",
        "품명": "엔드 커버",
        "규격": "168 x 168 x 22",
        "재질": "ADC12",
        "도면 번호": "DWG-9002-B",
        "개정": "B",
        "공급사 코드": "SUP-021",
        "공급사명": "하나테크",
        "프로젝트 코드": "PJ-ALPHA",
        "프로젝트명": "알파 라인",
        "단위": "EA",
        "중량": "1.1kg",
        "승인 상태": "검토 중",
        "납기 조건": "초도 10일",
      },
      {
        "품번": "MTR-003",
        "품명": "센서 브래킷",
        "규격": "74 x 52 x 4",
        "재질": "SUS304",
        "도면 번호": "DWG-9003-A",
        "개정": "A",
        "공급사 코드": "SUP-014",
        "공급사명": "세명정밀",
        "프로젝트 코드": "PJ-BETA",
        "프로젝트명": "베타 모듈",
        "단위": "EA",
        "중량": "0.3kg",
        "승인 상태": "승인 대기",
        "납기 조건": "긴급 발주",
      },
    ],
    unassignedProperties: buildUnassignedProperties("multi", [
      { label: "단위", hint: "표준 단위" },
      { label: "중량", hint: "출하 중량" },
      { label: "승인 상태", hint: "승인 단계" },
      { label: "납기 조건", hint: "기본 납기 정책" },
    ]),
  },
];

function buildNodeDegreeMap(edges: PartsTemplateMappingCanvasEdge[]) {
  const degreeMap = new Map<string, number>();

  edges.forEach((edge) => {
    degreeMap.set(edge.sourceId, (degreeMap.get(edge.sourceId) ?? 0) + 1);
    degreeMap.set(edge.targetId, (degreeMap.get(edge.targetId) ?? 0) + 1);
  });

  return degreeMap;
}

function compareNodesForLayout(
  left: PartsTemplateMappingCanvasNode,
  right: PartsTemplateMappingCanvasNode,
  degreeMap: Map<string, number>,
) {
  const fieldCountGap = (right.fields?.length ?? 0) - (left.fields?.length ?? 0);

  if (fieldCountGap !== 0) {
    return fieldCountGap;
  }

  const degreeGap = (degreeMap.get(right.id) ?? 0) - (degreeMap.get(left.id) ?? 0);

  if (degreeGap !== 0) {
    return degreeGap;
  }

  const toneGap =
    (NODE_TONE_PRIORITY[left.tone ?? "project"] ?? Number.MAX_SAFE_INTEGER) -
    (NODE_TONE_PRIORITY[right.tone ?? "project"] ?? Number.MAX_SAFE_INTEGER);

  if (toneGap !== 0) {
    return toneGap;
  }

  return left.id.localeCompare(right.id, "ko");
}

function layoutDatasetGraph(
  nodes: PartsTemplateMappingCanvasNode[],
  edges: PartsTemplateMappingCanvasEdge[],
) {
  const degreeMap = buildNodeDegreeMap(edges);
  const sortedNodes = cloneNodes(nodes).sort((left, right) =>
    compareNodesForLayout(left, right, degreeMap),
  );
  const nodePositions = new Map<string, { x: number; y: number }>();
  const edgePositions = new Map<string, { x: number; y: number }>();

  if (sortedNodes.length === 1) {
    const [node] = sortedNodes;

    nodePositions.set(node.id, {
      x: WORKAREA_CENTER_X - NODE_WIDTH / 2,
      y: WORKAREA_CENTER_Y - getNodeHeight(node) / 2,
    });
  } else if (sortedNodes.length === 2) {
    const [leftNode, rightNode] = sortedNodes;
    const leftX = WORKAREA_CENTER_X - TWO_NODE_COLUMN_OFFSET - NODE_WIDTH / 2;
    const rightX = WORKAREA_CENTER_X + TWO_NODE_COLUMN_OFFSET - NODE_WIDTH / 2;
    const pairEdges = edges.filter((edge) =>
      (edge.sourceId === leftNode.id && edge.targetId === rightNode.id) ||
      (edge.sourceId === rightNode.id && edge.targetId === leftNode.id),
    );
    const pairRowHeight = Math.max(
      getNodeHeight(leftNode),
      getNodeHeight(rightNode),
      ...pairEdges.map((edge) => getEdgeCardHeight(edge)),
    );
    const rowTop = WORKAREA_CENTER_Y - pairRowHeight / 2;

    nodePositions.set(leftNode.id, {
      x: leftX,
      y: rowTop,
    });
    nodePositions.set(rightNode.id, {
      x: rightX,
      y: rowTop,
    });

    pairEdges.forEach((edge) => {
      edgePositions.set(edge.id, {
        x: ((leftX + NODE_WIDTH / 2) + (rightX + NODE_WIDTH / 2)) / 2 - EDGE_CARD_WIDTH / 2,
        y: rowTop,
      });
    });
  } else if (sortedNodes.length > 2) {
    const [leftNode, ...rightNodes] = sortedNodes;
    const leftX = WORKAREA_CENTER_X - MULTI_LEFT_COLUMN_OFFSET - NODE_WIDTH / 2;
    const rightX = WORKAREA_CENTER_X + MULTI_RIGHT_COLUMN_OFFSET - NODE_WIDTH / 2;
    const rightRows = rightNodes.map((node, index) => {
      const rowEdge = edges.find((edge) =>
        (edge.sourceId === leftNode.id && edge.targetId === node.id) ||
        (edge.sourceId === node.id && edge.targetId === leftNode.id),
      );
      const rowHeight = Math.max(
        getNodeHeight(node),
        rowEdge ? getEdgeCardHeight(rowEdge) : 0,
        index === 0 ? getNodeHeight(leftNode) : 0,
      );

      return {
        node,
        rowEdge,
        rowHeight,
      };
    });
    const stackHeight =
      rightRows.reduce((sum, row) => sum + row.rowHeight, 0) +
      Math.max(rightRows.length - 1, 0) * MULTI_COLUMN_GAP_Y;
    let currentY = WORKAREA_CENTER_Y - stackHeight / 2;

    nodePositions.set(leftNode.id, {
      x: leftX,
      y: currentY,
    });

    rightRows.forEach((row) => {
      nodePositions.set(row.node.id, {
        x: rightX,
        y: currentY,
      });

      if (row.rowEdge) {
        edgePositions.set(row.rowEdge.id, {
          x: ((leftX + NODE_WIDTH / 2) + (rightX + NODE_WIDTH / 2)) / 2 - EDGE_CARD_WIDTH / 2,
          y: currentY,
        });
      }

      currentY += row.rowHeight + MULTI_COLUMN_GAP_Y;
    });
  }

  const laidOutNodes = cloneNodes(nodes).map((node) => {
    const position = nodePositions.get(node.id);

    if (!position) {
      return node;
    }

    return {
      ...node,
      ...position,
    };
  });
  const nodeMap = new Map(laidOutNodes.map((node) => [node.id, node]));
  const laidOutEdges = cloneEdges(edges).map((edge) => {
    const source = nodeMap.get(edge.sourceId);
    const target = nodeMap.get(edge.targetId);

    if (!source || !target) {
      return edge;
    }

    return {
      ...edge,
      ...(edgePositions.get(edge.id) ?? buildEdgeCardPosition(source, target)),
    };
  });

  return {
    nodes: laidOutNodes,
    edges: laidOutEdges,
  };
}

function normalizeGraphProperties(
  graph: CanvasDatasetGraph,
  headerOrder: string[],
) {
  return {
    nodes: cloneNodes(graph.nodes).map((node) => ({
      ...node,
      fields: sortCanvasProperties(node.fields ?? [], headerOrder),
    })),
    edges: cloneEdges(graph.edges).map((edge) => ({
      ...edge,
      properties: sortCanvasProperties(edge.properties ?? [], headerOrder),
    })),
    unassignedProperties: sortCanvasProperties(graph.unassignedProperties, headerOrder),
  };
}

function applyFieldToNode(
  field: PartsTemplateMappingCanvasField,
  node: Pick<PartsTemplateMappingCanvasNode, "tone">,
) {
  return applyFieldMappingOptions(field, getNodeFieldOptions(node.tone ?? "part"));
}

function applyFieldToEdge(field: PartsTemplateMappingCanvasField) {
  return applyFieldMappingOptions(field, getRelationFieldOptions());
}

function getDatasetDefinition(datasetId: CanvasDatasetId) {
  return DATASET_DEFINITIONS.find((dataset) => dataset.id === datasetId) ?? DATASET_DEFINITIONS[0];
}

function buildDatasetGraph(datasetId: CanvasDatasetId) {
  const dataset = getDatasetDefinition(datasetId);
  const laidOutGraph = layoutDatasetGraph(dataset.nodes, dataset.edges);

  return normalizeGraphProperties(
    {
      nodes: laidOutGraph.nodes,
      edges: laidOutGraph.edges,
      unassignedProperties: cloneFields(dataset.unassignedProperties),
    },
    dataset.previewHeaders,
  );
}

function movePropertyInGraph(
  graph: CanvasDatasetGraph,
  request: PartsTemplateMappingCanvasPropertyMoveRequest,
  headerOrder: string[],
) {
  const property = { ...request.property };
  const nextNodes = cloneNodes(graph.nodes).map((node) => ({
    ...node,
    fields: (node.fields ?? []).filter((field) => field.id !== property.id),
  }));
  const nextEdges = cloneEdges(graph.edges).map((edge) => ({
    ...edge,
    properties: (edge.properties ?? []).filter((item) => item.id !== property.id),
  }));
  let nextUnassigned = graph.unassignedProperties.filter((item) => item.id !== property.id);

  if (request.target.kind === "node") {
    const targetId = request.target.id;
    const targetNode = nextNodes.find((node) => node.id === targetId);
    const nextProperty = targetNode ? applyFieldToNode(property, targetNode) : property;

    return normalizeGraphProperties(
      {
        nodes: nextNodes.map((node) =>
          node.id === targetId
            ? {
                ...node,
                fields: [...(node.fields ?? []), nextProperty],
              }
            : node,
        ),
        edges: nextEdges,
        unassignedProperties: nextUnassigned,
      },
      headerOrder,
    );
  }

  if (request.target.kind === "edge") {
    const targetId = request.target.id;
    const nextProperty = applyFieldToEdge(property);

    return normalizeGraphProperties(
      {
        nodes: nextNodes,
        edges: nextEdges.map((edge) =>
          edge.id === targetId
            ? {
                ...edge,
                properties: [...(edge.properties ?? []), nextProperty],
              }
            : edge,
        ),
        unassignedProperties: nextUnassigned,
      },
      headerOrder,
    );
  }

  nextUnassigned = [...nextUnassigned, clearFieldMappingContext(property)];

  return normalizeGraphProperties(
    {
      nodes: nextNodes,
      edges: nextEdges,
      unassignedProperties: nextUnassigned,
    },
    headerOrder,
  );
}

function updateFieldMappingInGraph(
  graph: CanvasDatasetGraph,
  request: PartsTemplateMappingCanvasFieldMappingEngineeringChange,
  headerOrder: string[],
) {
  if (request.owner.kind === "node") {
    return normalizeGraphProperties(
      {
        ...graph,
        nodes: graph.nodes.map((node) =>
          node.id === request.owner.id
            ? {
                ...node,
                fields: (node.fields ?? []).map((field) =>
                  field.id === request.fieldId
                    ? {
                        ...field,
                        mappedValue: request.value,
                      }
                    : field,
                ),
              }
            : node,
        ),
      },
      headerOrder,
    );
  }

  return normalizeGraphProperties(
    {
      ...graph,
      edges: graph.edges.map((edge) =>
        edge.id === request.owner.id
          ? {
              ...edge,
              properties: (edge.properties ?? []).map((field) =>
                field.id === request.fieldId
                  ? {
                      ...field,
                      mappedValue: request.value,
                    }
                  : field,
              ),
            }
          : edge,
      ),
    },
    headerOrder,
  );
}

function PartsTemplateMappingCanvasScreenStory({
  startEmpty = false,
  withSourcePreview = false,
  mode = "playground",
}: {
  startEmpty?: boolean;
  withSourcePreview?: boolean;
  mode?: "default" | "playground";
}) {
  const initialGraph = startEmpty
    ? {
        nodes: [] as PartsTemplateMappingCanvasNode[],
        edges: [] as PartsTemplateMappingCanvasEdge[],
        unassignedProperties: [] as PartsTemplateMappingCanvasField[],
      }
    : buildDatasetGraph(DEFAULT_DATASET_ID);
  const [activeDatasetId, setActiveDatasetId] = useState<CanvasDatasetId>(DEFAULT_DATASET_ID);
  const [canvasVersion, setCanvasVersion] = useState(0);
  const [graph, setGraph] = useState<CanvasDatasetGraph>(initialGraph);
  const activeDataset = getDatasetDefinition(activeDatasetId);
  const activePreviewHeaders = activeDataset.previewHeaders;
  const { nodes, edges, unassignedProperties } = graph;
  const isDefaultMode = mode === "default";
  const previewHeaderOwners = buildPreviewHeaderOwnerMap(graph);

  function loadDataset(datasetId: CanvasDatasetId) {
    const nextGraph = buildDatasetGraph(datasetId);

    setActiveDatasetId(datasetId);
    setGraph(nextGraph);
    setCanvasVersion((current) => current + 1);
  }

  function resetGraph() {
    setGraph(buildDatasetGraph(activeDatasetId));
  }

  function addNode(type: PartsTemplateMappingCanvasNodeTone) {
    const definition = buildNodeDefinition(type);

    setGraph((current) =>
      normalizeGraphProperties(
        {
          ...current,
          nodes: [
            ...current.nodes,
            {
              id: `${type}-${current.nodes.length + 1}`,
              x: WORKAREA_CENTER_X - NEW_NODE_GAP_X + (current.nodes.length % 3) * NEW_NODE_GAP_X,
              y: WORKAREA_CENTER_Y - 240 + Math.floor(current.nodes.length / 3) * NEW_NODE_GAP_Y,
              ...definition,
              fields: definition.fields?.map((field) => ({
                ...field,
                id: `${field.id}-${current.nodes.length + 1}`,
              })),
            },
          ],
        },
        activePreviewHeaders,
      ),
    );
  }

  return (
    <PartsTemplateMappingCanvasScreen
      key={`${activeDatasetId}-${canvasVersion}`}
      addableNodeTones={isDefaultMode ? undefined : ["supplier", "part", "drawing", "project"]}
      description={activeDataset.description}
      edges={edges}
      emptyState={{
        title: "캔버스 실험 보드가 비어 있습니다",
        description: "선택한 예시를 불러오면 배치와 연결 구성을 바로 확인할 수 있습니다.",
        actionLabel: "선택한 예시 불러오기",
        onActionClick: () => loadDataset(activeDatasetId),
      }}
      fileName={activeDataset.fileName}
      headerContent={
        isDefaultMode ? (
          <CanvasAppliedHeader
            fileName={activeDataset.fileName}
            onResetClick={() => loadDataset(activeDatasetId)}
          />
        ) : undefined
      }
      sourcePreviewContent={
        withSourcePreview ? (
          <CanvasDatasetSourcePreview dataset={activeDataset} headerOwners={previewHeaderOwners} />
        ) : undefined
      }
      headerActions={(
        isDefaultMode ? undefined : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground/80">
              테스트 데이터셋
            </span>
            {DATASET_DEFINITIONS.map((dataset) => (
              <Button
                key={dataset.id}
                aria-pressed={dataset.id === activeDatasetId}
                size="sm"
                variant={dataset.id === activeDatasetId ? "default" : "outline"}
                onClick={() => loadDataset(dataset.id)}
              >
                {dataset.label}
              </Button>
            ))}
          </div>
        )
      )}
      nodes={nodes}
      onAddNode={isDefaultMode ? undefined : addNode}
      onConnect={({ sourceId, targetId }) => {
        const source = nodes.find((node) => node.id === sourceId);
        const target = nodes.find((node) => node.id === targetId);
        const existingEdge = edges.find(
          (edge) =>
            (edge.sourceId === sourceId && edge.targetId === targetId) ||
            (edge.sourceId === targetId && edge.targetId === sourceId),
        );
        const nextEdgeId = `edge-${sourceId}-${targetId}`;

        if (existingEdge) {
          return {
            status: "rejected" as const,
            title: "관계를 연결할 수 없습니다",
            description: "같은 카드 사이에는 연결을 두 번 만들 수 없습니다.",
            confirmLabel: "확인",
          };
        }

        setGraph((current) =>
          normalizeGraphProperties(
            {
              ...current,
              edges: [
                ...current.edges,
                {
                  id: nextEdgeId,
                  sourceId,
                  targetId,
                  label:
                    source && target
                      ? resolvePartsTemplateMappingCanvasRelationLabel(source.tone, target.tone)
                      : "관계",
                  ...(source && target ? buildEdgeCardPosition(source, target) : {}),
                  properties: [],
                },
              ],
            },
            activePreviewHeaders,
          ),
        );

        return nextEdgeId;
      }}
      onDeleteEdge={(edgeId) => {
        setGraph((current) => {
          const removedEdge = current.edges.find((edge) => edge.id === edgeId);

          return normalizeGraphProperties(
            {
              ...current,
              edges: current.edges.filter((edge) => edge.id !== edgeId),
              unassignedProperties: [
                ...current.unassignedProperties,
                ...(removedEdge?.properties ?? []).map((field) => clearFieldMappingContext(field)),
              ],
            },
            activePreviewHeaders,
          );
        });
      }}
      onDeleteNode={(nodeId) => {
        setGraph((current) => {
          const removedNode = current.nodes.find((node) => node.id === nodeId);
          const removedEdges = current.edges.filter(
            (edge) => edge.sourceId === nodeId || edge.targetId === nodeId,
          );

          return normalizeGraphProperties(
            {
              nodes: current.nodes.filter((node) => node.id !== nodeId),
              edges: current.edges.filter(
                (edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId,
              ),
              unassignedProperties: [
                ...current.unassignedProperties,
                ...(removedNode?.fields ?? []).map((field) => clearFieldMappingContext(field)),
                ...removedEdges.flatMap((edge) => (edge.properties ?? []).map((field) => clearFieldMappingContext(field))),
              ],
            },
            activePreviewHeaders,
          );
        });
      }}
      onEdgePositionChange={(edgeId, position) => {
        setGraph((current) => ({
          ...current,
          edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...position } : edge)),
        }));
      }}
      onFieldMappingChange={(request) => {
        setGraph((current) => updateFieldMappingInGraph(current, request, activePreviewHeaders));
      }}
      onMoveProperty={(request) => {
        setGraph((current) => movePropertyInGraph(current, request, activePreviewHeaders));
      }}
      onNodePositionChange={(nodeId, position) => {
        setGraph((current) => ({
          ...current,
          nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, ...position } : node)),
        }));
      }}
      onResetNodes={resetGraph}
      title={isDefaultMode ? "매핑 확인" : `테스트 데이터셋 / ${activeDataset.label}`}
      unassignedProperties={unassignedProperties}
    />
  );
}

const meta = {
  title: "Components/PartsTemplateMappingCanvasScreen",
  component: PartsTemplateMappingCanvasScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartsTemplateMappingCanvasScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartsTemplateMappingCanvasScreenStory withSourcePreview mode="default" />,
};

export const Playground: Story = {
  render: () => <PartsTemplateMappingCanvasScreenStory />,
};

export const EmptyState: Story = {
  render: () => <PartsTemplateMappingCanvasScreenStory startEmpty />,
};
