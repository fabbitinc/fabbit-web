import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  PartsTemplateMappingCanvasScreen,
  type PartsTemplateMappingCanvasEdge,
  type PartsTemplateMappingCanvasNode,
  type PartsTemplateMappingCanvasNodeTone,
} from "@fabbit/components";

const WORKAREA_CENTER_X = 2100;
const WORKAREA_CENTER_Y = 1400;
const NODE_GAP_X = 460;
const NODE_GAP_Y = 320;

function cloneNodes(nodes: PartsTemplateMappingCanvasNode[]) {
  return nodes.map((node) => ({
    ...node,
    fields: node.fields?.map((field) => ({ ...field })),
  }));
}

function cloneEdges(edges: PartsTemplateMappingCanvasEdge[]) {
  return edges.map((edge) => ({ ...edge }));
}

function buildNodeDefinition(type: PartsTemplateMappingCanvasNodeTone): Omit<PartsTemplateMappingCanvasNode, "id" | "x" | "y"> {
  switch (type) {
    case "supplier":
      return {
        title: "공급사",
        subtitle: "파트너",
        description: "공급사 정보",
        tone: "supplier",
        fields: [
          { id: "supplier-code", label: "공급사 코드", hint: "거래처 식별" },
          { id: "supplier-name", label: "공급사명", hint: "표시 이름" },
        ],
      };
    case "drawing":
      return {
        title: "도면",
        subtitle: "문서",
        description: "도면 참조 정보",
        tone: "drawing",
        fields: [
          { id: "drawing-no", label: "도면 번호", hint: "문서 키" },
          { id: "revision", label: "개정", hint: "버전 정보" },
        ],
      };
    case "project":
      return {
        title: "프로젝트",
        subtitle: "컨텍스트",
        description: "프로젝트 기준 정보",
        tone: "project",
        fields: [
          { id: "project-code", label: "프로젝트 코드", hint: "관리 코드" },
          { id: "project-name", label: "프로젝트명", hint: "대표 이름" },
        ],
      };
    default:
      return {
        title: "부품",
        subtitle: "핵심",
        description: "부품 기본 정보",
        tone: "part",
        fields: [
          { id: "part-number", label: "품번", hint: "식별 키" },
          { id: "part-name", label: "품명", hint: "대표 이름" },
        ],
      };
  }
}

const INITIAL_NODES: PartsTemplateMappingCanvasNode[] = [
  {
    id: "part-master",
    title: "부품",
    subtitle: "핵심",
    description: "부품 기본 정보",
    tone: "part",
    x: WORKAREA_CENTER_X - 130,
    y: WORKAREA_CENTER_Y - 180,
    fields: [
      { id: "part-number", label: "품번", hint: "식별 키" },
      { id: "part-name", label: "품명", hint: "대표 이름" },
    ],
  },
  {
    id: "supplier-link",
    title: "공급사",
    subtitle: "파트너",
    description: "공급사 정보",
    tone: "supplier",
    x: WORKAREA_CENTER_X - NODE_GAP_X - 120,
    y: WORKAREA_CENTER_Y - 150,
    fields: [
      { id: "supplier-code", label: "공급사 코드", hint: "거래처 식별" },
      { id: "supplier-name", label: "공급사명", hint: "표시 이름" },
    ],
  },
  {
    id: "drawing-doc",
    title: "도면",
    subtitle: "문서",
    description: "도면 참조 정보",
    tone: "drawing",
    x: WORKAREA_CENTER_X + NODE_GAP_X - 140,
    y: WORKAREA_CENTER_Y - 150,
    fields: [
      { id: "drawing-no", label: "도면 번호", hint: "문서 키" },
      { id: "revision", label: "개정", hint: "버전 정보" },
    ],
  },
  {
    id: "project-info",
    title: "프로젝트",
    subtitle: "컨텍스트",
    description: "프로젝트 기준 정보",
    tone: "project",
    x: WORKAREA_CENTER_X - 130,
    y: WORKAREA_CENTER_Y + NODE_GAP_Y - 140,
    fields: [
      { id: "project-code", label: "프로젝트 코드", hint: "관리 코드" },
      { id: "project-name", label: "프로젝트명", hint: "대표 이름" },
    ],
  },
];

const INITIAL_EDGES: PartsTemplateMappingCanvasEdge[] = [
  {
    id: "edge-supplier-part",
    sourceId: "supplier-link",
    targetId: "part-master",
    label: "공급",
  },
  {
    id: "edge-drawing-part",
    sourceId: "drawing-doc",
    targetId: "part-master",
    label: "참조",
  },
  {
    id: "edge-project-part",
    sourceId: "project-info",
    targetId: "part-master",
    label: "관리",
    kind: "dashed",
  },
];

function PartsTemplateMappingCanvasScreenStory({
  startEmpty = false,
}: {
  startEmpty?: boolean;
}) {
  const [nodes, setNodes] = useState<PartsTemplateMappingCanvasNode[]>(
    startEmpty ? [] : cloneNodes(INITIAL_NODES),
  );
  const [edges, setEdges] = useState<PartsTemplateMappingCanvasEdge[]>(
    startEmpty ? [] : cloneEdges(INITIAL_EDGES),
  );

  function resetGraph() {
    setNodes(cloneNodes(INITIAL_NODES));
    setEdges(cloneEdges(INITIAL_EDGES));
  }

  function addNode(type: PartsTemplateMappingCanvasNodeTone) {
    const definition = buildNodeDefinition(type);

    setNodes((current) => [
      ...current,
      {
        id: `${type}-${current.length + 1}`,
        x: WORKAREA_CENTER_X - NODE_GAP_X + (current.length % 3) * NODE_GAP_X,
        y: WORKAREA_CENTER_Y - 240 + Math.floor(current.length / 3) * NODE_GAP_Y,
        ...definition,
        fields: definition.fields?.map((field) => ({
          ...field,
          id: `${field.id}-${current.length + 1}`,
        })),
      },
    ]);
  }

  return (
    <PartsTemplateMappingCanvasScreen
      addableNodeTones={["supplier", "part", "drawing", "project"]}
      description="공급사, 부품, 도면, 프로젝트 노드를 추가하고 연결 흐름을 실험합니다."
      edges={edges}
      emptyState={{
        title: "캔버스 실험 보드가 비어 있습니다",
        description: "샘플 노드를 불러와 연결 UX와 시각 구성을 바로 테스트할 수 있습니다.",
        actionLabel: "샘플 보드 불러오기",
        onActionClick: resetGraph,
      }}
      fileName="공급사_부품_도면_프로젝트_실험보드.fig"
      nodes={nodes}
      onAddNode={addNode}
      onConnect={({ sourceId, targetId }) => {
        setEdges((current) => {
          if (current.some((edge) => edge.sourceId === sourceId && edge.targetId === targetId)) {
            return current;
          }

          const source = nodes.find((node) => node.id === sourceId);
          const target = nodes.find((node) => node.id === targetId);

          return [
            ...current,
            {
              id: `edge-${sourceId}-${targetId}-${current.length + 1}`,
              sourceId,
              targetId,
              label: source && target ? `${source.title} -> ${target.title}` : undefined,
            },
          ];
        });
      }}
      onDeleteEdge={(edgeId) => {
        setEdges((current) => current.filter((edge) => edge.id !== edgeId));
      }}
      onDeleteNode={(nodeId) => {
        setNodes((current) => current.filter((node) => node.id !== nodeId));
        setEdges((current) => current.filter((edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId));
      }}
      onNodePositionChange={(nodeId, position) => {
        setNodes((current) =>
          current.map((node) => (node.id === nodeId ? { ...node, ...position } : node)),
        );
      }}
      onResetNodes={resetGraph}
      title="공급사 / 부품 / 도면 / 프로젝트"
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
