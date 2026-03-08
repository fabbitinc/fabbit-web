import { PartAttachmentsTab as PartAttachmentsTabView } from "@fabbit/components";
import { useAttachPartFilesAction } from "@/features/parts/hooks/use-attach-part-files-action";
import { useDetachPartFileAction } from "@/features/parts/hooks/use-detach-part-file-action";
import { usePartFilesQuery } from "@/features/parts/hooks/use-part-files-query";

interface PartAttachmentsTabProps {
  partId: string;
}

export function PartAttachmentsTab({ partId }: PartAttachmentsTabProps) {
  const filesQuery = usePartFilesQuery(partId);
  const attachPartFilesAction = useAttachPartFilesAction(partId);
  const detachPartFileAction = useDetachPartFileAction(partId);

  return (
    <PartAttachmentsTabView
      files={filesQuery.data ?? []}
      isDeleting={detachPartFileAction.isPending}
      isLoading={filesQuery.isLoading}
      isUploading={attachPartFilesAction.isPending}
      onDeleteFile={async (fileId) => {
        await detachPartFileAction.mutateAsync(fileId);
      }}
      onUploadFiles={async (files) => {
        await attachPartFilesAction.mutateAsync(files);
      }}
    />
  );
}
