import { PartsTemplateAnalysisScreen as PartsTemplateAnalysisScreenView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTemplateUploadAction } from "@/features/part-template-mapping/hooks/use-template-upload-action";
import {
  buildPartDetailPath,
  buildPartTemplateAnalysisPath,
} from "@/features/parts/lib/part-route";

const ANALYSIS_ACCEPT = ".xlsx,.xls,.csv";

interface PartsTemplateAnalysisScreenProps {
  partId?: string;
  revisionId?: string;
}

export function PartsTemplateAnalysisScreen({ partId, revisionId }: PartsTemplateAnalysisScreenProps) {
  const navigate = useNavigate();
  const uploadAction = useTemplateUploadAction();
  const templatePathBase =
    partId && revisionId ? buildPartTemplateAnalysisPath(partId, revisionId) : "/parts/templates";
  const backPath =
    partId && revisionId ? buildPartDetailPath(partId, revisionId) : "/parts";
  const description = partId
    ? `부품(${partId}) 기준으로 상세 속성 템플릿을 생성합니다.`
    : "업로드 파일을 분석해 부품 속성 템플릿을 생성합니다.";

  const isSupportedFile = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return ANALYSIS_ACCEPT.split(",").includes(extension);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    if (files.length > 1) {
      toast.warning("속성 분석은 파일 1개만 업로드할 수 있습니다", {
        description: "파일 하나만 선택한 뒤 다시 업로드해 주세요.",
      });
      return;
    }

    const validFiles = files.filter(isSupportedFile);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      toast.warning("지원하지 않는 파일 형식이 포함되어 제외되었습니다", {
        description: "Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
      });
    }

    if (validFiles.length === 0) {
      return;
    }

    const result = await uploadAction.mutateAsync({ file: validFiles[0] });
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
