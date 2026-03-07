import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Grip,
  Link2,
  Plus,
  ScanSearch,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge, Button, cn } from "@fabbit/ui";
import "./parts-template-mapping-canvas-screen.css";

const CANVAS_WIDTH = 4200;
const CANVAS_HEIGHT = 2800;
const NODE_WIDTH = 260;
const CANVAS_SAFE_MARGIN = 96;
const WORKAREA_WIDTH = CANVAS_WIDTH - CANVAS_SAFE_MARGIN * 2;
const WORKAREA_HEIGHT = CANVAS_HEIGHT - CANVAS_SAFE_MARGIN * 2;
const FIT_VIEW_PADDING = 120;
const MIN_VIEWPORT_SCALE = 0.45;
const MAX_VIEWPORT_SCALE = 1.9;
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

export interface PartsTemplateMappingCanvasField {
  id: string;
  label: string;
  hint?: string;
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
}

export interface PartsTemplateMappingCanvasEmptyState {
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export interface PartsTemplateMappingCanvasScreenProps {
  addableNodeTones?: PartsTemplateMappingCanvasNodeTone[];
  description?: string;
  edges: PartsTemplateMappingCanvasEdge[];
  emptyState?: PartsTemplateMappingCanvasEmptyState;
  fileName?: string;
  nodes: PartsTemplateMappingCanvasNode[];
  onAddNode?: (tone: PartsTemplateMappingCanvasNodeTone) => void;
  onConnect?: (connection: { sourceId: string; targetId: string }) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  onResetNodes?: () => void;
  title?: string;
}

const DEFAULT_ADDABLE_NODE_TONES: PartsTemplateMappingCanvasNodeTone[] = [
  "supplier",
  "part",
  "drawing",
  "project",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNodeHeight(node: PartsTemplateMappingCanvasNode) {
  const descriptionHeight = node.description ? 48 : 0;
  const fieldHeight = (node.fields?.length ?? 0) * 28;
  return 108 + descriptionHeight + fieldHeight;
}

function getInputHandlePoint(node: PartsTemplateMappingCanvasNode) {
  return {
    x: node.x,
    y: node.y + getNodeHeight(node) / 2,
  };
}

function getOutputHandlePoint(node: PartsTemplateMappingCanvasNode) {
  return {
    x: node.x + NODE_WIDTH,
    y: node.y + getNodeHeight(node) / 2,
  };
}

function buildEdgePath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const curve = Math.max(96, Math.abs(end.x - start.x) * 0.45);
  return `M ${start.x} ${start.y} C ${start.x + curve} ${start.y}, ${end.x - curve} ${end.y}, ${end.x} ${end.y}`;
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

function getNodeToneBadgeVariant(tone: PartsTemplateMappingCanvasNodeTone) {
  switch (tone) {
    case "supplier":
      return "success" as const;
    case "drawing":
      return "warning" as const;
    case "project":
      return "accent" as const;
    default:
      return "default" as const;
  }
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

type DragState = DragStatePan | DragStateNode;

export function PartsTemplateMappingCanvasScreen({
  addableNodeTones = DEFAULT_ADDABLE_NODE_TONES,
  description = "표 기반 매핑 대신 캔버스에서 노드를 배치하고 연결 흐름을 빠르게 검증합니다.",
  edges,
  emptyState,
  fileName = "부품_관계_실험보드.fig",
  nodes,
  onAddNode,
  onConnect,
  onDeleteEdge,
  onDeleteNode,
  onNodePositionChange,
  onResetNodes,
  title = "캔버스 매핑 실험실",
}: PartsTemplateMappingCanvasScreenProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const hasAutoFitRef = useRef(false);
  const viewportRef = useRef(DEFAULT_VIEWPORT);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id ?? null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [pointerWorld, setPointerWorld] = useState<{ x: number; y: number } | null>(null);

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
  }, [connectingNodeId, nodes, onDeleteEdge, onNodePositionChange, selectedEdgeId]);

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

  function handleConnectionEnd(event: ReactMouseEvent<HTMLButtonElement>, targetNodeId: string) {
    event.stopPropagation();

    if (!connectingNodeId || connectingNodeId === targetNodeId) {
      return;
    }

    onConnect?.({
      sourceId: connectingNodeId,
      targetId: targetNodeId,
    });
    setConnectingNodeId(null);
    setPointerWorld(null);
    setSelectedNodeId(targetNodeId);
  }

  if (nodes.length === 0) {
    return (
      <div className="h-screen overflow-hidden bg-background px-6 py-8">
        <div className="dev-page-container parts-template-mapping-canvas-theme flex h-full min-h-0 flex-col justify-center">
          <section className="shrink-0 rounded-[28px] border bg-card px-6 py-8 text-center shadow-sm">
            <Badge variant="outline">Canvas Prototype</Badge>
            <h1 className="mt-4 text-2xl font-semibold text-foreground">
              {emptyState?.title ?? "실험할 노드가 아직 없습니다"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {emptyState?.description ?? "스토리에서 샘플 노드를 불러오면 캔버스 배치와 연결 흐름을 즉시 확인할 수 있습니다."}
            </p>
            {emptyState?.onActionClick ? (
              <div className="mt-6">
                <Button onClick={emptyState.onActionClick}>
                  {emptyState.actionLabel ?? "샘플 노드 불러오기"}
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
        <section className="shrink-0 rounded-[28px] border bg-card px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <Badge variant="outline">Canvas Prototype</Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground/80">{fileName}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
              <Badge variant="secondary">{nodes.length} nodes</Badge>
              <Badge variant="outline">{edges.length} edges</Badge>
              <Badge variant="outline">{Math.round(viewport.scale * 100)}% zoom</Badge>
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
                  노드 리셋
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="relative min-h-0 flex-1 overflow-hidden overscroll-none rounded-[28px] border bg-card shadow-sm">
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
            빈 공간을 드래그하면 이동, 휠로 확대/축소, 연결 점 클릭 후 다른 노드를 눌러 선을 만듭니다.
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

                  const start = getOutputHandlePoint(source);
                  const end = getInputHandlePoint(target);
                  const isSelected = selectedEdgeId === edge.id;

                  return (
                    <g key={edge.id}>
                      <path
                        className="pointer-events-auto cursor-pointer"
                        d={buildEdgePath(start, end)}
                        fill="none"
                        stroke={isSelected ? "var(--brand-600)" : "var(--theme-border-strong, var(--theme-border))"}
                        strokeDasharray={edge.kind === "dashed" ? "8 6" : undefined}
                        strokeLinecap="round"
                        strokeWidth={isSelected ? 3 : 2}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedEdgeId(edge.id);
                          setSelectedNodeId(null);
                          setConnectingNodeId(null);
                        }}
                      />
                      {edge.label ? (
                        <text
                          x={(start.x + end.x) / 2}
                          y={(start.y + end.y) / 2 - 10}
                          fill="var(--theme-text-secondary)"
                          fontSize="12"
                          pointerEvents="none"
                          textAnchor="middle"
                        >
                          {edge.label}
                        </text>
                      ) : null}
                    </g>
                  );
                })}

                {previewSource && pointerWorld ? (
                  <path
                    d={buildEdgePath(getOutputHandlePoint(previewSource), pointerWorld)}
                    fill="none"
                    stroke="var(--brand-500)"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    strokeWidth={2}
                  />
                ) : null}
              </svg>

              {nodes.map((node) => {
                const tone = node.tone ?? "part";
                const isSelected = selectedNodeId === node.id;
                const isConnecting = connectingNodeId === node.id;

                return (
                  <article
                    key={node.id}
                    className="absolute"
                    style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                  >
                    <div
                      className="parts-template-mapping-canvas-node"
                      data-canvas-node-tone={tone}
                      data-selected={isSelected ? "true" : "false"}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      {onDeleteNode ? (
                        <Button
                          aria-label={`${node.title} 삭제`}
                          className="absolute right-3 top-3 z-10"
                          size="icon-xs"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDeleteNode(node.id);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                      <button
                        type="button"
                        className="flex w-full cursor-grab items-start gap-3 rounded-[22px] p-4 text-left active:cursor-grabbing"
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setSelectedEdgeId(null);
                        }}
                        onPointerDown={(event) => handleNodePointerDown(event, node)}
                      >
                        <div className="mt-0.5 rounded-full border border-current/15 bg-current/10 p-2">
                          <Grip className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getNodeToneBadgeVariant(tone)}>{getNodeToneLabel(tone)}</Badge>
                            {isConnecting ? <Badge variant="outline">연결 중</Badge> : null}
                          </div>
                          <div>
                            <p className="truncate text-base font-semibold text-foreground">{node.title}</p>
                            {node.subtitle ? (
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground/80">
                                {node.subtitle}
                              </p>
                            ) : null}
                          </div>
                          {node.description ? (
                            <p className="text-sm leading-5 text-muted-foreground">{node.description}</p>
                          ) : null}
                        </div>
                      </button>

                      {node.fields?.length ? (
                        <div className="space-y-2 border-t border-border/70 px-4 py-4">
                          {node.fields.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/85 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{field.label}</p>
                                {field.hint ? (
                                  <p className="truncate text-xs text-muted-foreground">{field.hint}</p>
                                ) : null}
                              </div>
                              <Link2 className="size-3.5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        aria-label={`${node.title} 입력 핸들`}
                        className={cn(
                          "parts-template-mapping-canvas-handle left-0 -translate-x-1/2",
                          connectingNodeId && connectingNodeId !== node.id ? "scale-110" : "",
                        )}
                        onClick={(event) => handleConnectionEnd(event, node.id)}
                      />
                      <button
                        type="button"
                        aria-label={`${node.title} 출력 핸들`}
                        className={cn(
                          "parts-template-mapping-canvas-handle right-0 translate-x-1/2",
                          isConnecting ? "scale-110" : "",
                        )}
                        onClick={(event) => handleConnectionStart(event, node.id)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
