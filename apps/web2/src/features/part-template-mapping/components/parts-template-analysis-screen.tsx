import { PartsTemplateAnalysisScreen as PartsTemplateAnalysisScreenView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { useTemplateUploadAction } from "@/features/part-template-mapping/hooks/use-template-upload-action";
const ANALYSIS_ACCEPT = ".xlsx,.xls,.csv";

interface PartsTemplateAnalysisScreenProps {
  partId?: string;
}

export function PartsTemplateAnalysisScreen({ partId }: PartsTemplateAnalysisScreenProps) {
  const navigate = useNavigate();
  const uploadAction = useTemplateUploadAction();
  const templatePathBase = partId ? `/parts/${partId}/templates` : "/parts/templates";
  const backPath = partId ? `/parts/${partId}` : "/parts";
  const description = partId ? `현재는 부품 ${partId} 기준 상세 템플릿으로 저장됩니다.` : undefined;

  const isSupportedFile = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return ANALYSIS_ACCEPT.split(",").includes(extension);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const validFile = files.find(isSupportedFile);
    if (!validFile) {
      return;
    }

    const result = await uploadAction.mutateAsync({ file: validFile });
    navigate(`${templatePathBase}/processing`, {
      state: { fileName: result.fileName },
    });
  };

  return (
    <PartsTemplateAnalysisScreenView
      accept={ANALYSIS_ACCEPT}
      description={description}
      isUploading={uploadAction.isPending}
      onBackClick={() => navigate(backPath)}
      onFilesSelect={handleFiles}
    />
  );
}
