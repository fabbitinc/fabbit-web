import { listChangeRequestsApiV1ChangesGet } from "@/api/generated/orval/changes/changes";
import { listIssuesApiV1IssuesGet } from "@/api/generated/orval/issues/issues";
import type {
  ChangeRequestListQueryDto,
  IssueListQueryDto,
} from "@/features/change-management/api/change-management.types";
import type {
  ChangeManagementItemModel,
  ChangeManagementListModel,
  ChangeManagementUserModel,
} from "@/features/change-management/types/change-management-model";

interface ChangeManagementSourceUser {
  user_id: string;
  full_name: string;
  profile_image_url?: string | null;
}

interface ChangeManagementSourceLabel {
  id: string;
  name: string;
  color: string;
}

interface ChangeManagementSourceItem {
  id: string;
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  created_by?: { full_name: string } | null;
  labels?: ChangeManagementSourceLabel[];
  assignees?: ChangeManagementSourceUser[];
  comments_count?: number;
  cr_state?: string | null;
}

export async function fetchIssueList(query: IssueListQueryDto): Promise<ChangeManagementListModel> {
  const response = await listIssuesApiV1IssuesGet(query);

  return {
    openCount: response.open_count,
    closedCount: response.closed_count,
    total: response.total,
    offset: response.offset,
    limit: response.limit,
    items: response.items.map((item) => toChangeManagementItemModel("issues", item)),
  };
}

export async function fetchChangeRequestList(query: ChangeRequestListQueryDto): Promise<ChangeManagementListModel> {
  const response = await listChangeRequestsApiV1ChangesGet(query);

  return {
    openCount: response.open_count,
    closedCount: response.closed_count,
    total: response.total,
    offset: response.offset,
    limit: response.limit,
    items: response.items.map((item) => toChangeManagementItemModel("requests", item)),
  };
}

function toChangeManagementUserModel(
  user: ChangeManagementSourceUser,
): ChangeManagementUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toChangeManagementItemModel(
  kind: ChangeManagementItemModel["kind"],
  item: ChangeManagementSourceItem,
): ChangeManagementItemModel {
  return {
    id: item.id,
    number: item.number,
    kind,
    title: item.title,
    state: item.state,
    crState: item.cr_state ?? null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by?.full_name ?? null,
    labels: (item.labels ?? []).map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })),
    assignees: (item.assignees ?? []).map(toChangeManagementUserModel),
    commentsCount: item.comments_count ?? 0,
  };
}
