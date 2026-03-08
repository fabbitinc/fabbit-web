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
  Badge,
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
  type GltfViewerRenderMode,
  type GltfViewerStatus,
} from "./gltf-viewer-canvas";

export interface GltfViewerScreenProps {
  src: string;
  className?: string;
  description?: string;
  initialAutoRotate?: boolean;
  initialRenderMode?: GltfViewerRenderMode;
  initialShowGrid?: boolean;
  resourceUrls?: Record<string, string>;
  subtitle?: string;
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

export function GltfViewerScreen({
  src,
  className,
  description = "전체화면에서 3D 모델을 검토하는 뷰어입니다.",
  initialAutoRotate = false,
  initialRenderMode = "solid",
  initialShowGrid = true,
  resourceUrls,
  subtitle = "3D 모델 검토",
  title,
}: GltfViewerScreenProps) {
  const canvasRef = useRef<GltfViewerCanvasHandle>(null);
  const [status, setStatus] = useState<GltfViewerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [renderMode, setRenderMode] =
    useState<GltfViewerRenderMode>(initialRenderMode);
  const [showOptionsPanel, setShowOptionsPanel] = useState(true);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);

  const statusMeta = getStatusMeta(status, errorMessage);
  const StatusIcon = statusMeta.icon;
  const optionsPanelContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">표시 옵션</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          분석 정보 없이 뷰어 제어만 제공합니다.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
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

        <section className="space-y-2 rounded-2xl border bg-background/70 px-3 py-3">
          <p className="text-sm font-semibold text-foreground">조작 가이드</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>왼쪽 드래그로 회전하고 휠로 확대 및 축소합니다.</p>
            <p>Shift+왼쪽 드래그 또는 오른쪽 드래그로 평행 이동합니다.</p>
            <p>시점이 어긋나면 상단의 맞춤 보기 또는 시점 초기화를 사용합니다.</p>
          </div>
        </section>
      </div>
    </div>
  );

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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  3D 모델 뷰어
                </p>
                <Badge variant={statusMeta.badgeVariant}>
                  <StatusIcon
                    className={cn("h-3 w-3", status === "loading" && "animate-spin")}
                  />
                  {statusMeta.label}
                </Badge>
                <Badge variant="outline">{subtitle}</Badge>
              </div>

              <div className="space-y-1">
                <h1 className="truncate text-xl font-semibold text-foreground">
                  {title}
                </h1>
                <p className="max-w-4xl text-sm text-muted-foreground">
                  {description}
                </p>
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

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border bg-card px-2.5 py-1">
              렌더 모드 {renderMode === "wireframe" ? "와이어프레임" : "솔리드"}
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              그리드 {showGrid ? "표시" : "숨김"}
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              자동 회전 {autoRotate ? "켜짐" : "꺼짐"}
            </span>
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
                renderMode={renderMode}
                resourceUrls={resourceUrls}
                showGrid={showGrid}
                showInteractionHint={false}
                showStatusBadge={false}
                src={src}
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
