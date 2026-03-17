import { useSearchParams } from "react-router-dom";
import {
  PartDetailResponseLifecycleState,
} from "@/api/generated/orval/model/partDetailResponseLifecycleState";
import { PartsListScreen } from "@/features/parts/components/parts-list-screen";
import type { PartsListQueryState, PartListSortKey, PartListSortOrder } from "@/features/parts/types/parts-model";
import { useSettingsQuery } from "@/features/settings";

const defaultQueryState: PartsListQueryState = {
  query: "",
  cursor: null,
  cursorDirection: null,
  mineOnly: false,
  category: null,
  lifecycleState: null,
  hasDrawing: null,
  hasChildren: null,
  pageSize: 15,
  sortKey: "partNumber",
  sortOrder: "asc",
};

const validSortKeys = new Set<PartListSortKey>(["partNumber", "name", "category", "revision", "lifecycleState"]);
const validSortOrders = new Set<PartListSortOrder>(["asc", "desc"]);
const validPageSizes = new Set([15, 30, 50]);
const validPrimaryTabs = new Set(["master", "workbench"]);
const validLifecycleStates = new Set(Object.values(PartDetailResponseLifecycleState));

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTriState(value: string | null) {
  if (value === "with") {
    return true;
  }

  if (value === "without") {
    return false;
  }

  return null;
}

function parseLifecycleState(value: string | null): PartsListQueryState["lifecycleState"] {
  if (
    !value ||
    !validLifecycleStates.has(value as NonNullable<PartsListQueryState["lifecycleState"]>)
  ) {
    return null;
  }

  return value as PartsListQueryState["lifecycleState"];
}

export function PartsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const settingsQuery = useSettingsQuery();

  const sortKeyParam = searchParams.get("sort");
  const sortOrderParam = searchParams.get("order");
  const pageSizeParam = parsePositiveInteger(searchParams.get("pageSize"), defaultQueryState.pageSize);
  const partWorkflowMode = settingsQuery.data?.partWorkflowMode ?? "DIRECT";
  const isDirectMode = partWorkflowMode === "DIRECT";
  const menuParam = searchParams.get("menu");
  const activePrimaryTab =
    menuParam && validPrimaryTabs.has(menuParam)
      ? (menuParam as "master" | "workbench")
      : "master";
  const activeWorkbenchFilter =
    activePrimaryTab !== "workbench"
      ? "draft"
      : "draft";

  const queryState: PartsListQueryState = {
    query: searchParams.get("q") ?? defaultQueryState.query,
    cursor: searchParams.get("cursor"),
    cursorDirection:
      searchParams.get("cursorDir") === "next" || searchParams.get("cursorDir") === "prev"
        ? (searchParams.get("cursorDir") as PartsListQueryState["cursorDirection"])
        : defaultQueryState.cursorDirection,
    mineOnly: searchParams.get("mine") === "1",
    category: searchParams.get("category"),
    lifecycleState: parseLifecycleState(searchParams.get("lifecycle")),
    hasDrawing: parseTriState(searchParams.get("drawing")),
    hasChildren: parseTriState(searchParams.get("children")),
    pageSize: validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultQueryState.pageSize,
    sortKey: sortKeyParam && validSortKeys.has(sortKeyParam as PartListSortKey)
      ? (sortKeyParam as PartListSortKey)
      : defaultQueryState.sortKey,
    sortOrder: sortOrderParam && validSortOrders.has(sortOrderParam as PartListSortOrder)
      ? (sortOrderParam as PartListSortOrder)
      : defaultQueryState.sortOrder,
  };

  return (
    <PartsListScreen
      activePrimaryTab={activePrimaryTab}
      activeWorkbenchFilter={activeWorkbenchFilter}
      mode={isDirectMode ? "direct" : "change-managed"}
      queryState={queryState}
      onPrimaryTabChange={(tab) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (tab === "master") {
            next.delete("menu");
            next.delete("tab");
          } else {
            next.set("menu", tab);
            next.delete("tab");
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onWorkbenchFilterChange={(filter) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (activePrimaryTab !== "workbench") {
            next.set("menu", "workbench");
          }
          if (filter === "draft") {
            next.delete("tab");
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onCategoryChange={(category) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (!category) {
            next.delete("category");
          } else {
            next.set("category", category);
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onHasChildrenChange={(hasChildren) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (hasChildren == null) {
            next.delete("children");
          } else {
            next.set("children", hasChildren ? "with" : "without");
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onHasDrawingChange={(hasDrawing) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (hasDrawing == null) {
            next.delete("drawing");
          } else {
            next.set("drawing", hasDrawing ? "with" : "without");
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onLifecycleStateChange={(lifecycleState) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          const normalizedLifecycleState = parseLifecycleState(lifecycleState);

          if (!normalizedLifecycleState) {
            next.delete("lifecycle");
          } else {
            next.set("lifecycle", normalizedLifecycleState);
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onCursorChange={(cursor, direction) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (!cursor || !direction) {
            next.delete("cursor");
            next.delete("cursorDir");
          } else {
            next.set("cursor", cursor);
            next.set("cursorDir", direction);
          }
          return next;
        });
      }}
      onPageSizeChange={(pageSize) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (pageSize === defaultQueryState.pageSize) {
            next.delete("pageSize");
          } else {
            next.set("pageSize", String(pageSize));
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onMineOnlyChange={(mineOnly) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (mineOnly) {
            next.set("mine", "1");
          } else {
            next.delete("mine");
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onQueryChange={(query) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          const normalized = query.trim();
          if (!normalized) {
            next.delete("q");
          } else {
            next.set("q", normalized);
          }
          next.delete("cursor");
          next.delete("cursorDir");
          return next;
        });
      }}
      onSortChange={(sortKey) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          const nextOrder =
            queryState.sortKey === sortKey && queryState.sortOrder === "asc"
              ? "desc"
              : "asc";

          if (sortKey === defaultQueryState.sortKey) {
            next.delete("sort");
          } else {
            next.set("sort", sortKey);
          }

          if (sortKey === defaultQueryState.sortKey && nextOrder === defaultQueryState.sortOrder) {
            next.delete("order");
          } else {
            next.set("order", nextOrder);
          }

          next.delete("cursor");
          next.delete("cursorDir");

          return next;
        });
      }}
    />
  );
}
