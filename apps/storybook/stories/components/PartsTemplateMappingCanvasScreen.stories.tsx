import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  PartsTemplateMappingCanvasScreen,
  resolvePartsTemplateMappingCanvasRelationLabel,
  type PartsTemplateMappingCanvasEdge,
  type PartsTemplateMappingCanvasNode,
  type PartsTemplateMappingCanvasNodeTone,
  type PartsTemplateMappingCanvasField,
  type PartsTemplateMappingCanvasPropertyMoveRequest,
} from "@fabbit/components";
import { Button } from "@fabbit/ui";

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

interface CanvasDatasetDefinition {
  id: CanvasDatasetId;
  label: string;
  fileName: string;
  description: string;
  nodes: PartsTemplateMappingCanvasNode[];
  edges: PartsTemplateMappingCanvasEdge[];
  unassignedProperties: PartsTemplateMappingCanvasField[];
}

interface CanvasDatasetGraph {
  nodes: PartsTemplateMappingCanvasNode[];
  edges: PartsTemplateMappingCanvasEdge[];
  unassignedProperties: PartsTemplateMappingCanvasField[];
}

function cloneNodes(nodes: PartsTemplateMappingCanvasNode[]) {
  return nodes.map((node) => ({
    ...node,
    fields: node.fields?.map((field) => ({ ...field })),
  }));
}

function cloneFields(fields: PartsTemplateMappingCanvasField[]) {
  return fields.map((field) => ({ ...field }));
}

function cloneEdges(edges: PartsTemplateMappingCanvasEdge[]) {
  return edges.map((edge) => ({
    ...edge,
    properties: edge.properties?.map((property) => ({ ...property })),
  }));
}

function getPropertyOrder(label: string) {
  const index = PROPERTY_LABEL_ORDER.indexOf(label as (typeof PROPERTY_LABEL_ORDER)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortCanvasProperties(properties: PartsTemplateMappingCanvasField[]) {
  return cloneFields(properties).sort((left, right) => {
    const orderGap = getPropertyOrder(left.label) - getPropertyOrder(right.label);

    if (orderGap !== 0) {
      return orderGap;
    }

    return left.label.localeCompare(right.label, "ko");
  });
}

function getNodeHeight(
  node: Pick<PartsTemplateMappingCanvasNode, "fields" | "description">,
) {
  const descriptionHeight = node.description ? 48 : 0;
  const fieldHeight = (node.fields?.length ?? 0) * 28;
  return 108 + descriptionHeight + fieldHeight;
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
  fields: Array<{ label: string; hint: string }>;
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
    fields: fields.map((field, index) => ({
      id: `${id}-field-${index + 1}`,
      label: field.label,
      hint: field.hint,
    })),
  };
}

function buildRelationProperties(
  edgeId: string,
  sourceTitle: string,
  targetTitle: string,
): PartsTemplateMappingCanvasEdge["properties"] {
  return [
    {
      id: `${edgeId}-key`,
      label: "연결 키",
      hint: `${sourceTitle} -> ${targetTitle}`,
    },
    {
      id: `${edgeId}-rule`,
      label: "적용 규칙",
      hint: "관계 조건 설정",
    },
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
          { label: "품번", hint: "식별 키" },
          { label: "품명", hint: "대표 이름" },
          { label: "규격", hint: "기본 규격" },
          { label: "재질", hint: "소재 정보" },
        ],
      }),
    ],
    edges: [],
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
          { label: "품번", hint: "식별 키" },
          { label: "품명", hint: "대표 이름" },
          { label: "분류", hint: "카테고리" },
        ],
      }),
      buildDatasetNode({
        id: "pair-drawing",
        tone: "drawing",
        fields: [
          { label: "도면 번호", hint: "문서 키" },
          { label: "개정", hint: "버전 정보" },
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
          { label: "품번", hint: "식별 키" },
          { label: "품명", hint: "대표 이름" },
          { label: "규격", hint: "기본 규격" },
          { label: "재질", hint: "소재 정보" },
        ],
      }),
      buildDatasetNode({
        id: "multi-drawing",
        tone: "drawing",
        fields: [
          { label: "도면 번호", hint: "문서 키" },
          { label: "개정", hint: "버전 정보" },
        ],
      }),
      buildDatasetNode({
        id: "multi-supplier",
        tone: "supplier",
        fields: [
          { label: "공급사 코드", hint: "거래처 식별" },
          { label: "공급사명", hint: "표시 이름" },
        ],
      }),
      buildDatasetNode({
        id: "multi-project",
        tone: "project",
        subtitle: "컨텍스트",
        description: "프로젝트 정보",
        fields: [
          { label: "프로젝트 코드", hint: "관리 코드" },
          { label: "프로젝트명", hint: "대표 이름" },
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

function normalizeGraphProperties(graph: CanvasDatasetGraph) {
  return {
    nodes: cloneNodes(graph.nodes).map((node) => ({
      ...node,
      fields: sortCanvasProperties(node.fields ?? []),
    })),
    edges: cloneEdges(graph.edges).map((edge) => ({
      ...edge,
      properties: sortCanvasProperties(edge.properties ?? []),
    })),
    unassignedProperties: sortCanvasProperties(graph.unassignedProperties),
  };
}

function getDatasetDefinition(datasetId: CanvasDatasetId) {
  return DATASET_DEFINITIONS.find((dataset) => dataset.id === datasetId) ?? DATASET_DEFINITIONS[0];
}

function buildDatasetGraph(datasetId: CanvasDatasetId) {
  const dataset = getDatasetDefinition(datasetId);
  const laidOutGraph = layoutDatasetGraph(dataset.nodes, dataset.edges);

  return normalizeGraphProperties({
    nodes: laidOutGraph.nodes,
    edges: laidOutGraph.edges,
    unassignedProperties: cloneFields(dataset.unassignedProperties),
  });
}

function movePropertyInGraph(
  graph: CanvasDatasetGraph,
  request: PartsTemplateMappingCanvasPropertyMoveRequest,
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

    return normalizeGraphProperties({
      nodes: nextNodes.map((node) =>
        node.id === targetId
          ? {
              ...node,
              fields: [...(node.fields ?? []), property],
            }
          : node,
      ),
      edges: nextEdges,
      unassignedProperties: nextUnassigned,
    });
  }

  if (request.target.kind === "edge") {
    const targetId = request.target.id;

    return normalizeGraphProperties({
      nodes: nextNodes,
      edges: nextEdges.map((edge) =>
        edge.id === targetId
          ? {
              ...edge,
              properties: [...(edge.properties ?? []), property],
            }
          : edge,
      ),
      unassignedProperties: nextUnassigned,
    });
  }

  nextUnassigned = [...nextUnassigned, property];

  return normalizeGraphProperties({
    nodes: nextNodes,
    edges: nextEdges,
    unassignedProperties: nextUnassigned,
  });
}

function PartsTemplateMappingCanvasScreenStory({
  startEmpty = false,
}: {
  startEmpty?: boolean;
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
  const { nodes, edges, unassignedProperties } = graph;

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
      normalizeGraphProperties({
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
      }),
    );
  }

  return (
    <PartsTemplateMappingCanvasScreen
      key={`${activeDatasetId}-${canvasVersion}`}
      addableNodeTones={["supplier", "part", "drawing", "project"]}
      description={activeDataset.description}
      edges={edges}
      emptyState={{
        title: "캔버스 실험 보드가 비어 있습니다",
        description: "선택한 예시를 불러오면 배치와 연결 구성을 바로 확인할 수 있습니다.",
        actionLabel: "선택한 예시 불러오기",
        onActionClick: () => loadDataset(activeDatasetId),
      }}
      fileName={activeDataset.fileName}
      headerActions={(
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
      )}
      nodes={nodes}
      onAddNode={addNode}
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
          normalizeGraphProperties({
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
          }),
        );

        return nextEdgeId;
      }}
      onDeleteEdge={(edgeId) => {
        setGraph((current) => {
          const removedEdge = current.edges.find((edge) => edge.id === edgeId);

          return normalizeGraphProperties({
            ...current,
            edges: current.edges.filter((edge) => edge.id !== edgeId),
            unassignedProperties: [
              ...current.unassignedProperties,
              ...(removedEdge?.properties ?? []),
            ],
          });
        });
      }}
      onDeleteNode={(nodeId) => {
        setGraph((current) => {
          const removedNode = current.nodes.find((node) => node.id === nodeId);
          const removedEdges = current.edges.filter(
            (edge) => edge.sourceId === nodeId || edge.targetId === nodeId,
          );

          return normalizeGraphProperties({
            nodes: current.nodes.filter((node) => node.id !== nodeId),
            edges: current.edges.filter(
              (edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId,
            ),
            unassignedProperties: [
              ...current.unassignedProperties,
              ...(removedNode?.fields ?? []),
              ...removedEdges.flatMap((edge) => edge.properties ?? []),
            ],
          });
        });
      }}
      onEdgePositionChange={(edgeId, position) => {
        setGraph((current) => ({
          ...current,
          edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...position } : edge)),
        }));
      }}
      onMoveProperty={(request) => {
        setGraph((current) => movePropertyInGraph(current, request));
      }}
      onNodePositionChange={(nodeId, position) => {
        setGraph((current) => ({
          ...current,
          nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, ...position } : node)),
        }));
      }}
      onResetNodes={resetGraph}
      title={`테스트 데이터셋 / ${activeDataset.label}`}
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

export const Playground: Story = {
  render: () => <PartsTemplateMappingCanvasScreenStory />,
};

export const EmptyState: Story = {
  render: () => <PartsTemplateMappingCanvasScreenStory startEmpty />,
};
