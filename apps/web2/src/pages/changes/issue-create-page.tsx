import { useNavigate } from "react-router-dom";
import { uploadFiles } from "@/api/file.api";
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
        const fileIds = await uploadFiles(input.files);
        const issue = await createIssueAction.mutateAsync({
          title: input.title,
          body: input.body ?? undefined,
          assignee_user_ids: input.assigneeIds.length > 0 ? input.assigneeIds : undefined,
          label_ids: input.labelIds.length > 0 ? input.labelIds : undefined,
          part_ids: input.partIds.length > 0 ? input.partIds : undefined,
          file_ids: fileIds.length > 0 ? fileIds : undefined,
        });

        navigate(`/changes/issues/${issue.number}`);
      }}
    />
  );
}
