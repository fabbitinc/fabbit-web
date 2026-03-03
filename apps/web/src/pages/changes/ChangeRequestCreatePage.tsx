import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useCreateChange } from "@/api/hooks/useIndependentChanges";
import { uploadFiles } from "@/api/file";
import { CreateForm } from "./CreateForm";
import { CreateFormSidebar, type CreateFormSidebarHandle } from "./CreateFormSidebar";

export function ChangeRequestCreatePage() {
  const [searchParams] = useSearchParams();
  const issueNumberParam = searchParams.get("issueNumber");
  const linkedIssueNumber = issueNumberParam ? Number(issueNumberParam) : null;
  const linkedIssueTitle = searchParams.get("issueTitle") ?? undefined;

  const createChangeMutation = useCreateChange();
  const sidebarRef = useRef<CreateFormSidebarHandle>(null);

  return (
    <CreateForm
      backTo="/changes/requests"
      backLabel="변경 요청 목록"
      heading="새 변경 요청"
      description="설계 변경사항을 등록하고 리뷰를 요청합니다."
      titlePlaceholder="변경 요청 제목을 입력하세요"
      editorPlaceholder="변경 요청 설명을 입력하세요"
      submitLabel="변경 요청 생성"
      isPending={createChangeMutation.isPending}
      sidebarStateRef={sidebarRef}
      sidebar={<CreateFormSidebar ref={sidebarRef} showReviewers />}
      linkedIssueNumber={linkedIssueNumber}
      linkedIssueTitle={linkedIssueTitle}
      onSubmit={async (data) => {
        const fileIds = await uploadFiles(data.files);

        const change = await createChangeMutation.mutateAsync({
          title: data.title,
          body: data.body,
          issueNumber: data.issueNumber,
          assignee_user_ids: data.assigneeIds.length > 0 ? data.assigneeIds : undefined,
          reviewer_user_ids: data.reviewerIds.length > 0 ? data.reviewerIds : undefined,
          label_ids: data.labelIds.length > 0 ? data.labelIds : undefined,
          part_ids: data.partIds.length > 0 ? data.partIds : undefined,
          file_ids: fileIds.length > 0 ? fileIds : undefined,
        });

        return `/changes/requests/${change.number}`;
      }}
    />
  );
}
