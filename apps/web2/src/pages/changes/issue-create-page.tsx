import { useNavigate } from "react-router-dom";
import { ChangeCreateForm } from "@/features/change-shared";
import { useCreateIssueAction } from "@/features/issue/hooks/use-create-issue-action";

export function IssueCreatePage() {
  const navigate = useNavigate();
  const createIssueAction = useCreateIssueAction();

  return (
    <ChangeCreateForm
      backHref="/changes?view=issues"
      backLabel="이슈 목록"
      description="문제, 검토 대상, 후속 작업을 이슈로 등록합니다."
      heading="새 이슈"
      isPending={createIssueAction.isPending}
      submitLabel="이슈 생성"
      onSubmit={async (input) => {
        const issue = await createIssueAction.mutateAsync(input);
        navigate(`/changes/issues/${issue.number}`);
      }}
    />
  );
}
