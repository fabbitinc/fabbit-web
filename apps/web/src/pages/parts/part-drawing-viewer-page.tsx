import { GltfViewerScreen, PdfViewerScreen } from "@fabbit/components";
import { Navigate, useSearchParams } from "react-router-dom";

function resolveViewerType(
  value: string | null,
  src: string,
): "GLB" | "PDF" {
  if (value === "PDF" || value === "GLB") {
    return value;
  }

  try {
    const pathname = new URL(src).pathname.toLowerCase();
    if (pathname.endsWith(".pdf")) {
      return "PDF";
    }
  } catch {
    if (src.toLowerCase().includes(".pdf")) {
      return "PDF";
    }
  }

  return "GLB";
}

export function PartDrawingViewerPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const description = searchParams.get("description") ?? undefined;
  const fileName = searchParams.get("fileName") ?? undefined;
  const partNumber = searchParams.get("partNumber") ?? undefined;
  const revision = searchParams.get("revision") ?? undefined;
  const src = searchParams.get("src");

  if (!src) {
    return <Navigate replace to="/parts" />;
  }

  const viewerType = resolveViewerType(
    searchParams.get("viewerType"),
    src,
  );
  const title =
    searchParams.get("title") ??
    (viewerType === "PDF" ? "2D 도면" : "3D 모델");

  if (viewerType === "PDF") {
    return (
      <PdfViewerScreen
        category={category}
        description={description}
        fileName={fileName}
        partNumber={partNumber}
        revision={revision}
        src={src}
        title={title}
      />
    );
  }

  return (
    <GltfViewerScreen
      category={category}
      description={description}
      fileName={fileName}
      partNumber={partNumber}
      revision={revision}
      src={src}
      title={title}
    />
  );
}
