import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ProjectsListScreen,
  type ProjectListQueryState,
  type ProjectListSortDirection,
  type ProjectListSortKey,
} from "@/features/projects-list";

const defaultQueryState: ProjectListQueryState = {
  query: "",
  page: 1,
  pageSize: 15,
  sortKey: "part-count",
  sortDirection: "desc",
};

const validSortKeys = new Set<ProjectListSortKey>(["name", "part-count"]);
const validSortDirections = new Set<ProjectListSortDirection>(["asc", "desc"]);
const validPageSizes = new Set([15, 30, 50]);

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function ProjectListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortKeyParam = searchParams.get("sort");
  const sortDirectionParam = searchParams.get("order");
  const pageSizeParam = parsePositiveInteger(searchParams.get("pageSize"), defaultQueryState.pageSize);

  const queryState: ProjectListQueryState = {
    query: searchParams.get("q") ?? defaultQueryState.query,
    page: parsePositiveInteger(searchParams.get("page"), defaultQueryState.page),
    pageSize: validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultQueryState.pageSize,
    sortKey: sortKeyParam && validSortKeys.has(sortKeyParam as ProjectListSortKey)
      ? (sortKeyParam as ProjectListSortKey)
      : defaultQueryState.sortKey,
    sortDirection: sortDirectionParam && validSortDirections.has(sortDirectionParam as ProjectListSortDirection)
      ? (sortDirectionParam as ProjectListSortDirection)
      : defaultQueryState.sortDirection,
  };

  const updateSearchParams = useCallback(
    (updater: (current: URLSearchParams) => URLSearchParams, replace = false) => {
      setSearchParams((previous) => updater(new URLSearchParams(previous)), { replace });
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (query: string) => {
      updateSearchParams((next) => {
        const normalized = query.trim();

        if (!normalized) {
          next.delete("q");
        } else {
          next.set("q", query);
        }

        next.delete("page");
        return next;
      }, true);
    },
    [updateSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      updateSearchParams((next) => {
        if (page <= 1) {
          next.delete("page");
        } else {
          next.set("page", String(page));
        }
        return next;
      });
    },
    [updateSearchParams],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      updateSearchParams((next) => {
        if (pageSize === defaultQueryState.pageSize) {
          next.delete("pageSize");
        } else {
          next.set("pageSize", String(pageSize));
        }
        next.delete("page");
        return next;
      });
    },
    [updateSearchParams],
  );

  const setSort = useCallback(
    (sortKey: ProjectListSortKey) => {
      updateSearchParams((next) => {
        const nextSortDirection: ProjectListSortDirection =
          queryState.sortKey === sortKey
            ? queryState.sortDirection === "asc"
              ? "desc"
              : "asc"
            : sortKey === "name"
              ? "asc"
              : "desc";

        if (sortKey === defaultQueryState.sortKey && nextSortDirection === defaultQueryState.sortDirection) {
          next.delete("sort");
          next.delete("order");
        } else {
          next.set("sort", sortKey);
          next.set("order", nextSortDirection);
        }

        return next;
      }, true);
    },
    [queryState.sortDirection, queryState.sortKey, updateSearchParams],
  );

  return (
    <ProjectsListScreen
      queryState={queryState}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      onQueryChange={setQuery}
      onSortChange={setSort}
    />
  );
}
