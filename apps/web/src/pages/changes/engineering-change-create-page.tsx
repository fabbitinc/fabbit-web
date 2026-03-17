import { useSearchParams, useNavigate } from "react-router-dom";
import { ChangeCreateForm } from "@/features/change-shared";
import { useCreateEngineeringChangeAction } from "@/features/engineering-change/hooks/use-create-engineering-change-action";

export function EngineeringChangeCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createEngineeringChangeAction = useCreateEngineeringChangeAction();

  const issueNumberParam = searchParams.get("issueNumber");
  const linkedIssueNumber = issueNumberParam ? Number(issueNumberParam) : null;
  const linkedIssueTitle = searchParams.get("issueTitle");

  return (
    <ChangeCreateForm
      backHref="/changes?view=engineering-changes"
      backLabel="변경관리 목록"
      description="설계 변경사항을 등록하고 리뷰를 요청합니다."
      editorPlaceholder="변경관리 설명을 입력하세요"
      heading="새 변경관리"
      includeReviewers
      isPending={createEngineeringChangeAction.isPending}
      linkedIssueNumber={linkedIssueNumber}
      linkedIssueTitle={linkedIssueTitle}
      submitLabel="변경관리 생성"
      titlePlaceholder="변경관리 제목을 입력하세요"
      onSubmit={async (input) => {
        const engineeringChange = await createEngineeringChangeAction.mutateAsync(input);
        navigate(`/changes/engineering-changes/${engineeringChange.number}`);
      }}
    />
  );
}
