import { lookupChangeRequests as lookupChangeRequestsApiV1ChangesLookupGet } from "@/api/generated/orval/changes/changes";
import { lookupIssues as lookupIssuesApiV1IssuesLookupGet } from "@/api/generated/orval/issues/issues";
import { lookupLabels as lookupLabelsApiV1LabelsLookupGet } from "@/api/generated/orval/labels/labels";
import { lookupMembers1 as lookupMembersApiV1MembersLookupGet } from "@/api/generated/orval/members/members";
import { lookupParts1 as lookupPartsApiV1PartsLookupGet } from "@/api/generated/orval/parts/parts";
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

const DEFAULT_LOOKUP_LIMIT = 5;

function withDefaultLookupLimit<T extends { limit?: number }>(query: T): T {
  return {
    ...query,
    limit: query.limit ?? DEFAULT_LOOKUP_LIMIT,
  };
}

export async function lookupMembers(query: MemberLookupQueryDto): Promise<LookupMemberModel[]> {
  const response = await lookupMembersApiV1MembersLookupGet(withDefaultLookupLimit(query));

  return response.items.map((user) => ({
    userId: user.user_id,
    fullName: user.full_name,
    email: user.email,
    profileImageUrl: user.profile_image_url ?? null,
  }));
}

export async function lookupLabels(query: LabelLookupQueryDto): Promise<LookupLabelModel[]> {
  const response = await lookupLabelsApiV1LabelsLookupGet(withDefaultLookupLimit(query));

  return response.items.map((label) => ({
    id: label.id,
    name: label.name,
    color: label.color,
  }));
}

export async function lookupParts(query: PartLookupQueryDto): Promise<LookupPartModel[]> {
  const response = await lookupPartsApiV1PartsLookupGet(withDefaultLookupLimit(query));

  return response.items.map((part) => ({
    id: part.id,
    partNumber: part.part_number,
    name: part.name ?? null,
  }));
}

export async function lookupIssues(query: IssueLookupQueryDto): Promise<LookupIssueModel[]> {
  const response = await lookupIssuesApiV1IssuesLookupGet(withDefaultLookupLimit(query));

  return response.items.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    type: issue.type === "CHANGE_REQUEST" ? "change_request" : "issue",
  }));
}

export async function lookupChanges(query: ChangeLookupQueryDto): Promise<LookupChangeModel[]> {
  const response = await lookupChangeRequestsApiV1ChangesLookupGet(withDefaultLookupLimit(query));

  return response.items.map((change) => ({
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
    crState: change.cr_state,
  }));
}
