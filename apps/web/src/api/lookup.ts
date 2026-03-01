import { apiClient } from "./client";
import type {
  MemberLookupItemDto,
  IssueLookupItemDto,
} from "./types";

interface ApiMemberLookupItem {
  id: string;
  full_name: string;
  profile_image_url: string | null;
}

interface ApiIssueLookupItem {
  id: string;
  number: number;
  title: string;
  state: string;
  type: string;
}

/** 프로젝트 멤버 lookup (멘션 자동완성용) */
export async function lookupMembers(
  projectId: string,
  search?: string,
  limit = 10,
): Promise<MemberLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiMemberLookupItem[] }>(
    `/api/v1/projects/${projectId}/members/lookup`,
    { params: { search: search || undefined, limit } },
  );
  return data.items.map((m) => ({
    id: m.id,
    fullName: m.full_name,
    profileImageUrl: m.profile_image_url,
  }));
}

/** 프로젝트 이슈 lookup (이슈 참조 자동완성용, type 미지정 시 이슈+CR 모두 반환) */
export async function lookupIssues(
  projectId: string,
  search?: string,
  limit = 10,
  type?: "ISSUE" | "CHANGE_REQUEST",
): Promise<IssueLookupItemDto[]> {
  const { data } = await apiClient.get<{ items: ApiIssueLookupItem[] }>(
    `/api/v1/projects/${projectId}/issues/lookup`,
    { params: { search: search || undefined, limit, type } },
  );
  return data.items.map((i) => ({
    ...i,
    type: i.type === "CHANGE_REQUEST" ? "change_request" as const : "issue" as const,
  }));
}
