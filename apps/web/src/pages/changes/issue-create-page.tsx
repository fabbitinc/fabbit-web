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
      description="추적할 작업 또는 문제를 등록합니다."
      editorPlaceholder="이슈 설명을 입력하세요"
      heading="새 이슈"
      isPending={createIssueAction.isPending}
      submitLabel="이슈 생성"
      titlePlaceholder="이슈 제목을 입력하세요"
      onSubmit={async (input) => {
        const issue = await createIssueAction.mutateAsync(input);
        navigate(`/changes/issues/${issue.id}`);
      }}
    />
  );
}
