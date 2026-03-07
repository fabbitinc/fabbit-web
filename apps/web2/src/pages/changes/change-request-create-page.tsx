import { useSearchParams, useNavigate } from "react-router-dom";
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
      description="설계 변경사항을 등록하고 리뷰를 요청합니다."
      editorPlaceholder="변경 요청 설명을 입력하세요"
      heading="새 변경 요청"
      includeReviewers
      isPending={createChangeRequestAction.isPending}
      linkedIssueNumber={linkedIssueNumber}
      linkedIssueTitle={linkedIssueTitle}
      submitLabel="변경 요청 생성"
      titlePlaceholder="변경 요청 제목을 입력하세요"
      onSubmit={async (input) => {
        const changeRequest = await createChangeRequestAction.mutateAsync(input);
        navigate(`/changes/requests/${changeRequest.number}`);
      }}
    />
  );
}
