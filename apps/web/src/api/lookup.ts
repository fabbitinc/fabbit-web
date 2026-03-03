import { apiClient } from "./client";
import type {
  MemberLookupItemDto,
  IssueLookupItemDto,
  LabelLookupItemDto,
  TeamLookupItemDto,
  PartLookupItemDto,
  ChangeRequestLookupItemDto,
} from "./types";

interface ApiMemberLookupItem {
  user_id: string;
  full_name: string;
  email: string;
  profile_image_url: string | null;
}

interface ApiIssueLookupItem {
  id: string;
  number: number;
  title: string;
  state: string;
  type: string;
}

interface ApiPartLookupItem {
  id: string;
  part_number: string;
  name: string | null;
}

interface ApiChangeRequestLookupItem {
  id: string;
  number: number;
  title: string;
  state: string;
  cr_state: string;
}

/** 조직 멤버 lookup (picker/autocomplete용) */
export async function lookupOrgMembers(
  search?: string,
  limit = 20,
): Promise<MemberLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiMemberLookupItem[] }>(
    "/api/v1/members/lookup",
    { params: { search: search || undefined, limit } },
  );
  return data.items.map((m) => ({
    id: m.user_id,
    fullName: m.full_name,
    email: m.email,
    profileImageUrl: m.profile_image_url,
  }));
}

/** 팀 lookup (picker/autocomplete용) */
export async function lookupTeams(
  search?: string,
  limit = 10,
): Promise<TeamLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: TeamLookupItemDto[] }>(
    "/api/v1/teams/lookup",
    { params: { search: search || undefined, limit } },
  );
  return data.items;
}

/** 이슈 lookup (picker/autocomplete용, projectId 불필요) */
export async function lookupIssues(
  search?: string,
  limit = 20,
  type?: "ISSUE" | "CHANGE_REQUEST",
): Promise<IssueLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiIssueLookupItem[] }>(
    "/api/v1/issues/lookup",
    { params: { search: search || undefined, limit, type } },
  );
  return data.items.map((i) => ({
    ...i,
    type: i.type === "CHANGE_REQUEST" ? "change_request" as const : "issue" as const,
  }));
}

/** 라벨 lookup (picker/autocomplete용) */
export async function lookupLabels(
  search?: string,
  limit = 50,
): Promise<LabelLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: LabelLookupItemDto[] }>(
    "/api/v1/labels/lookup",
    { params: { search: search || undefined, limit } },
  );
  return data.items;
}

/** 부품 lookup (picker/autocomplete용, 독립) */
export async function lookupParts(
  search?: string,
  limit = 20,
): Promise<PartLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiPartLookupItem[] }>(
    "/api/v1/parts/lookup",
    { params: { search: search || undefined, limit } },
  );
  return data.items.map((p) => ({
    id: p.id,
    partNumber: p.part_number,
    name: p.name,
  }));
}

/** 변경 요청 lookup (picker/autocomplete용) */
export async function lookupChanges(
  search?: string,
  limit = 20,
): Promise<ChangeRequestLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiChangeRequestLookupItem[] }>(
    "/api/v1/changes/lookup",
    { params: { search: search || undefined, limit } },
  );
  return data.items.map((c) => ({
    id: c.id,
    number: c.number,
    title: c.title,
    state: c.state,
    crState: c.cr_state,
  }));
}
