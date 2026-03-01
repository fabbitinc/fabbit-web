import { apiClient } from "./client";
import type { ActivityDto, ActivityListResponse, ActivityScope } from "./types";
import type { TimelineUserDto } from "./types";

interface ApiActivityResponse {
  id: string;
  action: string;
  scope: string | null;
  actor_id: string;
  detail: Record<string, unknown> | null;
  created_at: string;
}

interface ApiTimelineUserResponse {
  id: string;
  full_name: string;
  profile_image_url: string | null;
}

interface ApiActivityListResponse {
  items: ApiActivityResponse[];
  next_cursor: string | null;
  users: Record<string, ApiTimelineUserResponse>;
}

function mapActivity(raw: ApiActivityResponse): ActivityDto {
  return {
    id: raw.id,
    action: raw.action,
    scope: raw.scope,
    actorId: raw.actor_id,
    detail: raw.detail,
    createdAt: raw.created_at,
  };
}

function mapUsers(raw: Record<string, ApiTimelineUserResponse>): Record<string, TimelineUserDto> {
  const result: Record<string, TimelineUserDto> = {};
  for (const [key, u] of Object.entries(raw)) {
    result[key] = { id: u.id, fullName: u.full_name, profileImageUrl: u.profile_image_url };
  }
  return result;
}

export async function getProjectActivities(
  projectId: string,
  params?: { cursor?: string; limit?: number; scope?: ActivityScope[] },
): Promise<ActivityListResponse> {
  const response = await apiClient.get<ApiActivityListResponse>(
    `/api/v1/projects/${projectId}/activities`,
    {
      params: {
        cursor: params?.cursor,
        limit: params?.limit,
        scope: params?.scope,
      },
    },
  );
  return {
    items: response.data.items.map(mapActivity),
    nextCursor: response.data.next_cursor,
    users: mapUsers(response.data.users ?? {}),
  };
}
