export interface ProjectListItemModel {
  id: string;
  name: string;
  description: string | null;
  partCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResultModel {
  total: number;
  offset: number;
  limit: number;
  items: ProjectListItemModel[];
}

export type ProjectListSortKey = "name" | "part-count";
export type ProjectListSortDirection = "asc" | "desc";

export interface ProjectListQueryState {
  query: string;
  page: number;
  pageSize: number;
  sortKey: ProjectListSortKey;
  sortDirection: ProjectListSortDirection;
}
