import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GltfViewer } from "@fabbit/components";
import { Button } from "@fabbit/ui";

interface GltfViewerStoryShellProps {
  src: string;
  title?: string;
  description?: string;
  resourceUrls?: Record<string, string>;
  showGrid?: boolean;
}

interface UploadedModelSet {
  src: string;
  fileName: string;
  fileNames: string[];
  resourceUrls: Record<string, string>;
}

function isModelFile(file: File) {
  const lowerCaseName = file.name.toLowerCase();

  return lowerCaseName.endsWith(".gltf") || lowerCaseName.endsWith(".glb");
}

function revokeUploadedModelSet(modelSet: UploadedModelSet | null) {
  if (!modelSet) {
    return;
  }

  const uniqueUrls = new Set([modelSet.src, ...Object.values(modelSet.resourceUrls)]);

  for (const url of uniqueUrls) {
    if (url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
}

function GltfViewerStoryShell({
  src,
  title,
  description,
  resourceUrls,
  showGrid,
}: GltfViewerStoryShellProps) {
  const uploadedModelRef = useRef<UploadedModelSet | null>(null);
  const [uploadedModel, setUploadedModel] = useState<UploadedModelSet | null>(null);

  function replaceUploadedModel(nextModel: UploadedModelSet | null) {
    revokeUploadedModelSet(uploadedModelRef.current);
    uploadedModelRef.current = nextModel;
    setUploadedModel(nextModel);
  }

  useEffect(() => {
    return () => {
      revokeUploadedModelSet(uploadedModelRef.current);
    };
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const modelFile = files.find(isModelFile);

    if (!modelFile) {
      event.target.value = "";
      return;
    }

    const resourceUrls = Object.fromEntries(
      files.map((file) => [file.name, URL.createObjectURL(file)]),
    );

    replaceUploadedModel({
      src: resourceUrls[modelFile.name],
      fileName: modelFile.name,
      fileNames: files.map((file) => file.name),
      resourceUrls,
    });
    event.target.value = "";
  }

  function handleReset() {
    replaceUploadedModel(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">로컬 GLTF/GLB 파일 불러오기</p>
          <p className="text-sm text-muted-foreground">
            {uploadedModel
              ? `현재 모델: ${uploadedModel.fileName} · 함께 불러온 리소스 ${uploadedModel.fileNames.length}개`
              : "기본 샘플 모델이 표시됩니다. .gltf는 .bin/텍스처 파일을 함께 여러 개 선택해 주세요."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted">
            로컬 파일 세트 선택
            <input
              accept=".gltf,.glb,.bin,.png,.jpg,.jpeg,.webp,.ktx2"
              className="hidden"
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </label>
          <Button
            disabled={!uploadedModel}
            size="sm"
            type="button"
            variant="outline"
            onClick={handleReset}
          >
            기본 샘플로 복귀
          </Button>
        </div>
      </div>

      <GltfViewer
        description={description}
        resourceUrls={uploadedModel?.resourceUrls ?? resourceUrls}
        showGrid={showGrid}
        src={uploadedModel?.src ?? src}
        title={title}
      />
    </div>
  );
}

const meta = {
  title: "Components/3DDrawingViewer",
  component: GltfViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
  render: (args) => <GltfViewerStoryShell {...args} />,
  args: {
    src: "/samples/bracket.glb",
    title: "조립 브래킷 샘플",
    description: "three.js 기반 GLTF 뷰어에서 회전, 확대, 시점 초기화와 로컬 파일 세트 교체를 확인하는 데모입니다.",
    showGrid: true,
  },
} satisfies Meta<typeof GltfViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LocalUpload: Story = {
  args: {
    title: "로컬 모델 검토 모드",
    description: "기본 샘플을 유지하면서 필요할 때 로컬 GLTF/GLB와 연관 .bin, 텍스처 파일을 함께 올려 비교할 수 있습니다.",
  },
};

export const CleanPresentation: Story = {
  args: {
    showGrid: false,
    title: "프레젠테이션 모드",
    description: "모델 자체만 강조하는 간결한 캔버스 구성입니다.",
  },
};
