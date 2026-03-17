import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Minus,
  MousePointer2,
  MoveRight,
  Pencil,
  Printer,
  ScanSearch,
  Square,
  Type,
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
  cn,
} from "@fabbit/ui";
import {
  PdfViewerCanvas,
  type PdfViewerCanvasHandle,
  type PdfViewerMarkupTool,
  type PdfViewerPageInfo,
  type PdfViewerStatus,
} from "./pdf-viewer-canvas";

export interface PdfViewerScreenProps {
  src: string;
  title: string;
  category?: string;
  className?: string;
  description?: string;
  fileName?: string;
  partNumber?: string;
  revision?: string;
}

const MARKUP_TOOLS: {
  icon: typeof MousePointer2;
  label: string;
  tool: PdfViewerMarkupTool;
}[] = [
  { icon: MousePointer2, label: "선택", tool: "select" },
  { icon: Pencil, label: "펜", tool: "pen" },
  { icon: Minus, label: "직선", tool: "line" },
  { icon: Square, label: "사각형", tool: "rectangle" },
  { icon: Type, label: "텍스트", tool: "text" },
  { icon: MoveRight, label: "화살표", tool: "arrow" },
];

const STROKE_WIDTH_OPTIONS = [
  { label: "가는 선 (1px)", value: 1 },
  { label: "보통 (2px)", value: 2 },
  { label: "굵은 선 (4px)", value: 4 },
  { label: "매우 굵은 선 (8px)", value: 8 },
];

const STROKE_COLOR_OPTIONS = [
  { color: "#ef4444", label: "빨강" },
  { color: "#3b82f6", label: "파랑" },
  { color: "#000000", label: "검정" },
  { color: "#22c55e", label: "초록" },
  { color: "#f59e0b", label: "주황" },
];

export function PdfViewerScreen({
  src,
  title,
  category,
  className,
  description,
  fileName,
  partNumber,
  revision,
}: PdfViewerScreenProps) {
  const canvasRef = useRef<PdfViewerCanvasHandle>(null);
  const [status, setStatus] = useState<PdfViewerStatus>("loading");
  const [activeTool, setActiveTool] = useState<PdfViewerMarkupTool>("select");
  const [strokeColor, setStrokeColor] = useState("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [pageInfo, setPageInfo] = useState<PdfViewerPageInfo>({
    currentPage: 1,
    totalPages: 0,
  });
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);

  const headerMetaItems = [
    partNumber && partNumber !== title
      ? { label: "품번", value: partNumber }
      : null,
    revision ? { label: "리비전", value: revision } : null,
    category ? { label: "카테고리", value: category } : null,
  ].filter((item): item is { label: string; value: string } => item !== null);

  const headerFileName =
    fileName && fileName !== title && fileName !== partNumber ? fileName : null;

  const statusMeta =
    status === "loading"
      ? { label: "로딩 중", description: "문서를 준비하고 있습니다." }
      : status === "error"
        ? {
            label: "불러오기 실패",
            description: "파일 경로나 형식을 다시 확인해 주세요.",
          }
        : { label: "검토 가능", description: "마크업과 페이지 탐색이 가능합니다." };

  const optionsPanelContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">마크업 옵션</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
          <div>
            <p className="font-medium text-foreground">마크업 도구</p>
            <p className="text-xs text-muted-foreground">
              도면 위에 표시할 마크업 유형을 선택합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MARKUP_TOOLS.map((item) => (
              <Button
                key={item.tool}
                className="cursor-pointer"
                size="sm"
                type="button"
                variant={activeTool === item.tool ? "secondary" : "outline"}
                onClick={() => setActiveTool(item.tool)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
          <div>
            <p className="font-medium text-foreground">선 굵기</p>
            <p className="text-xs text-muted-foreground">
              마크업 선의 굵기를 조절합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {STROKE_WIDTH_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors",
                  strokeWidth === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted",
                )}
                type="button"
                onClick={() => setStrokeWidth(option.value)}
              >
                <div
                  className="w-8 rounded-full bg-foreground"
                  style={{ height: `${Math.max(option.value, 1)}px` }}
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border bg-background/70 px-3 py-3">
          <div>
            <p className="font-medium text-foreground">마크업 색상</p>
            <p className="text-xs text-muted-foreground">
              마크업에 사용할 색상을 선택합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STROKE_COLOR_OPTIONS.map((option) => (
              <button
                key={option.color}
                aria-label={option.label}
                className={cn(
                  "h-8 w-8 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
                  strokeColor === option.color
                    ? "border-foreground ring-2 ring-primary/30"
                    : "border-transparent",
                )}
                style={{ backgroundColor: option.color }}
                type="button"
                onClick={() => setStrokeColor(option.color)}
              />
            ))}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                2D 도면 뷰어
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
                  <p className="text-sm text-muted-foreground">
                    파일 {headerFileName}
                  </p>
                ) : null}

                {description ? (
                  <p className="max-w-4xl text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              {/* 페이지 네비게이션 */}
              <Button
                aria-label="이전 페이지"
                className="cursor-pointer"
                disabled={pageInfo.currentPage <= 1}
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.prevPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
                {pageInfo.currentPage} / {pageInfo.totalPages}
              </span>
              <Button
                aria-label="다음 페이지"
                className="cursor-pointer"
                disabled={pageInfo.currentPage >= pageInfo.totalPages}
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.nextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Separator
                className="hidden h-6 md:block"
                orientation="vertical"
              />

              {/* 줌 & 뷰 컨트롤 */}
              <Button
                aria-label="축소"
                className="cursor-pointer"
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.zoomOut()}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                aria-label="확대"
                className="cursor-pointer"
                size="icon-sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.zoomIn()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                className="cursor-pointer"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.fitView()}
              >
                <ScanSearch className="h-4 w-4" />
                맞춤 보기
              </Button>

              <Separator
                className="hidden h-6 md:block"
                orientation="vertical"
              />

              {/* 인쇄 */}
              <Button
                className="cursor-pointer"
                size="sm"
                type="button"
                variant="outline"
                onClick={() => canvasRef.current?.printWithMarkup()}
              >
                <Printer className="h-4 w-4" />
                인쇄
              </Button>

              {/* 옵션 패널 */}
              <Button
                className="hidden cursor-pointer lg:inline-flex"
                size="sm"
                type="button"
                variant={showOptionsPanel ? "secondary" : "outline"}
                onClick={() => setShowOptionsPanel((current) => !current)}
              >
                <Info className="h-4 w-4" />
                표시 옵션
              </Button>
              <Button
                className="cursor-pointer lg:hidden"
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
              <PdfViewerCanvas
                ref={canvasRef}
                activeTool={activeTool}
                ariaLabel={title}
                className="h-full min-h-[28rem] overflow-auto rounded-[28px]"
                showStatusBadge={false}
                src={src}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                onPageChange={setPageInfo}
                onStatusChange={({ status: nextStatus }) => {
                  setStatus(nextStatus);
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
            <SheetTitle>마크업 옵션</SheetTitle>
            <SheetDescription>
              마크업 도구, 선 굵기, 색상을 조정합니다.
            </SheetDescription>
          </SheetHeader>
          {optionsPanelContent}
        </SheetContent>
      </Sheet>

      <footer className="border-t bg-background/92 px-4 py-3 text-xs text-muted-foreground backdrop-blur md:px-5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border bg-card px-2.5 py-1">
              클릭 드래그로 마크업
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              Ctrl+휠 확대/축소
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1">
              Ctrl+P 인쇄
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
