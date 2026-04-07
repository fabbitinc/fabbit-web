import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EngineeringChangeCreateScreen } from "@fabbit/components";
import { useIssueLookupQuery } from "@/features/change-shared/hooks/use-issue-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import { usePartRevisionLookupQuery } from "@/features/change-shared/hooks/use-part-revision-lookup-query";
import { useCreateEngineeringChangeAction } from "@/features/engineering-change/hooks/use-create-engineering-change-action";

export function EngineeringChangeCreatePage() {
  const navigate = useNavigate();
  const createEngineeringChangeAction = useCreateEngineeringChangeAction();

  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [issuesEnabled, setIssuesEnabled] = useState(false);
  const [issueSearch, setIssueSearch] = useState("");
  const [membersEnabled, setMembersEnabled] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [affectedItemsEnabled, setAffectedItemsEnabled] = useState(false);
  const [affectedItemsSearch, setAffectedItemsSearch] = useState("");
  const [affectedItemsType, setAffectedItemsType] = useState<"REVISION_RELEASE" | "LIFECYCLE_CHANGE">("REVISION_RELEASE");

  const issueLookup = useIssueLookupQuery(
    { search: issueSearch.trim() || undefined },
    issuesEnabled,
  );
  const labelLookup = useLabelLookupQuery(
    { search: labelSearch.trim() || undefined },
    labelsEnabled,
  );
  const memberLookup = useMemberLookupQuery(
    { search: memberSearch.trim() || undefined },
    membersEnabled,
  );

  const deferredAffectedSearch = useDeferredValue(affectedItemsSearch.trim());
  const revisionLookup = usePartRevisionLookupQuery(
    { search: deferredAffectedSearch || undefined },
    affectedItemsEnabled && affectedItemsType === "REVISION_RELEASE",
  );
  const partLookup = usePartLookupQuery(
    { search: deferredAffectedSearch || undefined },
    affectedItemsEnabled && affectedItemsType === "LIFECYCLE_CHANGE",
  );

  const affectedItemSearchItems = affectedItemsType === "REVISION_RELEASE"
    ? (revisionLookup.data ?? []).map((rev) => ({
        id: rev.revisionId,
        partNumber: rev.partNumber,
        name: rev.name,
        revisionCode: rev.baseRevisionCode,
      }))
    : (partLookup.data ?? []).map((part) => ({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name,
      }));

  return (
    <EngineeringChangeCreateScreen
      labelOptions={(labelLookup.data ?? []).map((label) => ({
        id: label.id,
        name: label.name,
        colorHex: label.color,
      }))}
      isLabelSearching={labelLookup.isFetching}
      onLabelSearchChange={setLabelSearch}
      onRequestLabels={() => setLabelsEnabled(true)}
      issueOptions={(issueLookup.data ?? []).map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
      }))}
      isIssueSearching={issueLookup.isFetching}
      onIssueSearchChange={setIssueSearch}
      onRequestIssues={() => setIssuesEnabled(true)}
      memberOptions={(memberLookup.data ?? []).map((member) => ({
        id: member.userId,
        name: member.fullName,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
      }))}
      isMemberSearching={memberLookup.isFetching}
      onMemberSearchChange={setMemberSearch}
      onRequestMembers={() => setMembersEnabled(true)}
      affectedItemSearchItems={affectedItemSearchItems}
      isAffectedItemSearching={
        affectedItemsType === "REVISION_RELEASE"
          ? revisionLookup.isFetching
          : partLookup.isFetching
      }
      onAffectedItemSearchChange={setAffectedItemsSearch}
      onAffectedItemTypeChange={setAffectedItemsType}
      onRequestAffectedItems={() => setAffectedItemsEnabled(true)}
      isPending={createEngineeringChangeAction.isPending}
      onBack={() => navigate("/changes?view=engineering-changes")}
      onCancel={() => navigate("/changes?view=engineering-changes")}
      onSubmit={async (input) => {
        const engineeringChange = await createEngineeringChangeAction.mutateAsync(input);
        navigate(`/changes/engineering-changes/${engineeringChange.id}`);
      }}
    />
  );
}
