import {
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AlertTriangle, ChevronDown, Grip, Link2, Plus, ScanSearch, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import {
  Badge,
  Button,
  cn,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import "./parts-template-mapping-canvas-screen.css";

const CANVAS_WIDTH = 4200;
const CANVAS_HEIGHT = 2800;
const NODE_WIDTH = 260;
const EDGE_CARD_WIDTH = 196;
const EDGE_CARD_OFFSET_Y = 54;
const EDGE_CARD_EMPTY_HEIGHT = 132;
const CANVAS_SAFE_MARGIN = 96;
const WORKAREA_WIDTH = CANVAS_WIDTH - CANVAS_SAFE_MARGIN * 2;
const WORKAREA_HEIGHT = CANVAS_HEIGHT - CANVAS_SAFE_MARGIN * 2;
const FIT_VIEW_PADDING = 120;
const MIN_VIEWPORT_SCALE = 0.45;
const MAX_VIEWPORT_SCALE = 1.9;
const NODE_HEADER_HEIGHT = 72;
const NODE_FOOTER_HEIGHT = 68;
const NODE_PROPERTY_SECTION_PADDING = 32;
const NODE_PROPERTY_EMPTY_HEIGHT = 56;
const PROPERTY_ROW_HEIGHT = 56;
const PROPERTY_ROW_GAP = 8;
const FIELD_UNMAPPED_SELECT_VALUE = "__unmapped__";
const DEFAULT_VIEWPORT = {
  x: 140,
  y: 100,
  scale: 0.8,
};

export type PartsTemplateMappingCanvasNodeTone =
  | "supplier"
  | "part"
  | "drawing"
  | "project";

export interface PartsTemplateMappingCanvasFieldOption {
  value: string;
  label: string;
}

export interface PartsTemplateMappingCanvasField {
  id: string;
  label: string;
  hint?: string;
  mappedValue?: string | null;
  mappingOptions?: PartsTemplateMappingCanvasFieldOption[];
}

export type PartsTemplateMappingCanvasPropertyOwner =
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "unassigned" };

export type PartsTemplateMappingCanvasFieldOwner = Exclude<
  PartsTemplateMappingCanvasPropertyOwner,
  { kind: "unassigned" }
>;

export interface PartsTemplateMappingCanvasPropertyMoveRequest {
  property: PartsTemplateMappingCanvasField;
  source: PartsTemplateMappingCanvasPropertyOwner;
  target: PartsTemplateMappingCanvasPropertyOwner;
}

export interface PartsTemplateMappingCanvasFieldMappingChangeRequest {
  owner: PartsTemplateMappingCanvasFieldOwner;
  fieldId: string;
  value: string | null;
}

export interface PartsTemplateMappingCanvasNode {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  tone?: PartsTemplateMappingCanvasNodeTone;
  x: number;
  y: number;
  fields?: PartsTemplateMappingCanvasField[];
}

export interface PartsTemplateMappingCanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  kind?: "solid" | "dashed";
  properties?: PartsTemplateMappingCanvasField[];
  x?: number;
  y?: number;
}

export interface PartsTemplateMappingCanvasEmptyState {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export interface PartsTemplateMappingCanvasConnectCreatedResult {
  status: "created";
  edgeId?: string;
}

export interface PartsTemplateMappingCanvasConnectRejectedResult {
  status: "rejected";
  title: string;
  description: string;
  confirmLabel?: string;
}

export type PartsTemplateMappingCanvasConnectResult =
  | string
  | void
  | PartsTemplateMappingCanvasConnectCreatedResult
  | PartsTemplateMappingCanvasConnectRejectedResult;

function isConnectRejectedResult(
  result: PartsTemplateMappingCanvasConnectResult,
): result is PartsTemplateMappingCanvasConnectRejectedResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "status" in result &&
    result.status === "rejected"
  );
}

function isConnectCreatedResult(
  result: PartsTemplateMappingCanvasConnectResult,
): result is PartsTemplateMappingCanvasConnectCreatedResult {
  return (
    typeof result === "object" &&
    result !== null &&
    "status" in result &&
    result.status === "created"
  );
}

export interface PartsTemplateMappingCanvasScreenProps {
  addableNodeTones?: PartsTemplateMappingCanvasNodeTone[];
  description?: string;
  edges: PartsTemplateMappingCanvasEdge[];
  emptyState?: PartsTemplateMappingCanvasEmptyState;
  fileName?: string;
  headerContent?: ReactNode;
  headerActions?: ReactNode;
  nodes: PartsTemplateMappingCanvasNode[];
  onAddNode?: (tone: PartsTemplateMappingCanvasNodeTone) => void;
  onConnect?: (connection: {
    sourceId: string;
    targetId: string;
  }) => PartsTemplateMappingCanvasConnectResult;
  onDeleteEdge?: (edgeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onEdgePositionChange?: (edgeId: string, position: { x: number; y: number }) => void;
  onFieldMappingChange?: (request: PartsTemplateMappingCanvasFieldMappingChangeRequest) => void;
  onMoveProperty?: (request: PartsTemplateMappingCanvasPropertyMoveRequest) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  onResetNodes?: () => void;
  sourcePreviewContent?: ReactNode;
  title?: string;
  unassignedProperties?: PartsTemplateMappingCanvasField[];
}

const DEFAULT_ADDABLE_NODE_TONES: PartsTemplateMappingCanvasNodeTone[] = [
  "supplier",
  "part",
  "drawing",
  "project",
];

export function resolvePartsTemplateMappingCanvasRelationLabel(
  sourceTone?: PartsTemplateMappingCanvasNodeTone,
  targetTone?: PartsTemplateMappingCanvasNodeTone,
) {
  const leftTone = sourceTone ?? "part";
  const rightTone = targetTone ?? "part";

  if (leftTone === "part" && rightTone === "part") {
    return "상위 부품";
  }

  if ((leftTone === "part" && rightTone === "drawing") || (leftTone === "drawing" && rightTone === "part")) {
    return "참조";
  }

  if ((leftTone === "part" && rightTone === "supplier") || (leftTone === "supplier" && rightTone === "part")) {
    return "공급";
  }

  if ((leftTone === "part" && rightTone === "project") || (leftTone === "project" && rightTone === "part")) {
    return "관리";
  }

  return "관계";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNodeHeight(node: PartsTemplateMappingCanvasNode) {
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

function getNodeCenterPoint(node: PartsTemplateMappingCanvasNode) {
  return {
    x: node.x + NODE_WIDTH / 2,
    y: node.y + getNodeHeight(node) / 2,
  };
}

function buildEdgePath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const curve = Math.max(96, Math.abs(end.x - start.x) * 0.45);
  return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`;
}

function getEdgeCardPosition(start: { x: number; y: number }, end: { x: number; y: number }) {
  return {
    x: (start.x + end.x) / 2 - EDGE_CARD_WIDTH / 2,
    y: (start.y + end.y) / 2 - EDGE_CARD_OFFSET_Y,
  };
}

function getEdgeCardHeight(edge: PartsTemplateMappingCanvasEdge) {
  const propertyCount = edge.properties?.length ?? 0;

  if (propertyCount === 0) {
    return EDGE_CARD_EMPTY_HEIGHT;
  }

  return 96 + propertyCount * 54 + (propertyCount - 1) * 8;
}

function getEdgeCardAnchorPoint(
  cardPosition: { x: number; y: number },
  edge: PartsTemplateMappingCanvasEdge,
) {
  return {
    x: cardPosition.x + EDGE_CARD_WIDTH / 2,
    y: cardPosition.y + getEdgeCardHeight(edge) / 2,
  };
}

function isEdgeConnectedToNode(edge: PartsTemplateMappingCanvasEdge, nodeId: string | null) {
  if (!nodeId) {
    return false;
  }

  return edge.sourceId === nodeId || edge.targetId === nodeId;
}

function getNodeToneLabel(tone: PartsTemplateMappingCanvasNodeTone) {
  switch (tone) {
    case "supplier":
      return "공급사";
    case "drawing":
      return "도면";
    case "project":
      return "프로젝트";
    default:
      return "부품";
  }
}

function isSamePropertyOwner(
  left: PartsTemplateMappingCanvasPropertyOwner,
  right: PartsTemplateMappingCanvasPropertyOwner,
) {
  const leftId = left.kind === "unassigned" ? null : left.id;
  const rightId = right.kind === "unassigned" ? null : right.id;

  return left.kind === right.kind && leftId === rightId;
}

function canMovePropertyBetweenOwners(
  source: PartsTemplateMappingCanvasPropertyOwner,
  target: PartsTemplateMappingCanvasPropertyOwner,
) {
  if (isSamePropertyOwner(source, target)) {
    return false;
  }

  if (source.kind === "unassigned") {
    return target.kind === "node" || target.kind === "edge";
  }

  if (source.kind === "node") {
    return target.kind === "edge" || target.kind === "unassigned";
  }

  return target.kind === "node" || target.kind === "unassigned";
}

function resolveCanvasFieldMappedLabel(field: PartsTemplateMappingCanvasField) {
  if (!field.mappedValue) {
    return null;
  }

  return field.mappingOptions?.find((option) => option.value === field.mappedValue)?.label ?? field.mappedValue;
}

interface DragStatePan {
  mode: "pan";
  originClientX: number;
  originClientY: number;
  originX: number;
  originY: number;
}

interface DragStateNode {
  mode: "node";
  nodeId: string;
  originClientX: number;
  originClientY: number;
  originNodeX: number;
  originNodeY: number;
}

interface DragStateEdge {
  mode: "edge";
  edgeId: string;
  originClientX: number;
  originClientY: number;
  originEdgeX: number;
  originEdgeY: number;
}

type DragState = DragStatePan | DragStateNode | DragStateEdge;

interface PendingDeleteState {
  id: string;
  kind: "node" | "edge";
  label: string;
}

interface ConnectionNoticeState {
  title: string;
  description: string;
  confirmLabel: string;
}

interface PropertyDragState {
  property: PartsTemplateMappingCanvasField;
  source: PartsTemplateMappingCanvasPropertyOwner;
}

export function PartsTemplateMappingCanvasScreen({
  addableNodeTones = DEFAULT_ADDABLE_NODE_TONES,
  description = "표 대신 캔버스에서 카드를 배치하고 연결 방식을 빠르게 살펴봅니다.",
  edges,
  emptyState,
  fileName = "부품_관계_실험보드.fig",
  headerContent,
  headerActions,
  nodes,
  onAddNode,
  onConnect,
  onDeleteEdge,
  onDeleteNode,
  onEdgePositionChange,
  onFieldMappingChange,
  onMoveProperty,
  onNodePositionChange,
  onResetNodes,
  sourcePreviewContent,
  title = "캔버스 매핑 실험실",
  unassignedProperties = [],
}: PartsTemplateMappingCanvasScreenProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const hasAutoFitRef = useRef(false);
  const viewportRef = useRef(DEFAULT_VIEWPORT);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id ?? null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [connectionNotice, setConnectionNotice] = useState<ConnectionNoticeState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);
  const [propertyDragState, setPropertyDragState] = useState<PropertyDragState | null>(null);
  const [propertyDropTarget, setPropertyDropTarget] = useState<PartsTemplateMappingCanvasPropertyOwner | null>(null);
  const [pointerWorld, setPointerWorld] = useState<{ x: number; y: number } | null>(null);
  const [isSelectedEditorCollapsed, setIsSelectedEditorCollapsed] = useState(false);
  const [isUnassignedCollapsed, setIsUnassignedCollapsed] = useState(false);
  const showPropertySidebar = Boolean(onMoveProperty || onFieldMappingChange || unassignedProperties.length > 0);
  const hasUnassignedProperties = unassignedProperties.length > 0;
  const selectedNode = selectedNodeId ? nodes.find((node) => node.id === selectedNodeId) ?? null : null;
  const selectedEdge = selectedEdgeId ? edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;
  const selectedEdgeSource = selectedEdge ? nodes.find((node) => node.id === selectedEdge.sourceId) ?? null : null;
  const selectedEdgeTarget = selectedEdge ? nodes.find((node) => node.id === selectedEdge.targetId) ?? null : null;
  const selectedEditor =
    selectedNode
      ? {
          owner: { kind: "node", id: selectedNode.id } as const,
          badge: selectedNode.title,
          title: `${selectedNode.title} 편집`,
          description: "카드 안 항목의 연결값을 편집할 수 있습니다.",
          fields: selectedNode.fields ?? [],
        }
      : selectedEdge
        ? {
            owner: { kind: "edge", id: selectedEdge.id } as const,
            badge: "연결",
            title: `${resolvePartsTemplateMappingCanvasRelationLabel(
              selectedEdgeSource?.tone,
              selectedEdgeTarget?.tone,
            )} 편집`,
            description: "관계 항목의 연결값을 편집할 수 있습니다.",
            fields: selectedEdge.properties ?? [],
          }
        : null;
  const selectedEditorKey = selectedEditor
    ? `${selectedEditor.owner.kind}:${selectedEditor.owner.id}`
    : null;

  useEffect(() => {
    if (selectedEditorKey) {
      setIsSelectedEditorCollapsed(false);
    }
  }, [selectedEditorKey]);

  function resolveEdgeCardPosition(edge: PartsTemplateMappingCanvasEdge) {
    if (typeof edge.x === "number" && typeof edge.y === "number") {
      return {
        x: edge.x,
        y: edge.y,
      };
    }

    const source = nodes.find((node) => node.id === edge.sourceId);
    const target = nodes.find((node) => node.id === edge.targetId);

    if (!source || !target) {
      return null;
    }

    return getEdgeCardPosition(getNodeCenterPoint(source), getNodeCenterPoint(target));
  }

  function toWorld(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const currentViewport = viewportRef.current;

    if (!rect) {
      return null;
    }

    return {
      x: (clientX - rect.left - currentViewport.x) / currentViewport.scale,
      y: (clientY - rect.top - currentViewport.y) / currentViewport.scale,
    };
  }

  function setViewportScale(nextScale: number, clientX?: number, clientY?: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const currentViewport = viewportRef.current;
    const clampedScale = clamp(nextScale, MIN_VIEWPORT_SCALE, MAX_VIEWPORT_SCALE);

    if (!rect) {
      setViewport((current) => ({ ...current, scale: clampedScale }));
      return;
    }

    const focusX = clientX ?? rect.left + rect.width / 2;
    const focusY = clientY ?? rect.top + rect.height / 2;
    const worldX = (focusX - rect.left - currentViewport.x) / currentViewport.scale;
    const worldY = (focusY - rect.top - currentViewport.y) / currentViewport.scale;

    setViewport({
      scale: clampedScale,
      x: focusX - rect.left - worldX * clampedScale,
      y: focusY - rect.top - worldY * clampedScale,
    });
  }

  function fitCanvasToNodes() {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect || nodes.length === 0) {
      setViewport(DEFAULT_VIEWPORT);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + NODE_WIDTH);
      maxY = Math.max(maxY, node.y + getNodeHeight(node));
    });

    edges.forEach((edge) => {
      const edgeCardPosition = resolveEdgeCardPosition(edge);

      if (!edgeCardPosition) {
        return;
      }

      minX = Math.min(minX, edgeCardPosition.x);
      minY = Math.min(minY, edgeCardPosition.y);
      maxX = Math.max(maxX, edgeCardPosition.x + EDGE_CARD_WIDTH);
      maxY = Math.max(maxY, edgeCardPosition.y + getEdgeCardHeight(edge));
    });

    const paddedMinX = minX - FIT_VIEW_PADDING;
    const paddedMinY = minY - FIT_VIEW_PADDING;
    const paddedWidth = Math.max(maxX - minX + FIT_VIEW_PADDING * 2, 1);
    const paddedHeight = Math.max(maxY - minY + FIT_VIEW_PADDING * 2, 1);
    const nextScale = clamp(
      Math.min(rect.width / paddedWidth, rect.height / paddedHeight),
      MIN_VIEWPORT_SCALE,
      MAX_VIEWPORT_SCALE,
    );

    setViewport({
      scale: nextScale,
      x: (rect.width - paddedWidth * nextScale) / 2 - paddedMinX * nextScale,
      y: (rect.height - paddedHeight * nextScale) / 2 - paddedMinY * nextScale,
    });
  }

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    if (nodes.length === 0) {
      hasAutoFitRef.current = false;
      setViewport(DEFAULT_VIEWPORT);
      return;
    }

    if (hasAutoFitRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      fitCanvasToNodes();
      hasAutoFitRef.current = true;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [nodes.length]);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    if (selectedEdgeId && !edges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(null);
    }
  }, [edges, selectedEdgeId]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (connectingNodeId) {
        const nextWorld = toWorld(event.clientX, event.clientY);

        if (nextWorld) {
          setPointerWorld(nextWorld);
        }
      }

      const dragState = dragStateRef.current;

      if (!dragState) {
        return;
      }

      if (dragState.mode === "pan") {
        setViewport((current) => ({
          ...current,
          x: dragState.originX + event.clientX - dragState.originClientX,
          y: dragState.originY + event.clientY - dragState.originClientY,
        }));
        return;
      }

      const currentScale = viewportRef.current.scale;

      if (dragState.mode === "node") {
        const nextX = clamp(
          dragState.originNodeX + (event.clientX - dragState.originClientX) / currentScale,
          CANVAS_SAFE_MARGIN,
          CANVAS_WIDTH - NODE_WIDTH - CANVAS_SAFE_MARGIN,
        );
        const nextY = clamp(
          dragState.originNodeY + (event.clientY - dragState.originClientY) / currentScale,
          CANVAS_SAFE_MARGIN,
          CANVAS_HEIGHT - getNodeHeight(nodes.find((node) => node.id === dragState.nodeId) ?? {
            id: dragState.nodeId,
            title: "",
            x: dragState.originNodeX,
            y: dragState.originNodeY,
          }) - CANVAS_SAFE_MARGIN,
        );

        onNodePositionChange?.(dragState.nodeId, { x: nextX, y: nextY });
        return;
      }

      const currentEdge = edges.find((edge) => edge.id === dragState.edgeId);
      const nextX = clamp(
        dragState.originEdgeX + (event.clientX - dragState.originClientX) / currentScale,
        CANVAS_SAFE_MARGIN,
        CANVAS_WIDTH - EDGE_CARD_WIDTH - CANVAS_SAFE_MARGIN,
      );
      const nextY = clamp(
        dragState.originEdgeY + (event.clientY - dragState.originClientY) / currentScale,
        CANVAS_SAFE_MARGIN,
        CANVAS_HEIGHT - getEdgeCardHeight(currentEdge ?? {
          id: dragState.edgeId,
          sourceId: "",
          targetId: "",
        }) - CANVAS_SAFE_MARGIN,
      );

      onEdgePositionChange?.(dragState.edgeId, { x: nextX, y: nextY });
    }

    function handlePointerUp() {
      dragStateRef.current = null;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setConnectingNodeId(null);
        setPointerWorld(null);
      }

      if ((event.key === "Backspace" || event.key === "Delete") && selectedEdgeId) {
        event.preventDefault();
        onDeleteEdge?.(selectedEdgeId);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [connectingNodeId, edges, nodes, onDeleteEdge, onEdgePositionChange, onNodePositionChange, selectedEdgeId]);

  function handleCanvasPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }

    const currentViewport = viewportRef.current;

    dragStateRef.current = {
      mode: "pan",
      originClientX: event.clientX,
      originClientY: event.clientY,
      originX: currentViewport.x,
      originY: currentViewport.y,
    };

    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setConnectingNodeId(null);
    setPointerWorld(null);
  }

  function handleNodePointerDown(event: ReactPointerEvent<HTMLButtonElement>, node: PartsTemplateMappingCanvasNode) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    if (connectingNodeId && connectingNodeId !== node.id) {
      return;
    }

    dragStateRef.current = {
      mode: "node",
      nodeId: node.id,
      originClientX: event.clientX,
      originClientY: event.clientY,
      originNodeX: node.x,
      originNodeY: node.y,
    };
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }

  function handleConnectionStart(event: ReactMouseEvent<HTMLButtonElement>, nodeId: string) {
    event.stopPropagation();
    setConnectingNodeId((current) => current === nodeId ? null : nodeId);
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setPointerWorld(toWorld(event.clientX, event.clientY));
  }

  function completeConnection(targetNodeId: string) {
    if (!connectingNodeId || connectingNodeId === targetNodeId) {
      return;
    }

    const sourceNodeId = connectingNodeId;
    const connectResult = onConnect?.({
      sourceId: connectingNodeId,
      targetId: targetNodeId,
    });
    setConnectingNodeId(null);
    setPointerWorld(null);

    if (typeof connectResult === "string") {
      setSelectedNodeId(null);
      setSelectedEdgeId(connectResult);
      return;
    }

    if (isConnectRejectedResult(connectResult)) {
      setSelectedNodeId(sourceNodeId);
      setSelectedEdgeId(null);
      setConnectionNotice({
        title: connectResult.title,
        description: connectResult.description,
        confirmLabel: connectResult.confirmLabel ?? "확인",
      });
      return;
    }

    setSelectedNodeId(null);
    setSelectedEdgeId(isConnectCreatedResult(connectResult) ? (connectResult.edgeId ?? null) : null);
  }

  function handleNodeCardClick(nodeId: string) {
    if (connectingNodeId && connectingNodeId !== nodeId) {
      completeConnection(nodeId);
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }

  function handleEdgeSelect(edgeId: string) {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
    setConnectingNodeId(null);
    setPointerWorld(null);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.kind === "node") {
      onDeleteNode?.(pendingDelete.id);
    } else {
      onDeleteEdge?.(pendingDelete.id);
    }

    setPendingDelete(null);
  }

  function handleEdgePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
    edge: PartsTemplateMappingCanvasEdge,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();
    const edgeCardPosition = resolveEdgeCardPosition(edge);

    if (!edgeCardPosition) {
      return;
    }

    dragStateRef.current = {
      mode: "edge",
      edgeId: edge.id,
      originClientX: event.clientX,
      originClientY: event.clientY,
      originEdgeX: edgeCardPosition.x,
      originEdgeY: edgeCardPosition.y,
    };
    handleEdgeSelect(edge.id);
  }

  function handlePropertyDragStart(
    event: ReactDragEvent<HTMLDivElement>,
    property: PartsTemplateMappingCanvasField,
    source: PartsTemplateMappingCanvasPropertyOwner,
  ) {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", property.id);
    setPropertyDragState({
      property,
      source,
    });
    setPropertyDropTarget(null);
  }

  function handlePropertyDragEnd() {
    setPropertyDragState(null);
    setPropertyDropTarget(null);
  }

  function handlePropertyDropTargetDragOver(
    event: ReactDragEvent<HTMLElement>,
    target: PartsTemplateMappingCanvasPropertyOwner,
  ) {
    if (!propertyDragState || !canMovePropertyBetweenOwners(propertyDragState.source, target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setPropertyDropTarget(target);
  }

  function handlePropertyDropTargetDragLeave(
    event: ReactDragEvent<HTMLElement>,
    target: PartsTemplateMappingCanvasPropertyOwner,
  ) {
    if (
      propertyDropTarget &&
      isSamePropertyOwner(propertyDropTarget, target) &&
      !event.currentTarget.contains(event.relatedTarget as Node | null)
    ) {
      setPropertyDropTarget(null);
    }
  }

  function handlePropertyDrop(
    event: ReactDragEvent<HTMLElement>,
    target: PartsTemplateMappingCanvasPropertyOwner,
  ) {
    if (!propertyDragState || !canMovePropertyBetweenOwners(propertyDragState.source, target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onMoveProperty?.({
      property: propertyDragState.property,
      source: propertyDragState.source,
      target,
    });

    if (target.kind === "node") {
      setSelectedNodeId(target.id);
      setSelectedEdgeId(null);
    } else if (target.kind === "edge") {
      setSelectedEdgeId(target.id);
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }

    setPropertyDragState(null);
    setPropertyDropTarget(null);
  }

  function renderPropertyItem(
    property: PartsTemplateMappingCanvasField,
    source: PartsTemplateMappingCanvasPropertyOwner,
    tone: "node" | "edge" | "shelf",
    options?: {
      disableInteraction?: boolean;
    },
  ) {
    const isDragging = propertyDragState?.property.id === property.id;
    const disableInteraction = options?.disableInteraction ?? false;
    const isDraggable = Boolean(onMoveProperty) && !connectingNodeId && !disableInteraction;
    const mappedLabel = resolveCanvasFieldMappedLabel(property);
    const supportingText = tone === "shelf" ? property.hint : (mappedLabel ?? "미매핑");

    return (
      <div
        key={property.id}
        draggable={isDraggable}
        className={cn(
          "parts-template-mapping-canvas-property-item",
          disableInteraction ? "pointer-events-none" : "",
        )}
        data-property-tone={tone}
        data-property-dragging={isDragging ? "true" : "false"}
        onClick={disableInteraction ? undefined : (event) => event.stopPropagation()}
        onPointerDown={disableInteraction ? undefined : (event) => event.stopPropagation()}
        onDragStart={isDraggable ? (event) => handlePropertyDragStart(event, property, source) : undefined}
        onDragEnd={isDraggable ? handlePropertyDragEnd : undefined}
      >
        <div className="parts-template-mapping-canvas-property-item-copy">
          <p className="truncate text-sm font-medium text-foreground">{property.label}</p>
          {supportingText ? (
            <p
              className={cn(
                "truncate text-xs",
                tone === "shelf"
                  ? "text-muted-foreground"
                  : mappedLabel
                    ? "text-muted-foreground"
                    : "text-[color:var(--brand-600)]",
              )}
            >
              {supportingText}
            </p>
          ) : null}
        </div>
        <div className="parts-template-mapping-canvas-property-item-meta">
          <Grip className="size-3.5" />
        </div>
      </div>
    );
  }

  function renderFieldEditor(
    field: PartsTemplateMappingCanvasField,
    owner: PartsTemplateMappingCanvasFieldOwner,
  ) {
    const mappedLabel = resolveCanvasFieldMappedLabel(field);
    const selectValue = field.mappedValue ?? FIELD_UNMAPPED_SELECT_VALUE;
    const mappingOptions = field.mappingOptions ?? [];
    const isEditable = Boolean(onFieldMappingChange) && !connectingNodeId;

    return (
      <article
        key={field.id}
        className="parts-template-mapping-canvas-field-editor"
      >
        <div className="parts-template-mapping-canvas-field-editor-header">
          <div className="parts-template-mapping-canvas-field-editor-copy">
            <p className="truncate text-sm font-semibold text-foreground">{field.label}</p>
            <p
              className={cn(
                "mt-1 text-xs",
                mappedLabel ? "text-muted-foreground" : "text-[color:var(--brand-600)]",
              )}
            >
              {mappedLabel ?? "아직 연결되지 않았습니다."}
            </p>
          </div>
          {field.mappedValue ? (
            <Button
              aria-label={`${field.label} 연결 해제`}
              size="icon-xs"
              variant="ghost"
              onClick={() => onFieldMappingChange?.({ owner, fieldId: field.id, value: null })}
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>

        <div className="parts-template-mapping-canvas-field-editor-control">
          <Select
            disabled={!isEditable || mappingOptions.length === 0}
            value={selectValue}
            onValueChange={(value) =>
              onFieldMappingChange?.({
                owner,
                fieldId: field.id,
                value: value === FIELD_UNMAPPED_SELECT_VALUE ? null : value,
              })
            }
          >
            <SelectTrigger className="h-9 rounded-lg border-border/70 bg-background/70 text-sm shadow-none">
              <SelectValue placeholder={mappingOptions.length ? "항목을 선택하세요" : "선택 항목이 없습니다"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FIELD_UNMAPPED_SELECT_VALUE}>미매핑</SelectItem>
              {mappingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </article>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="h-screen overflow-hidden bg-background px-6 py-8">
        <div className="dev-page-container parts-template-mapping-canvas-theme flex h-full min-h-0 flex-col justify-center">
          <section className="shrink-0 rounded-lg border bg-card px-6 py-8 text-center shadow-sm">
            <Badge variant="outline">매핑 실험</Badge>
            <h1 className="mt-4 text-2xl font-semibold text-foreground">
              {emptyState?.title ?? "표시할 카드가 아직 없습니다"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {emptyState?.description ?? "샘플 화면을 불러오면 배치와 연결 방식을 바로 확인할 수 있습니다."}
            </p>
            {emptyState?.onActionClick ? (
              <div className="mt-6">
                <Button onClick={emptyState.onActionClick}>
                  {emptyState.actionLabel ?? "샘플 불러오기"}
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    );
  }

  const previewSource = connectingNodeId ? nodes.find((node) => node.id === connectingNodeId) ?? null : null;

  return (
    <div className="h-screen overflow-hidden bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-canvas-theme flex h-full min-h-0 flex-col gap-4">
        {headerContent ? (
          <div className="shrink-0">{headerContent}</div>
        ) : (
          <section className="shrink-0 rounded-lg border bg-card px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <Badge variant="outline">매핑 실험</Badge>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">{fileName}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {headerActions}
                {onAddNode ? addableNodeTones.map((tone) => (
                  <Button
                    key={tone}
                    size="sm"
                    variant="outline"
                    onClick={() => onAddNode(tone)}
                  >
                    <Plus className="size-3.5" />
                    {getNodeToneLabel(tone)}
                  </Button>
                )) : null}
                <Badge variant="secondary">카드 {nodes.length}개</Badge>
                <Badge variant="outline">연결 {edges.length}개</Badge>
                {onResetNodes ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onResetNodes();
                      window.requestAnimationFrame(() => {
                        window.requestAnimationFrame(() => {
                          fitCanvasToNodes();
                        });
                      });
                    }}
                  >
                    <Grip className="size-3.5" />
                    배치 초기화
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {sourcePreviewContent ? (
          <div className="shrink-0">
            {sourcePreviewContent}
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
          <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden overscroll-none rounded-lg border bg-card shadow-sm">
            <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
              <Button
                aria-label="캔버스 축소"
                size="icon-sm"
                variant="outline"
                onClick={() => setViewportScale(viewport.scale - 0.12)}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                aria-label="캔버스 확대"
                size="icon-sm"
                variant="outline"
                onClick={() => setViewportScale(viewport.scale + 0.12)}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={fitCanvasToNodes}>
                <ScanSearch className="size-3.5" />
                맞춤 시점
              </Button>
            </div>

            <div className="absolute bottom-4 left-4 z-20 hidden rounded-full border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur md:block">
              빈 공간을 드래그하면 이동하고, 휠로 확대하거나 축소할 수 있습니다. 관계 연결을 누른 뒤 다른 카드를 선택하면 선이 이어집니다.
            </div>

            <div
              ref={canvasRef}
              className="parts-template-mapping-canvas-grid relative h-full overflow-hidden overscroll-none"
              onPointerDown={handleCanvasPointerDown}
              onWheel={(event) => {
                event.preventDefault();
                setViewportScale(viewportRef.current.scale - event.deltaY * 0.0015, event.clientX, event.clientY);
              }}
            >
              <div
                className="absolute left-0 top-0"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                  transformOrigin: "0 0",
                }}
              >
                <div
                  className="parts-template-mapping-canvas-boundary pointer-events-none absolute"
                  style={{
                    left: CANVAS_SAFE_MARGIN,
                    top: CANVAS_SAFE_MARGIN,
                    width: WORKAREA_WIDTH,
                    height: WORKAREA_HEIGHT,
                  }}
                >
                  <div className="parts-template-mapping-canvas-boundary-label left-8 top-8">
                    작업 영역
                  </div>
                  <div className="parts-template-mapping-canvas-boundary-size bottom-8 right-8">
                    {WORKAREA_WIDTH} x {WORKAREA_HEIGHT}
                  </div>
                </div>

                <svg
                  className="pointer-events-none absolute left-0 top-0 overflow-visible"
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                >
                {edges.map((edge) => {
                  const source = nodes.find((node) => node.id === edge.sourceId);
                  const target = nodes.find((node) => node.id === edge.targetId);

                  if (!source || !target) {
                    return null;
                  }

                  const start = getNodeCenterPoint(source);
                  const end = getNodeCenterPoint(target);
                  const cardPosition = resolveEdgeCardPosition(edge);
                  const isSelected = selectedEdgeId === edge.id;

                  if (!cardPosition) {
                    return null;
                  }

                  const anchor = getEdgeCardAnchorPoint(cardPosition, edge);
                  const isConnectedToSelectedNode = isEdgeConnectedToNode(edge, selectedNodeId);
                  const isHighlighted = isSelected || isConnectedToSelectedNode;
                  const stroke = isHighlighted
                    ? "var(--brand-500)"
                    : "color-mix(in srgb, var(--theme-text-secondary) 72%, var(--theme-border-strong, var(--theme-border)))";
                  const glowStroke = "color-mix(in srgb, var(--brand-500) 24%, transparent)";
                  const strokeWidth = isHighlighted ? 3 : 2.4;

                  return (
                    <g key={edge.id}>
                      {isHighlighted ? (
                        <path
                          className="pointer-events-none"
                          d={buildEdgePath(start, anchor)}
                          fill="none"
                          stroke={glowStroke}
                          strokeLinecap="round"
                          strokeWidth={8}
                        />
                      ) : null}
                      <path
                        className="pointer-events-auto cursor-pointer"
                        d={buildEdgePath(start, anchor)}
                        fill="none"
                        stroke={stroke}
                        strokeLinecap="round"
                        strokeWidth={strokeWidth}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdgeSelect(edge.id);
                        }}
                      />
                      {isHighlighted ? (
                        <path
                          className="pointer-events-none"
                          d={buildEdgePath(end, anchor)}
                          fill="none"
                          stroke={glowStroke}
                          strokeLinecap="round"
                          strokeWidth={8}
                        />
                      ) : null}
                      <path
                        className="pointer-events-auto cursor-pointer"
                        d={buildEdgePath(end, anchor)}
                        fill="none"
                        stroke={stroke}
                        strokeLinecap="round"
                        strokeWidth={strokeWidth}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdgeSelect(edge.id);
                        }}
                      />
                    </g>
                  );
                })}

                {previewSource && pointerWorld ? (
                  <path
                    d={buildEdgePath(getNodeCenterPoint(previewSource), pointerWorld)}
                    fill="none"
                    stroke="var(--brand-500)"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    strokeWidth={2}
                  />
                ) : null}
                </svg>

                {edges.map((edge) => {
                const source = nodes.find((node) => node.id === edge.sourceId);
                const target = nodes.find((node) => node.id === edge.targetId);

                if (!source || !target) {
                  return null;
                }

                  const cardPosition = resolveEdgeCardPosition(edge);
                  const isSelected = selectedEdgeId === edge.id;
                  const edgeTitle = resolvePartsTemplateMappingCanvasRelationLabel(
                    source.tone,
                    target.tone,
                  );

                  if (!cardPosition) {
                    return null;
                }

                return (
                  <article
                    key={`${edge.id}-card`}
                    aria-label={`${edgeTitle} 관계 카드`}
                    className="parts-template-mapping-canvas-edge-card absolute"
                    data-selected={isSelected ? "true" : "false"}
                    role="button"
                    tabIndex={0}
                    style={{ transform: `translate(${cardPosition.x}px, ${cardPosition.y}px)` }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleEdgeSelect(edge.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleEdgeSelect(edge.id);
                      }
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    {onDeleteEdge ? (
                      <Button
                        aria-label={`${edgeTitle} 삭제`}
                        className="absolute right-3 top-3 z-10"
                        size="icon-xs"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPendingDelete({
                            id: edge.id,
                            kind: "edge",
                            label: edgeTitle,
                          });
                        }}
                        onPointerDown={(event) => event.stopPropagation()}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}

                    <div
                      className="parts-template-mapping-canvas-edge-card-header cursor-grab active:cursor-grabbing"
                      onPointerDown={(event) => handleEdgePointerDown(event, edge)}
                    >
                      <p className="pr-8 text-sm font-semibold text-foreground">
                        {edgeTitle}
                      </p>
                    </div>

                    <div
                      className="parts-template-mapping-canvas-property-zone border-t border-border/70 px-3 py-3"
                      data-drop-active={
                        propertyDropTarget &&
                        isSamePropertyOwner(propertyDropTarget, { kind: "edge", id: edge.id })
                          ? "true"
                          : "false"
                      }
                      onDragOver={(event) =>
                        handlePropertyDropTargetDragOver(event, { kind: "edge", id: edge.id })
                      }
                      onDragLeave={(event) =>
                        handlePropertyDropTargetDragLeave(event, { kind: "edge", id: edge.id })
                      }
                      onDrop={(event) => handlePropertyDrop(event, { kind: "edge", id: edge.id })}
                    >
                      {edge.properties?.length ? (
                        edge.properties.map((property) =>
                          renderPropertyItem(property, { kind: "edge", id: edge.id }, "edge"),
                        )
                      ) : (
                        <div className="parts-template-mapping-canvas-property-zone-empty">
                          연결 항목을 여기에 추가할 수 있습니다.
                        </div>
                      )}
                    </div>
                  </article>
                );
                })}

                {nodes.map((node) => {
                const tone = node.tone ?? "part";
                const isSelected = selectedNodeId === node.id;
                const isConnecting = connectingNodeId === node.id;
                const isConnectTarget = Boolean(connectingNodeId && connectingNodeId !== node.id);
                const disableNodeInnerInteraction = isConnectTarget;

                return (
                  <article
                    key={node.id}
                    className="absolute"
                    style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                  >
                    <div
                      className="parts-template-mapping-canvas-node"
                      data-canvas-node-tone={tone}
                      data-connect-target={isConnectTarget ? "true" : "false"}
                      data-selected={isSelected ? "true" : "false"}
                      onClick={() => handleNodeCardClick(node.id)}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      {onDeleteNode ? (
                        <Button
                          aria-label={`${node.title} 삭제`}
                          className={cn(
                            "absolute right-3 top-3 z-10",
                            disableNodeInnerInteraction ? "pointer-events-none opacity-50" : "",
                          )}
                          size="icon-xs"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingDelete({
                              id: node.id,
                              kind: "node",
                              label: node.title,
                            });
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        className={cn(
                          "flex w-full cursor-grab items-center gap-3 rounded-[14px] p-4 text-left active:cursor-grabbing",
                          disableNodeInnerInteraction ? "pointer-events-none" : "",
                        )}
                        onPointerDown={(event) => handleNodePointerDown(event, node)}
                      >
                        <div className="rounded-full border border-current/15 bg-current/10 p-2">
                          <Grip className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-semibold text-foreground">{node.title}</p>
                        </div>
                      </button>

                      <div
                        className="parts-template-mapping-canvas-property-zone border-t border-border/70 px-4 py-4"
                        data-drop-active={
                          propertyDropTarget &&
                          isSamePropertyOwner(propertyDropTarget, { kind: "node", id: node.id })
                            ? "true"
                            : "false"
                        }
                        onDragOver={(event) =>
                          handlePropertyDropTargetDragOver(event, { kind: "node", id: node.id })
                        }
                        onDragLeave={(event) =>
                          handlePropertyDropTargetDragLeave(event, { kind: "node", id: node.id })
                        }
                        onDrop={(event) => handlePropertyDrop(event, { kind: "node", id: node.id })}
                      >
                        {node.fields?.length ? (
                          node.fields.map((field) =>
                            renderPropertyItem(field, { kind: "node", id: node.id }, "node", {
                              disableInteraction: disableNodeInnerInteraction,
                            }),
                          )
                        ) : (
                          <div className="parts-template-mapping-canvas-property-zone-empty">
                            카드 항목을 여기에 추가할 수 있습니다.
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border/70 px-4 pb-4 pt-3">
                        <Button
                          aria-label={`${node.title} 관계 연결`}
                          className={cn(
                            "w-full justify-center",
                            disableNodeInnerInteraction ? "pointer-events-none opacity-50" : "",
                            isConnecting ? "border-[color:var(--brand-500)] text-[color:var(--brand-600)]" : "",
                          )}
                          size="sm"
                          variant="outline"
                          onClick={(event) => handleConnectionStart(event, node.id)}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <Link2 className="size-3.5" />
                          {isConnecting ? "관계 연결 중" : "관계 연결"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
                })}
              </div>
            </div>
          </section>

          {showPropertySidebar ? (
            <aside className="parts-template-mapping-canvas-sidebar w-full shrink-0 overflow-hidden rounded-lg border bg-card shadow-sm lg:h-full lg:w-[340px] lg:max-w-[340px]">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-border/70 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">선택한 카드</Badge>
                        {selectedEditor ? <Badge variant="secondary">{selectedEditor.fields.length}개</Badge> : null}
                      </div>
                      {selectedEditor ? (
                        <>
                          <h2 className="mt-3 text-base font-semibold text-foreground">{selectedEditor.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{selectedEditor.description}</p>
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">
                          카드나 연결을 선택하면 여기서 항목을 편집할 수 있습니다.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-expanded={!isSelectedEditorCollapsed}
                      aria-label={isSelectedEditorCollapsed ? "참조 편집 펼치기" : "참조 편집 접기"}
                      className="mt-0.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setIsSelectedEditorCollapsed((prev) => !prev)}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          isSelectedEditorCollapsed ? "-rotate-90" : "rotate-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {!isSelectedEditorCollapsed ? (
                  <div className="max-h-[42%] shrink-0 overflow-y-auto overscroll-none border-b border-border/70 lg:min-h-0">
                    {selectedEditor ? (
                      selectedEditor.fields.length ? (
                        <div className="parts-template-mapping-canvas-field-editor-list">
                          {selectedEditor.fields.map((field) => renderFieldEditor(field, selectedEditor.owner))}
                        </div>
                      ) : (
                        <div className="parts-template-mapping-canvas-shelf-empty mx-5 my-5 min-h-[180px] rounded-lg border border-dashed border-border/70 bg-background/70">
                          아직 배치된 항목이 없습니다.
                        </div>
                      )
                    ) : (
                      <div className="parts-template-mapping-canvas-shelf-empty mx-5 my-5 min-h-[180px] rounded-lg border border-dashed border-border/70 bg-background/70">
                        편집할 카드를 선택해 주세요.
                      </div>
                    )}
                  </div>
                ) : null}

                <div
                  className="parts-template-mapping-canvas-unassigned-header border-b border-border/70 px-5 py-4"
                  data-has-warning={hasUnassignedProperties ? "true" : "false"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">미배치 항목</Badge>
                        <Badge variant="secondary">
                          {hasUnassignedProperties ? (
                            <AlertTriangle className="size-3 text-[var(--status-warning)]" aria-hidden="true" />
                          ) : null}
                          {unassignedProperties.length}개
                        </Badge>
                      </div>
                      <p
                        className="mt-2 text-sm text-muted-foreground"
                        style={hasUnassignedProperties ? { color: "var(--status-warning)" } : undefined}
                      >
                        카드에서 꺼낸 항목을 잠시 보관하거나, 여기서 다시 카드나 연결에 배치할 수 있습니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-expanded={!isUnassignedCollapsed}
                      aria-label={isUnassignedCollapsed ? "미배치 항목 펼치기" : "미배치 항목 접기"}
                      className="mt-0.5 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setIsUnassignedCollapsed((prev) => !prev)}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          isUnassignedCollapsed ? "-rotate-90" : "rotate-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {!isUnassignedCollapsed ? (
                  <div className="min-h-[260px] flex-1 overflow-y-auto overscroll-none lg:min-h-0">
                    <div
                      className="parts-template-mapping-canvas-shelf"
                      data-drop-active={
                        propertyDropTarget && isSamePropertyOwner(propertyDropTarget, { kind: "unassigned" })
                          ? "true"
                          : "false"
                      }
                      onDragOver={(event) => handlePropertyDropTargetDragOver(event, { kind: "unassigned" })}
                      onDragLeave={(event) => handlePropertyDropTargetDragLeave(event, { kind: "unassigned" })}
                      onDrop={(event) => handlePropertyDrop(event, { kind: "unassigned" })}
                    >
                      {unassignedProperties.length ? (
                        <div className="parts-template-mapping-canvas-shelf-grid">
                          {unassignedProperties.map((property) =>
                            renderPropertyItem(property, { kind: "unassigned" }, "shelf"),
                          )}
                        </div>
                      ) : (
                        <div className="parts-template-mapping-canvas-shelf-empty">
                          아직 미배치 항목이 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="삭제하시겠습니까?"
        description={
          pendingDelete
            ? `${pendingDelete.label} 카드를 삭제합니다.`
            : "선택한 카드를 삭제합니다."
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      />

      <Dialog
        open={Boolean(connectionNotice)}
        onOpenChange={(open) => {
          if (!open) {
            setConnectionNotice(null);
          }
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{connectionNotice?.title ?? "관계를 연결할 수 없습니다"}</DialogTitle>
            <DialogDescription>
              {connectionNotice?.description ?? "관계 연결 조건을 다시 확인해 주세요."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConnectionNotice(null)}>
              {connectionNotice?.confirmLabel ?? "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
