import { useSearchParams } from "react-router-dom";
import { PartsListScreen } from "@/features/parts/components/parts-list-screen";
import type { PartsListQueryState, PartListSortKey, PartListSortOrder } from "@/features/parts/types/parts-model";

const defaultQueryState: PartsListQueryState = {
  query: "",
  category: null,
  lifecycleState: null,
  hasDrawing: null,
  hasChildren: null,
  page: 1,
  pageSize: 20,
  sortKey: "partNumber",
  sortOrder: "asc",
};

const validSortKeys = new Set<PartListSortKey>(["partNumber", "name", "category", "revision", "lifecycleState"]);
const validSortOrders = new Set<PartListSortOrder>(["asc", "desc"]);
const validPageSizes = new Set([20, 40, 80]);

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

export function PartsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortKeyParam = searchParams.get("sort");
  const sortOrderParam = searchParams.get("order");
  const pageSizeParam = parsePositiveInteger(searchParams.get("pageSize"), defaultQueryState.pageSize);

  const queryState: PartsListQueryState = {
    query: searchParams.get("q") ?? defaultQueryState.query,
    category: searchParams.get("category"),
    lifecycleState: searchParams.get("lifecycle"),
    hasDrawing: parseTriState(searchParams.get("drawing")),
    hasChildren: parseTriState(searchParams.get("children")),
    page: parsePositiveInteger(searchParams.get("page"), defaultQueryState.page),
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
      queryState={queryState}
      onCategoryChange={(category) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (!category) {
            next.delete("category");
          } else {
            next.set("category", category);
          }
          next.delete("page");
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
          next.delete("page");
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
          next.delete("page");
          return next;
        });
      }}
      onLifecycleStateChange={(lifecycleState) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (!lifecycleState) {
            next.delete("lifecycle");
          } else {
            next.set("lifecycle", lifecycleState);
          }
          next.delete("page");
          return next;
        });
      }}
      onPageChange={(page) => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (page <= 1) {
            next.delete("page");
          } else {
            next.set("page", String(page));
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
          next.delete("page");
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
          next.delete("page");
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

          return next;
        });
      }}
    />
  );
}
