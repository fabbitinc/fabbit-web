import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChangeCreateScreen,
  type ChangeCreateScreenSubmitInput,
} from "@fabbit/components";
import { useLabelLookupQuery } from "@/features/change-shared/hooks/use-label-lookup-query";
import { useMemberLookupQuery } from "@/features/change-shared/hooks/use-member-lookup-query";
import { usePartLookupQuery } from "@/features/change-shared/hooks/use-part-lookup-query";
import type { ChangeCreateFormSubmitInput } from "@/features/change-shared/types/change-create-form";
import { normalizeRichTextDocument } from "@/lib/rich-text";

interface ChangeCreateFormProps {
  backHref: string;
  backLabel: string;
  description: string;
  editorPlaceholder?: string;
  heading: string;
  includeReviewers?: boolean;
  isPending: boolean;
  linkedIssueNumber?: number | null;
  linkedIssueTitle?: string | null;
  submitLabel: string;
  titlePlaceholder?: string;
  onSubmit: (input: ChangeCreateFormSubmitInput) => Promise<void>;
}

function toSubmitInput(input: ChangeCreateScreenSubmitInput): ChangeCreateFormSubmitInput {
  return {
    title: input.title,
    body: input.body ? normalizeRichTextDocument(input.body) : null,
    assigneeIds: input.assigneeIds,
    reviewerIds: input.reviewerIds,
    labelIds: input.labelIds,
    partIds: input.partIds,
    files: input.files,
    linkedIssueNumber: input.linkedIssueNumber,
  };
}

export function ChangeCreateForm({
  backHref,
  backLabel,
  description,
  editorPlaceholder,
  heading,
  includeReviewers = false,
  isPending,
  linkedIssueNumber,
  linkedIssueTitle,
  submitLabel,
  titlePlaceholder,
  onSubmit,
}: ChangeCreateFormProps) {
  const navigate = useNavigate();
  const [assigneesEnabled, setAssigneesEnabled] = useState(false);
  const [reviewersEnabled, setReviewersEnabled] = useState(false);
  const [labelsEnabled, setLabelsEnabled] = useState(false);
  const [partsEnabled, setPartsEnabled] = useState(false);
  const [partSearch, setPartSearch] = useState("");

  const assigneeLookup = useMemberLookupQuery({ limit: 100 }, assigneesEnabled);
  const reviewerLookup = useMemberLookupQuery(
    { limit: 100 },
    includeReviewers && reviewersEnabled,
  );
  const labelLookup = useLabelLookupQuery({ limit: 100 }, labelsEnabled);
  const partLookup = usePartLookupQuery(
    { search: partSearch.trim() || undefined, limit: 20 },
    partsEnabled,
  );

  return (
    <ChangeCreateScreen
      backLabel={backLabel}
      description={description}
      heading={heading}
      titlePlaceholder={titlePlaceholder ?? `${heading} 제목을 입력하세요`}
      editorPlaceholder={editorPlaceholder ?? `${heading} 설명을 입력하세요`}
      includeReviewers={includeReviewers}
      isPending={isPending}
      linkedIssueNumber={linkedIssueNumber}
      linkedIssueTitle={linkedIssueTitle}
      assigneeOptions={(assigneeLookup.data ?? []).map((member) => ({
        id: member.userId,
        name: member.fullName,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
      }))}
      reviewerOptions={(reviewerLookup.data ?? []).map((member) => ({
        id: member.userId,
        name: member.fullName,
        email: member.email,
        profileImageUrl: member.profileImageUrl,
      }))}
      labelOptions={(labelLookup.data ?? []).map((label) => ({
        id: label.id,
        name: label.name,
        colorHex: label.color,
      }))}
      partOptions={(partLookup.data ?? []).map((part) => ({
        id: part.id,
        partNumber: part.partNumber,
        name: part.name,
      }))}
      isPartSearching={partLookup.isFetching}
      onBack={() => navigate(backHref)}
      onCancel={() => navigate(backHref)}
      onRequestAssignees={() => setAssigneesEnabled(true)}
      onRequestReviewers={() => setReviewersEnabled(true)}
      onRequestLabels={() => setLabelsEnabled(true)}
      onRequestParts={() => setPartsEnabled(true)}
      onPartSearchChange={setPartSearch}
      submitLabel={submitLabel}
      onSubmit={async (input) => {
        await onSubmit(toSubmitInput(input));
      }}
    />
  );
}
