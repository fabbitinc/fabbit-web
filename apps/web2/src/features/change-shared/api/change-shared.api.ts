import { apiClient } from "@/api/client";
import type {
  ChangeLookupQueryDto,
  ChangeLookupResponseDto,
  IssueLookupQueryDto,
  IssueLookupResponseDto,
  LabelLookupQueryDto,
  LabelLookupResponseDto,
  MemberLookupQueryDto,
  MemberLookupResponseDto,
  PartLookupQueryDto,
  PartLookupResponseDto,
} from "@/features/change-shared/api/change-shared.types";
import type {
  LookupChangeModel,
  LookupIssueModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";

export async function lookupMembers(query: MemberLookupQueryDto): Promise<LookupMemberModel[]> {
  const response = await apiClient.get<MemberLookupResponseDto>("/api/v1/members/lookup", {
    params: query,
  });

  return response.data.items.map((user) => ({
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    profileImageUrl: user.profile_image_url ?? null,
  }));
}

export async function lookupLabels(query: LabelLookupQueryDto): Promise<LookupLabelModel[]> {
  const response = await apiClient.get<LabelLookupResponseDto>("/api/v1/labels/lookup", {
    params: query,
  });

  return response.data.items.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
}

export async function lookupParts(query: PartLookupQueryDto): Promise<LookupPartModel[]> {
  const response = await apiClient.get<PartLookupResponseDto>("/api/v1/parts/lookup", {
    params: query,
  });

  return response.data.items.map((part) => ({
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  }));
}

export async function lookupIssues(query: IssueLookupQueryDto): Promise<LookupIssueModel[]> {
  const response = await apiClient.get<IssueLookupResponseDto>("/api/v1/issues/lookup", {
    params: query,
  });

  return response.data.items.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    type: issue.type === "CHANGE_REQUEST" ? "change_request" : "issue",
  }));
}

export async function lookupChanges(query: ChangeLookupQueryDto): Promise<LookupChangeModel[]> {
  const response = await apiClient.get<ChangeLookupResponseDto>("/api/v1/changes/lookup", {
    params: query,
  });

  return response.data.items.map((change) => ({
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
    crState: change.cr_state,
  }));
}
