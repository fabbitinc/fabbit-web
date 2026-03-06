import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChangeManagementScreen,
  type ChangeManagementQueryState,
  type ChangeManagementState,
  type ChangeManagementView,
} from "@/features/change-management";

const defaultQueryState: ChangeManagementQueryState = {
  view: "issues",
  state: "open",
  query: "",
  page: 1,
  pageSize: 20,
};

const validViews = new Set<ChangeManagementView>(["issues", "requests"]);
const validStates = new Set<ChangeManagementState>(["open", "closed"]);
const validPageSizes = new Set([20, 40, 80]);

function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function ChangeManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get("view");
  const stateParam = searchParams.get("state");
  const pageSizeParam = parsePositiveInteger(searchParams.get("pageSize"), defaultQueryState.pageSize);

  const queryState: ChangeManagementQueryState = {
    view: viewParam && validViews.has(viewParam as ChangeManagementView)
      ? (viewParam as ChangeManagementView)
      : defaultQueryState.view,
    state: stateParam && validStates.has(stateParam as ChangeManagementState)
      ? (stateParam as ChangeManagementState)
      : defaultQueryState.state,
    query: searchParams.get("q") ?? defaultQueryState.query,
    page: parsePositiveInteger(searchParams.get("page"), defaultQueryState.page),
    pageSize: validPageSizes.has(pageSizeParam) ? pageSizeParam : defaultQueryState.pageSize,
  };

  const updateSearchParams = useCallback(
    (updater: (current: URLSearchParams) => URLSearchParams, replace = false) => {
      setSearchParams((previous) => updater(new URLSearchParams(previous)), { replace });
    },
    [setSearchParams],
  );

  return (
    <ChangeManagementScreen
      queryState={queryState}
      onPageChange={(page) => {
        updateSearchParams((next) => {
          if (page <= 1) {
            next.delete("page");
          } else {
            next.set("page", String(page));
          }
          return next;
        });
      }}
      onPageSizeChange={(pageSize) => {
        updateSearchParams((next) => {
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
        updateSearchParams((next) => {
          const normalized = query.trim();
          if (!normalized) {
            next.delete("q");
          } else {
            next.set("q", normalized);
          }
          next.delete("page");
          return next;
        }, true);
      }}
      onStateChange={(state) => {
        updateSearchParams((next) => {
          if (state === defaultQueryState.state) {
            next.delete("state");
          } else {
            next.set("state", state);
          }
          next.delete("page");
          return next;
        }, true);
      }}
      onViewChange={(view) => {
        updateSearchParams((next) => {
          if (view === defaultQueryState.view) {
            next.delete("view");
          } else {
            next.set("view", view);
          }
          next.delete("page");
          return next;
        }, true);
      }}
    />
  );
}
