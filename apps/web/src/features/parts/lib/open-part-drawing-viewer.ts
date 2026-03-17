import type { PartDrawingPreviewDrawing } from "@fabbit/components";

interface OpenPartDrawingViewerParams {
  category?: string | null;
  description?: string | null;
  drawing: PartDrawingPreviewDrawing;
  partNumber?: string | null;
  revision?: string | null;
  title: string;
}

export function openPartDrawingViewer({
  category,
  description,
  drawing,
  partNumber,
  revision,
  title,
}: OpenPartDrawingViewerParams) {
  if (!drawing.viewerType || !drawing.viewerUrl) {
    return;
  }

  const searchParams = new URLSearchParams();

  searchParams.set("src", drawing.viewerUrl);
  searchParams.set("title", title);
  searchParams.set("viewerType", drawing.viewerType);

  if (partNumber) {
    searchParams.set("partNumber", partNumber);
  }

  if (revision) {
    searchParams.set("revision", revision);
  }

  if (category) {
    searchParams.set("category", category);
  }

  if (description) {
    searchParams.set("description", description);
  }

  if (drawing.name) {
    searchParams.set("fileName", drawing.name);
  } else if (drawing.drawingNumber) {
    searchParams.set("fileName", drawing.drawingNumber);
  }

  window.open(
    `/parts/drawing-viewer?${searchParams.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
}
