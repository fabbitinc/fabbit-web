import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@fabbit/ui";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  Canvas as FabricCanvas,
  PencilBrush,
  Line,
  Rect,
  IText,
  Triangle,
  Group,
  type FabricObject,
} from "fabric";

// @ts-ignore Vite ?url suffix — TS에는 타입이 없지만 Vite가 빌드 시 올바른 URL을 반환
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export type PdfViewerStatus = "loading" | "ready" | "error";
export type PdfViewerMarkupTool =
  | "select"
  | "pen"
  | "line"
  | "rectangle"
  | "text"
  | "arrow";

export interface PdfViewerStatusChange {
  errorMessage: string | null;
  status: PdfViewerStatus;
}

export interface PdfViewerPageInfo {
  currentPage: number;
  totalPages: number;
}

export interface PdfViewerCanvasHandle {
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  getMarkupData: () => Record<number, string>;
  printWithMarkup: () => Promise<void>;
}

export interface PdfViewerCanvasProps {
  ariaLabel: string;
  src: string;
  activeTool?: PdfViewerMarkupTool;
  className?: string;
  initialPage?: number;
  strokeColor?: string;
  strokeWidth?: number;
  onMarkupChange?: (data: Record<number, string>) => void;
  onPageChange?: (info: PdfViewerPageInfo) => void;
  onStatusChange?: (change: PdfViewerStatusChange) => void;
  showStatusBadge?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4.0;
const SCALE_STEP = 0.25;

export const PdfViewerCanvas = forwardRef<
  PdfViewerCanvasHandle,
  PdfViewerCanvasProps
>(function PdfViewerCanvas(
  {
    ariaLabel,
    src,
    activeTool = "select",
    className,
    initialPage = 1,
    strokeColor = "#ef4444",
    strokeWidth = 2,
    onMarkupChange,
    onPageChange,
    onStatusChange,
    showStatusBadge = true,
  },
  ref,
) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fabricOverlayRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const markupDataRef = useRef<Map<number, string>>(new Map());
  const currentPageRef = useRef(initialPage);
  const totalPagesRef = useRef(0);
  const scaleRef = useRef(1);
  const activeToolRef = useRef(activeTool);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const fabricInitializedRef = useRef(false);
  const keydownHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const drawingRef = useRef<{
    startX: number;
    startY: number;
    object: FabricObject | null;
  } | null>(null);

  const [status, setStatus] = useState<PdfViewerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);

  activeToolRef.current = activeTool;
  strokeColorRef.current = strokeColor;
  strokeWidthRef.current = strokeWidth;

  const getMarkupData = useCallback(() => {
    saveCurrentPageMarkup();
    const result: Record<number, string> = {};
    for (const [page, json] of markupDataRef.current.entries()) {
      result[page] = json;
    }
    return result;
  }, []);

  function saveCurrentPageMarkup() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      markupDataRef.current.set(
        currentPageRef.current,
        JSON.stringify(canvas.toJSON()),
      );
    } else {
      markupDataRef.current.delete(currentPageRef.current);
    }
  }

  function loadPageMarkup(page: number) {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
    const json = markupDataRef.current.get(page);
    if (json) {
      canvas.loadFromJSON(json).then(() => {
        canvas.renderAll();
      });
    }
  }

  function goToPage(page: number) {
    const clamped = clamp(page, 1, totalPagesRef.current || 1);
    if (clamped === currentPageRef.current) return;
    saveCurrentPageMarkup();
    currentPageRef.current = clamped;
    setPageNumber(clamped);
    loadPageMarkup(clamped);
    onPageChange?.({
      currentPage: clamped,
      totalPages: totalPagesRef.current,
    });
  }

  function updateScale(nextScale: number) {
    const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    scaleRef.current = clamped;
    setScale(clamped);
  }

  // scale 변경 시 fabric canvas 크기 + viewport transform 동기화
  function syncFabricToScale(canvas: FabricCanvas, newScale: number) {
    const pdfCanvas = wrapperRef.current?.querySelector(
      ".react-pdf__Page__canvas",
    ) as HTMLCanvasElement | null;

    if (!pdfCanvas) return;

    const width = pdfCanvas.offsetWidth;
    const height = pdfCanvas.offsetHeight;

    canvas.setDimensions({ width, height });
    // viewport transform: 마크업은 scale=1 좌표계, 렌더만 확대
    canvas.setViewportTransform([newScale, 0, 0, newScale, 0, 0]);
    canvas.renderAll();
  }

  useImperativeHandle(
    ref,
    () => ({
      fitView: () => updateScale(1),
      zoomIn: () => updateScale(scaleRef.current + SCALE_STEP),
      zoomOut: () => updateScale(scaleRef.current - SCALE_STEP),
      goToPage,
      nextPage: () => goToPage(currentPageRef.current + 1),
      prevPage: () => goToPage(currentPageRef.current - 1),
      getMarkupData,
      printWithMarkup: async () => {
        await handlePrint();
      },
    }),
    [getMarkupData],
  );

  useEffect(() => {
    onStatusChange?.({ errorMessage, status });
  }, [errorMessage, onStatusChange, status]);

  // PDF 페이지 렌더 완료 후 fabric canvas 초기화/리사이즈
  function handlePageRenderSuccess() {
    const pdfCanvas = wrapperRef.current?.querySelector(
      ".react-pdf__Page__canvas",
    ) as HTMLCanvasElement | null;

    if (!pdfCanvas) return;

    const width = pdfCanvas.offsetWidth;
    const height = pdfCanvas.offsetHeight;

    if (fabricCanvasRef.current) {
      syncFabricToScale(fabricCanvasRef.current, scaleRef.current);
    } else if (!fabricInitializedRef.current) {
      initFabricCanvas(width, height);
    }

    setStatus("ready");
    setErrorMessage(null);
  }

  function initFabricCanvas(width: number, height: number) {
    const overlay = fabricOverlayRef.current;
    if (!overlay || fabricInitializedRef.current) return;
    fabricInitializedRef.current = true;

    const canvasEl = document.createElement("canvas");
    canvasEl.width = width;
    canvasEl.height = height;
    overlay.appendChild(canvasEl);

    const fc = new FabricCanvas(canvasEl, {
      width,
      height,
      selection: true,
    });

    fabricCanvasRef.current = fc;

    // fabric wrapper를 overlay에 맞게 배치
    const fabricWrapper = overlay.querySelector(
      ".canvas-container",
    ) as HTMLDivElement | null;
    if (fabricWrapper) {
      fabricWrapper.style.position = "absolute";
      fabricWrapper.style.left = "0";
      fabricWrapper.style.top = "0";
    }

    // 초기 viewport transform 적용
    fc.setViewportTransform([
      scaleRef.current, 0, 0, scaleRef.current, 0, 0,
    ]);

    // --- 이벤트 바인딩 ---

    fc.on("mouse:down", (opt) => {
      const tool = activeToolRef.current;
      if (tool === "select" || tool === "pen") return;

      // getScenePoint: viewport transform을 역변환하여 scale=1 좌표를 반환
      const pointer = fc.getScenePoint(opt.e);

      if (tool === "text") {
        const text = new IText("텍스트 입력", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fill: strokeColorRef.current,
          fontFamily: "sans-serif",
        });
        fc.add(text);
        fc.skipTargetFind = false;
        text.selectable = true;
        text.evented = true;
        fc.setActiveObject(text);
        text.enterEditing();
        text.on("editing:exited", () => {
          text.selectable = false;
          text.evented = false;
          fc.skipTargetFind = true;
          fc.renderAll();
          notifyMarkupChange();
        });
        fc.renderAll();
        return;
      }

      drawingRef.current = {
        startX: pointer.x,
        startY: pointer.y,
        object: null,
      };
    });

    fc.on("mouse:move", (opt) => {
      if (!drawingRef.current) return;

      const tool = activeToolRef.current;
      const pointer = fc.getScenePoint(opt.e);
      const { startX, startY, object: prev } = drawingRef.current;

      if (prev) {
        fc.remove(prev);
      }

      const color = strokeColorRef.current;
      const sw = strokeWidthRef.current;
      let shape: FabricObject | null = null;

      if (tool === "line") {
        shape = new Line([startX, startY, pointer.x, pointer.y], {
          stroke: color,
          strokeWidth: sw,
          selectable: false,
          evented: false,
        });
      } else if (tool === "rectangle") {
        shape = new Rect({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
          fill: "transparent",
          stroke: color,
          strokeWidth: sw,
          selectable: false,
          evented: false,
        });
      } else if (tool === "arrow") {
        shape = createArrowShape(
          startX, startY, pointer.x, pointer.y, color, sw,
        );
      }

      if (shape) {
        fc.add(shape);
        drawingRef.current.object = shape;
        fc.renderAll();
      }
    });

    fc.on("mouse:up", () => {
      if (drawingRef.current?.object) {
        fc.renderAll();
        notifyMarkupChange();
      }
      drawingRef.current = null;
    });

    fc.on("path:created", () => {
      notifyMarkupChange();
    });

    // Delete/Backspace로 선택 객체 삭제
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const active = fc.getActiveObject();
      if (active instanceof IText && active.isEditing) return;

      const targets = fc.getActiveObjects();
      if (targets.length === 0) return;

      e.preventDefault();
      fc.discardActiveObject();
      for (const obj of targets) {
        fc.remove(obj);
      }
      fc.renderAll();
      notifyMarkupChange();
    }

    document.addEventListener("keydown", handleKeyDown);
    keydownHandlerRef.current = handleKeyDown;

    // 초기 도구 상태 적용
    applyToolMode(fc);
  }

  function applyToolMode(canvas: FabricCanvas) {
    const tool = activeToolRef.current;
    drawingRef.current = null;
    canvas.discardActiveObject();

    const isSelect = tool === "select";

    canvas.skipTargetFind = !isSelect;

    for (const obj of canvas.getObjects()) {
      obj.selectable = isSelect;
      obj.evented = isSelect;
    }

    if (tool === "pen") {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = strokeColorRef.current;
      brush.width = strokeWidthRef.current;
      canvas.freeDrawingBrush = brush;
      canvas.selection = false;
    } else {
      canvas.isDrawingMode = false;
      if (isSelect) {
        canvas.selection = true;
        canvas.defaultCursor = "default";
      } else {
        canvas.selection = false;
        canvas.defaultCursor = "crosshair";
      }
    }
    canvas.renderAll();
  }

  // 도구 변경 시 fabric 모드 전환
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    applyToolMode(canvas);
  }, [activeTool, strokeColor, strokeWidth]);

  function createArrowShape(
    x1: number, y1: number, x2: number, y2: number,
    color: string, sw: number,
  ): FabricObject {
    const headLength = Math.max(12, sw * 4);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    const line = new Line([x1, y1, x2, y2], {
      stroke: color,
      strokeWidth: sw,
    });

    const headAngle = (angle * 180) / Math.PI;
    const head = new Triangle({
      left: x2,
      top: y2,
      width: headLength,
      height: headLength,
      fill: color,
      angle: headAngle + 90,
      originX: "center",
      originY: "center",
    });

    return new Group([line, head], { selectable: false, evented: false });
  }

  function notifyMarkupChange() {
    saveCurrentPageMarkup();
    onMarkupChange?.(getMarkupData());
  }

  async function handlePrint() {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    saveCurrentPageMarkup();

    const pdfCanvas = wrapperRef.current?.querySelector(
      ".react-pdf__Page__canvas",
    ) as HTMLCanvasElement | null;

    if (!pdfCanvas) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const mergedCanvas = document.createElement("canvas");
    mergedCanvas.width = pdfCanvas.width;
    mergedCanvas.height = pdfCanvas.height;
    const ctx = mergedCanvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(pdfCanvas, 0, 0);
      const fabricEl = canvas.toCanvasElement();
      ctx.drawImage(fabricEl, 0, 0, mergedCanvas.width, mergedCanvas.height);
    }

    const dataUrl = mergedCanvas.toDataURL("image/png");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${ariaLabel} - 인쇄</title>
          <style>
            @media print { body { margin: 0; } img { width: 100%; } }
            body { margin: 0; background: #fff; }
            img { width: 100%; display: block; }
          </style>
        </head>
        <body><img src="${dataUrl}" /></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  function handleDocumentLoadSuccess(pdf: { numPages: number }) {
    totalPagesRef.current = pdf.numPages;
    setTotalPages(pdf.numPages);
    onPageChange?.({
      currentPage: currentPageRef.current,
      totalPages: pdf.numPages,
    });
  }

  function handleDocumentLoadError(error: Error) {
    setStatus("error");
    setErrorMessage(error.message || "PDF 파일을 불러오지 못했습니다.");
  }

  // Ctrl+휠 줌
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      updateScale(scaleRef.current + delta);
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      if (keydownHandlerRef.current) {
        document.removeEventListener("keydown", keydownHandlerRef.current);
        keydownHandlerRef.current = null;
      }
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
      fabricInitializedRef.current = false;
    };
  }, []);

  const statusLabel =
    status === "ready"
      ? "문서 준비 완료"
      : status === "loading"
        ? "문서 로딩 중"
        : "불러오기 실패";

  return (
    <div
      className={cn(
        "relative min-h-[18rem] overflow-hidden bg-muted/20",
        className,
      )}
    >
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-auto">
        <div
          className="flex justify-center p-4"
          style={{ minWidth: "100%", minHeight: "100%" }}
        >
          <div ref={wrapperRef} className="relative inline-block shrink-0">
            {/* PDF: scale prop으로 벡터 렌더링 — 항상 선명 */}
            <Document
              file={src}
              loading={null}
              onLoadError={handleDocumentLoadError}
              onLoadSuccess={handleDocumentLoadSuccess}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={null}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={handlePageRenderSuccess}
              />
            </Document>
            {/* fabric.js 오버레이: viewport transform으로 마크업 스케일 */}
            <div
              ref={fabricOverlayRef}
              aria-busy={status === "loading"}
              aria-label={ariaLabel}
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>

      {status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border bg-background/90 px-5 py-4 text-center shadow-sm backdrop-blur">
            {status === "loading" ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    PDF 문서를 불러오는 중입니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    페이지가 준비되면 마크업과 탐색을 바로 시작할 수 있습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <TriangleAlert className="h-6 w-6 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    문서를 표시하지 못했습니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {errorMessage ??
                      "파일 형식 또는 경로를 다시 확인해 주세요."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {showStatusBadge ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between">
          <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            {statusLabel}
          </div>
          {totalPages > 0 ? (
            <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              {pageNumber} / {totalPages} 페이지 · {Math.round(scale * 100)}%
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
