import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { BomExploreScreen } from "@/features/parts/components/bom-explore-screen";
import type { PartBomDirection, PartBomExploreView } from "@/features/parts/types/parts-model";

function parseExpandedKeys(value: string | null): Set<string> {
  if (!value) {
    return new Set(["root"]);
  }

  const keys = value.split(",").filter(Boolean);

  if (keys.length === 0) {
    return new Set(["root"]);
  }

  keys.push("root");
  return new Set(keys);
}

function serializeExpandedKeys(keys: Set<string>): string | null {
  const filtered = [...keys].filter((key) => key !== "root");

  if (filtered.length === 0) {
    return null;
  }

  return filtered.join(",");
}

export function BomExplorePage() {
  const { partId, revisionId } = useParams<{
    partId: string;
    revisionId: string;
  }>();
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
  const expandedKeys = useMemo(
    () => parseExpandedKeys(searchParams.get("expanded")),
    [searchParams],
  );

  if (!partId || !revisionId) {
    return null;
  }

  return (
    <BomExploreScreen
      partId={partId}
      revisionId={revisionId}
      direction={direction}
      viewType={viewType}
      searchQuery={searchQuery}
      singleLevelRootKey={singleLevelRootKey}
      expandedKeys={expandedKeys}
      onExpandedKeysChange={(keys) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          const serialized = serializeExpandedKeys(keys);
          if (serialized) {
            next.set("expanded", serialized);
          } else {
            next.delete("expanded");
          }
          return next;
        });
      }}
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
