import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IssueCreateScreen } from "@fabbit/components";
import { useChangeLookupQuery } from "@/features/change-shared/hooks/use-change-lookup-query";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import { useCreateIssueAction } from "@/features/issue/hooks/use-create-issue-action";

export function IssueCreatePage() {
  const navigate = useNavigate();
  const createIssueAction = useCreateIssueAction();

  const [assigneesEnabled, setAssigneesEnabled] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [partsEnabled, setPartsEnabled] = useState(false);
  const [partSearch, setPartSearch] = useState("");
  const [changesEnabled, setChangesEnabled] = useState(false);
  const [changeSearch, setChangeSearch] = useState("");

  const assigneeLookup = useMemberLookupQuery(
    { search: assigneeSearch.trim() || undefined },
    assigneesEnabled,
  );
  const labelLookup = useLabelLookupQuery(
    { search: labelSearch.trim() || undefined },
    labelsEnabled,
  );
  const partLookup = usePartLookupQuery(
    { search: partSearch.trim() || undefined },
    partsEnabled,
  );
  const changeLookup = useChangeLookupQuery(
    { search: changeSearch.trim() || undefined },
    changesEnabled,
  );

  return (
    <IssueCreateScreen
      assigneeOptions={(assigneeLookup.data ?? []).map((member) => ({
        id: member.userId,
        name: member.fullName,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
      }))}
      isAssigneeSearching={assigneeLookup.isFetching}
      labelOptions={(labelLookup.data ?? []).map((label) => ({
        id: label.id,
        name: label.name,
        colorHex: label.color,
      }))}
      isLabelSearching={labelLookup.isFetching}
      partOptions={(partLookup.data ?? []).map((part) => ({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name,
      }))}
      changeOptions={(changeLookup.data ?? []).map((change) => ({
        id: change.id,
        number: change.number,
        title: change.title,
        state: change.state,
      }))}
      isChangeSearching={changeLookup.isFetching}
      isPartSearching={partLookup.isFetching}
      isPending={createIssueAction.isPending}
      onAssigneeSearchChange={setAssigneeSearch}
      onBack={() => navigate("/changes?view=issues")}
      onCancel={() => navigate("/changes?view=issues")}
      onChangeSearchChange={setChangeSearch}
      onLabelSearchChange={setLabelSearch}
      onPartSearchChange={setPartSearch}
      onRequestAssignees={() => setAssigneesEnabled(true)}
      onRequestChanges={() => setChangesEnabled(true)}
      onRequestLabels={() => setLabelsEnabled(true)}
      onRequestParts={() => setPartsEnabled(true)}
      onSubmit={async (input) => {
        const issue = await createIssueAction.mutateAsync(input);
        navigate(`/changes/issues/${issue.id}`);
      }}
    />
  );
}
