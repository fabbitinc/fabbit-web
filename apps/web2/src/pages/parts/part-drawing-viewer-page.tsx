import { GltfViewerScreen } from "@fabbit/components";
import { Navigate, useSearchParams } from "react-router-dom";

export function PartDrawingViewerPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const description = searchParams.get("description") ?? undefined;
  const fileName = searchParams.get("fileName") ?? undefined;
  const partNumber = searchParams.get("partNumber") ?? undefined;
  const revision = searchParams.get("revision") ?? undefined;
  const src = searchParams.get("src");
  const title = searchParams.get("title") ?? "3D 모델";

  if (!src) {
    return <Navigate replace to="/parts" />;
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
