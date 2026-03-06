import { useSearchParams, useNavigate } from "react-router-dom";
import { uploadFiles } from "@/api/file.api";
import { ChangeCreateForm } from "@/features/change-shared";
import { useCreateChangeRequestAction } from "@/features/change-request/hooks/use-create-change-request-action";

export function ChangeRequestCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createChangeRequestAction = useCreateChangeRequestAction();

  const issueNumberParam = searchParams.get("issueNumber");
  const linkedIssueNumber = issueNumberParam ? Number(issueNumberParam) : null;
  const linkedIssueTitle = searchParams.get("issueTitle");

  return (
    <ChangeCreateForm
      backHref="/changes?view=requests"
      backLabel="변경 요청 목록"
      description="설계 변경 내용을 등록하고 검토자를 지정합니다."
      heading="새 변경 요청"
      includeReviewers
      isPending={createChangeRequestAction.isPending}
      linkedIssueNumber={linkedIssueNumber}
      linkedIssueTitle={linkedIssueTitle}
      submitLabel="변경 요청 생성"
      onSubmit={async (input) => {
        const fileIds = await uploadFiles(input.files);
        const changeRequest = await createChangeRequestAction.mutateAsync({
          title: input.title,
          body: input.body ?? undefined,
          issue_number: input.linkedIssueNumber ?? undefined,
          assignee_user_ids: input.assigneeIds.length > 0 ? input.assigneeIds : undefined,
          reviewer_user_ids: input.reviewerIds.length > 0 ? input.reviewerIds : undefined,
          label_ids: input.labelIds.length > 0 ? input.labelIds : undefined,
          part_ids: input.partIds.length > 0 ? input.partIds : undefined,
          file_ids: fileIds.length > 0 ? fileIds : undefined,
        });

        navigate(`/changes/requests/${changeRequest.number}`);
      }}
    />
  );
}
