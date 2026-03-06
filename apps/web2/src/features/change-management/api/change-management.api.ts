import { apiClient } from "@/api/client";
import type {
  ChangeRequestListQueryDto,
  ChangeRequestListResponseDto,
  IssueListQueryDto,
  IssueListResponseDto,
} from "@/features/change-management/api/change-management.types";
import type {
  ChangeManagementItemModel,
  ChangeManagementListModel,
  ChangeManagementUserModel,
} from "@/features/change-management/types/change-management-model";

export async function fetchIssueList(query: IssueListQueryDto): Promise<ChangeManagementListModel> {
  const response = await apiClient.get<IssueListResponseDto>("/api/v1/issues", {
    params: query,
  });

  return {
    openCount: response.data.open_count,
    closedCount: response.data.closed_count,
    total: response.data.total,
    offset: response.data.offset,
    limit: response.data.limit,
    items: response.data.items.map((item) => toChangeManagementItemModel("issues", item)),
  };
}

export async function fetchChangeRequestList(query: ChangeRequestListQueryDto): Promise<ChangeManagementListModel> {
  const response = await apiClient.get<ChangeRequestListResponseDto>("/api/v1/changes", {
    params: query,
  });

  return {
    openCount: response.data.open_count,
    closedCount: response.data.closed_count,
    total: response.data.total,
    offset: response.data.offset,
    limit: response.data.limit,
    items: response.data.items.map((item) => toChangeManagementItemModel("requests", item)),
  };
}

function toChangeManagementUserModel(
  user:
    | IssueListResponseDto["items"][number]["assignees"][number]
    | ChangeRequestListResponseDto["items"][number]["assignees"][number],
): ChangeManagementUserModel {
  return {
    userId: user.user_id,
    fullName: user.full_name,
    profileImageUrl: user.profile_image_url ?? null,
  };
}

function toChangeManagementItemModel(
  kind: ChangeManagementItemModel["kind"],
  item: IssueListResponseDto["items"][number] | ChangeRequestListResponseDto["items"][number],
): ChangeManagementItemModel {
  return {
    id: item.id,
    number: item.number,
    kind,
    title: item.title,
    state: item.state,
    crState: "cr_state" in item ? item.cr_state : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by?.full_name ?? null,
    labels: item.labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
    })),
    assignees: item.assignees.map(toChangeManagementUserModel),
    commentsCount: item.comments_count,
  };
}
