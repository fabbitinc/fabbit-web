import { useRef, useState } from "react";
import {
  Box,
  Info,
  Loader2,
  RotateCcw,
  ScanSearch,
  TriangleAlert,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Switch,
  cn,
} from "@fabbit/ui";
import {
  GltfViewerCanvas,
  type GltfViewerCanvasHandle,
  type GltfViewerProjectionMode,
  type GltfViewerRenderMode,
  type GltfViewerSceneStats,
  type GltfViewerStandardView,
  type GltfViewerStatus,
} from "./gltf-viewer-canvas";

export interface GltfViewerScreenProps {
  src: string;
  category?: string;
  className?: string;
  description?: string;
  fileName?: string;
  initialAutoRotate?: boolean;
  initialRenderMode?: GltfViewerRenderMode;
  initialShowGrid?: boolean;
  partNumber?: string;
  revision?: string;
  resourceUrls?: Record<string, string>;
  title: string;
}

function getStatusMeta(status: GltfViewerStatus, errorMessage: string | null) {
  if (status === "loading") {
    return {
      badgeVariant: "neutral" as const,
      description: "모델을 준비하고 있습니다.",
      icon: Loader2,
      label: "로딩 중",
    };
  }

  if (status === "error") {
    return {
      badgeVariant: "danger" as const,
      description: errorMessage ?? "파일 경로나 형식을 다시 확인해 주세요.",
      icon: TriangleAlert,
      label: "불러오기 실패",
    };
  }

  return {
    badgeVariant: "success" as const,
    description: "회전, 확대, 와이어프레임 전환이 가능합니다.",
    icon: Box,
    label: "검토 가능",
  };
}

function formatViewerLength(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 mm";
  }

  if (value >= 1) {
    return `${Number(value.toFixed(value >= 10 ? 1 : 2)).toLocaleString("ko-KR")} m`;
  }

  const millimeters = value * 1000;

  if (millimeters >= 100) {
    return `${Math.round(millimeters).toLocaleString("ko-KR")} mm`;
  }

  return `${Number(millimeters.toFixed(1)).toLocaleString("ko-KR")} mm`;
}

export function GltfViewerScreen({
  src,
  category,
  className,
  description,
  fileName,
  initialAutoRotate = false,
  initialRenderMode = "solid",
  initialShowGrid = true,
  partNumber,
  revision,
  resourceUrls,
  title,
}: GltfViewerScreenProps) {
  const canvasRef = useRef<GltfViewerCanvasHandle>(null);
  const [status, setStatus] = useState<GltfViewerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [showAxesGizmo, setShowAxesGizmo] = useState(true);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [projectionMode, setProjectionMode] =
    useState<GltfViewerProjectionMode>("perspective");
  const [renderMode, setRenderMode] =
    useState<GltfViewerRenderMode>(initialRenderMode);
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const [sceneStats, setSceneStats] = useState<GltfViewerSceneStats | null>(null);

  const statusMeta = getStatusMeta(status, errorMessage);
  const headerMetaItems = [
    partNumber && partNumber !== title
      ? { label: "품번", value: partNumber }
      : null,
    revision ? { label: "리비전", value: revision } : null,
    category ? { label: "카테고리", value: category } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);
  const headerFileName =
    fileName && fileName !== title && fileName !== partNumber ? fileName : null;
  const dimensionItems = sceneStats
    ? [
        { label: "폭", value: formatViewerLength(sceneStats.dimensions.x) },
        { label: "높이", value: formatViewerLength(sceneStats.dimensions.y) },
        { label: "깊이", value: formatViewerLength(sceneStats.dimensions.z) },
      ]
    : [];
  const optionsPanelContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">표시 옵션</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
          <div>
            <p className="font-medium text-foreground">표준 시점</p>
            <p className="text-xs text-muted-foreground">
              검토 기준 시점으로 빠르게 전환합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleSetView("iso")}
            >
              등각
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleSetView("front")}
            >
              정면
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleSetView("right")}
            >
              우측
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => handleSetView("top")}
            >
              평면
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">직교 투영</p>
              <p className="text-xs text-muted-foreground">
                원근 왜곡 없이 형상을 검토합니다.
              </p>
            </div>
            <Switch
              checked={projectionMode === "orthographic"}
              onCheckedChange={(checked) =>
                setProjectionMode(checked ? "orthographic" : "perspective")
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">그리드</p>
              <p className="text-xs text-muted-foreground">
                바닥 기준선을 표시합니다.
              </p>
            </div>
            <Switch checked={showGrid} onCheckedChange={setShowGrid} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">원점 축 표시</p>
              <p className="text-xs text-muted-foreground">
                그리드 중심에 기준 축을 함께 표시합니다.
              </p>
            </div>
            <Switch checked={showAxesGizmo} onCheckedChange={setShowAxesGizmo} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">자동 회전</p>
              <p className="text-xs text-muted-foreground">
                모델 전체를 천천히 훑어봅니다.
              </p>
            </div>
            <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">와이어프레임</p>
              <p className="text-xs text-muted-foreground">
                형상 구조를 선 위주로 표시합니다.
              </p>
            </div>
            <Switch
              checked={renderMode === "wireframe"}
              onCheckedChange={(checked) =>
                setRenderMode(checked ? "wireframe" : "solid")
              }
            />
          </div>
        </section>

        {dimensionItems.length > 0 ? (
          <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
            <div>
              <p className="font-medium text-foreground">모델 크기</p>
              <p className="text-xs text-muted-foreground">
                현재 모델 bounds 기준 외형 치수입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {dimensionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border bg-card px-3 py-2"
                >
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );

  function handleSetView(view: GltfViewerStandardView) {
    canvasRef.current?.setView(view);
  }

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] min-w-0 flex-col bg-background text-foreground",
        className,
      )}
    >
      <header className="border-b bg-background/92 backdrop-blur">
        <div className="flex flex-col gap-4 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                3D 모델 뷰어
              </p>

              <div className="space-y-2">
                <h1 className="truncate text-xl font-semibold text-foreground">
                  {title}
                </h1>

                {headerMetaItems.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {headerMetaItems.map((item) => (
                      <span key={item.label}>
                        {item.label} {item.value}
                      </span>
                    ))}
                  </div>
                ) : null}

                {headerFileName ? (
                  <p className="text-sm text-muted-foreground">파일 {headerFileName}</p>
                ) : null}

                {description ? (
                  <p className="max-w-4xl text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button
                aria-label="축소"
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.zoomOut()}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                aria-label="확대"
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.zoomIn()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.fitView()}
              >
                <ScanSearch className="h-4 w-4" />
                맞춤 보기
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.resetView()}
              >
                <RotateCcw className="h-4 w-4" />
                시점 초기화
              </Button>
              <Separator
                className="hidden h-6 md:block"
                orientation="vertical"
              />
              <Button
                className="hidden lg:inline-flex"
                size="sm"
                type="button"
                variant={showOptionsPanel ? "secondary" : "outline"}
                onClick={() => setShowOptionsPanel((current) => !current)}
              >
                <Info className="h-4 w-4" />
                표시 옵션
              </Button>
              <Button
                className="lg:hidden"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setOptionsSheetOpen(true)}
              >
                <Info className="h-4 w-4" />
                옵션
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="relative flex min-h-0 flex-1 flex-col bg-muted/25">
          <div className="min-h-0 flex-1 p-4 md:p-5">
            <div className="h-full overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
              <GltfViewerCanvas
                ref={canvasRef}
                ariaLabel={title}
                autoRotate={autoRotate}
                className="h-full min-h-[28rem] rounded-[28px]"
                projectionMode={projectionMode}
                renderMode={renderMode}
                resourceUrls={resourceUrls}
                showAxesGizmo={showAxesGizmo}
                showBackgroundDecorations={false}
                showGrid={showGrid}
                showInteractionHint={false}
                showStatusBadge={false}
                src={src}
                onSceneStatsChange={setSceneStats}
                onStatusChange={({
                  errorMessage: nextErrorMessage,
                  status: nextStatus,
                }) => {
                  setStatus(nextStatus);
                  setErrorMessage(nextErrorMessage);
                }}
              />
            </div>
          </div>
        </main>

        {showOptionsPanel ? (
          <aside className="hidden w-[20rem] shrink-0 border-l bg-card/70 lg:block">
            {optionsPanelContent}
          </aside>
        ) : null}
      </div>

      <Sheet open={optionsSheetOpen} onOpenChange={setOptionsSheetOpen}>
        <SheetContent
          className="w-[20rem] p-0 sm:max-w-[20rem] lg:hidden"
          side="right"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>표시 옵션</SheetTitle>
            <SheetDescription>
              그리드, 자동 회전, 와이어프레임을 조정합니다.
            </SheetDescription>
          </SheetHeader>
          {optionsPanelContent}
        </SheetContent>
      </Sheet>

      <footer className="border-t bg-background/92 px-4 py-3 text-xs text-muted-foreground backdrop-blur md:px-5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border bg-card px-2.5 py-1">
              왼쪽 드래그 회전
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              Shift+드래그 이동
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              휠 확대 및 축소
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border bg-card px-2.5 py-1">
              상태 {statusMeta.label}
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              {statusMeta.description}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
