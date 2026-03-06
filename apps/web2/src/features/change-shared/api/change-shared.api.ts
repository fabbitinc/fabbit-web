import { lookupChangeRequestsApiV1ChangesLookupGet } from "@/api/generated/orval/changes/changes";
import { lookupIssuesApiV1IssuesLookupGet } from "@/api/generated/orval/issues/issues";
import { lookupLabelsApiV1LabelsLookupGet } from "@/api/generated/orval/labels/labels";
import { lookupMembersApiV1MembersLookupGet } from "@/api/generated/orval/members/members";
import { lookupPartsApiV1PartsLookupGet } from "@/api/generated/orval/parts/parts";
import type {
  ChangeLookupQueryDto,
  IssueLookupQueryDto,
  LabelLookupQueryDto,
  MemberLookupQueryDto,
  PartLookupQueryDto,
} from "@/features/change-shared/api/change-shared.types";
import type {
  LookupChangeModel,
  LookupIssueModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
} from "@/features/change-shared/types/change-shared-model";

export async function lookupMembers(query: MemberLookupQueryDto): Promise<LookupMemberModel[]> {
  const response = await lookupMembersApiV1MembersLookupGet(query);

  return response.items.map((user) => ({
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    profileImageUrl: user.profile_image_url ?? null,
  }));
}

export async function lookupLabels(query: LabelLookupQueryDto): Promise<LookupLabelModel[]> {
  const response = await lookupLabelsApiV1LabelsLookupGet(query);

  return response.items.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
}

export async function lookupParts(query: PartLookupQueryDto): Promise<LookupPartModel[]> {
  const response = await lookupPartsApiV1PartsLookupGet(query);

  return response.items.map((part) => ({
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  }));
}

export async function lookupIssues(query: IssueLookupQueryDto): Promise<LookupIssueModel[]> {
  const response = await lookupIssuesApiV1IssuesLookupGet(query);

  return response.items.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    type: issue.type === "CHANGE_REQUEST" ? "change_request" : "issue",
  }));
}

export async function lookupChanges(query: ChangeLookupQueryDto): Promise<LookupChangeModel[]> {
  const response = await lookupChangeRequestsApiV1ChangesLookupGet(query);

  return response.items.map((change) => ({
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
    crState: change.cr_state,
  }));
}
