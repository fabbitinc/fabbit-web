import { useRef } from "react";
import { useCreateIssue } from "@/api/hooks/useIndependentIssues";
import { uploadFiles } from "@/api/file";
import { CreateForm } from "./CreateForm";
import { CreateFormSidebar, type CreateFormSidebarHandle } from "./CreateFormSidebar";

export function IssueCreatePage() {
  const createIssueMutation = useCreateIssue();
  const sidebarRef = useRef<CreateFormSidebarHandle>(null);

  return (
    <CreateForm
      backTo="/changes/issues"
      backLabel="이슈 목록"
      heading="새 이슈"
      description="추적할 작업 또는 문제를 등록합니다."
      titlePlaceholder="이슈 제목을 입력하세요"
      editorPlaceholder="이슈 설명을 입력하세요"
      submitLabel="이슈 생성"
      isPending={createIssueMutation.isPending}
      sidebarStateRef={sidebarRef}
      sidebar={<CreateFormSidebar ref={sidebarRef} />}
      onSubmit={async (data) => {
        const fileIds = await uploadFiles(data.files);

        const issue = await createIssueMutation.mutateAsync({
          title: data.title,
          body: data.body,
          assignee_user_ids: data.assigneeIds.length > 0 ? data.assigneeIds : undefined,
          label_ids: data.labelIds.length > 0 ? data.labelIds : undefined,
          part_ids: data.partIds.length > 0 ? data.partIds : undefined,
          file_ids: fileIds.length > 0 ? fileIds : undefined,
        });

        return `/changes/issues/${issue.number}`;
      }}
    />
  );
}
