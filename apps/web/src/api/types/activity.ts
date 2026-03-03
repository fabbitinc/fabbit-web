import type { TimelineUserDto } from "./issue";

export type Action =
  | "issue:state_changed"
  | "issue:title_changed"
  | "cr:state_changed"
  | "issue:assignee_changed"
  | "issue:reviewer_changed"
  | "issue:label_changed"
  | "issue:part_changed"
  | "issue:file_attached"
  | "issue:file_detached"
  | "cr:issue_changed"
  | "issue:cr_changed"
  | "issue:mentioned"
  | "issue:created"
  | "cr:created"
  | "issue:closed"
  | "issue:reopened"
  | "cr:merged";

export type ActivityScope = "issue" | "cr" | "part" | "assignee" | "reviewer" | "label" | "file" | "mention" | "project";

export interface ActivityDto {
  id: string;
  action: Action;
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
