import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BomExploreScreen } from "@/features/parts/components/bom-explore-screen";
import type { PartBomDirection, PartBomExploreView } from "@/features/parts/types/parts-model";

export function BomExplorePage() {
  const { partId } = useParams<{ partId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const direction = useMemo<PartBomDirection>(
    () => (searchParams.get("direction") === "reverse" ? "reverse" : "forward"),
    [searchParams],
  );
  const viewType = useMemo<PartBomExploreView>(() => {
    const value = searchParams.get("view");
    if (value === "single-level" || value === "flattened") {
      return value;
    }
    return "multi-level";
  }, [searchParams]);
  const searchQuery = searchParams.get("q") ?? "";
  const singleLevelRootKey = searchParams.get("root") ?? "root";

  if (!partId) {
    return null;
  }

  return (
    <BomExploreScreen
      partId={partId}
      direction={direction}
      viewType={viewType}
      searchQuery={searchQuery}
      singleLevelRootKey={singleLevelRootKey}
      onDirectionChange={(nextDirection) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (nextDirection === "forward") {
            next.delete("direction");
          } else {
            next.set("direction", nextDirection);
          }
          next.delete("root");
          return next;
        });
      }}
      onViewTypeChange={(nextViewType) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (nextViewType === "multi-level") {
            next.delete("view");
          } else {
            next.set("view", nextViewType);
          }
          if (nextViewType !== "single-level") {
            next.delete("root");
          }
          return next;
        });
      }}
      onSearchChange={(nextQuery) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (nextQuery.trim()) {
            next.set("q", nextQuery);
          } else {
            next.delete("q");
          }
          return next;
        });
      }}
      onSingleLevelRootKeyChange={(nodeKey) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (nodeKey === "root") {
            next.delete("root");
          } else {
            next.set("root", nodeKey);
          }
          return next;
        });
      }}
    />
  );
}
