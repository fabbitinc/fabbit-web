import { engineeringChangeLookup as lookupEngineeringChangesApiV1EngineeringChangesLookupGet } from "@/api/generated/orval/engineering-changes/engineering-changes";
import { issueLookup as lookupIssuesApiV1IssuesLookupGet } from "@/api/generated/orval/issues/issues";
import { labelLookup as lookupLabelsApiV1LabelsLookupGet } from "@/api/generated/orval/labels/labels";
import { memberLookup as lookupMembersApiV1MembersLookupGet } from "@/api/generated/orval/members/members";
import {
  partLookup as lookupPartsApiV1PartsLookupGet,
  partLookupRevisions as lookupPartRevisionsApi,
} from "@/api/generated/orval/parts/parts";
import type {
  ChangeLookupQueryDto,
  IssueLookupQueryDto,
  LabelLookupQueryDto,
  MemberLookupQueryDto,
  PartLookupQueryDto,
  PartRevisionLookupQueryDto,
} from "@/features/change-shared/api/change-shared.types";
import type {
  LookupChangeModel,
  LookupIssueModel,
  LookupLabelModel,
  LookupMemberModel,
  LookupPartModel,
  LookupPartRevisionModel,
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
    revisionId: part.revision_id ?? null,
    partNumber: part.part_number,
    name: part.name ?? null,
  }));
}

export async function lookupPartRevisions(query: PartRevisionLookupQueryDto): Promise<LookupPartRevisionModel[]> {
  const response = await lookupPartRevisionsApi(withDefaultLookupLimit(query));

  if (!response) {
    return [];
  }

  return (response.items ?? []).map((revision) => ({
    revisionId: revision.revision_id ?? "",
    partId: revision.part_id ?? "",
    partNumber: revision.part_number ?? "",
    baseRevisionCode: revision.base_revision_code ?? null,
    name: revision.name ?? null,
    status: revision.status ?? null,
  }));
}

export async function lookupIssues(query: IssueLookupQueryDto): Promise<LookupIssueModel[]> {
  const response = await lookupIssuesApiV1IssuesLookupGet(withDefaultLookupLimit(query));

  return response.items.map((issue) => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
  }));
}

export async function lookupChanges(query: ChangeLookupQueryDto): Promise<LookupChangeModel[]> {
  const response = await lookupEngineeringChangesApiV1EngineeringChangesLookupGet(
    withDefaultLookupLimit(query),
  );

  return response.items.map((change) => ({
    id: change.id,
    number: change.number,
    title: change.title,
    state: change.state,
  }));
}
