import { useRef } from "react";
import { RotateCcw, ScanSearch } from "lucide-react";
import { Button, cn } from "@fabbit/ui";
import {
  GltfViewerCanvas,
  type GltfViewerCanvasHandle,
  type GltfViewerRenderMode,
} from "./gltf-viewer-canvas";

export interface GltfViewerProps {
  src: string;
  autoRotate?: boolean;
  className?: string;
  title?: string;
  description?: string;
  renderMode?: GltfViewerRenderMode;
  resourceUrls?: Record<string, string>;
  showGrid?: boolean;
}

export function GltfViewer({
  src,
  autoRotate = false,
  className,
  title = "GLTF 뷰어",
  description = "마우스로 회전하고 확대하며 3D 모델 구성을 확인할 수 있습니다.",
  renderMode = "solid",
  resourceUrls,
  showGrid = true,
}: GltfViewerProps) {
  const canvasRef = useRef<GltfViewerCanvasHandle>(null);

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="self-start cursor-pointer sm:self-auto"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => canvasRef.current?.fitView()}
          >
            <ScanSearch className="h-4 w-4" />
            맞춤 보기
          </Button>
          <Button
            className="self-start cursor-pointer sm:self-auto"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => canvasRef.current?.resetView()}
          >
            <RotateCcw className="h-4 w-4" />
            시점 초기화
          </Button>
        </div>
      </div>

      <GltfViewerCanvas
        ref={canvasRef}
        ariaLabel={title}
        autoRotate={autoRotate}
        className="aspect-[16/10]"
        renderMode={renderMode}
        resourceUrls={resourceUrls}
        showGrid={showGrid}
        src={src}
      />
    </div>
  );
}
