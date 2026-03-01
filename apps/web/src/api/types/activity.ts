import type { TimelineUserDto } from "./issue";

export type ActivityScope = "issue" | "cr" | "part" | "assignee" | "reviewer" | "label" | "project";

export interface ActivityDto {
  id: string;
  action: string;
  scope: string | null;
  actorId: string;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export interface ActivityListResponse {
  items: ActivityDto[];
  nextCursor: string | null;
  users: Record<string, TimelineUserDto>;
}
