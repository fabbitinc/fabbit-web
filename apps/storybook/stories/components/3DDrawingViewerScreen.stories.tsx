import type { Meta, StoryObj } from "@storybook/react-vite";
import { GltfViewerScreen } from "@fabbit/components";

const meta = {
  title: "Components/3DDrawingViewerScreen",
  component: GltfViewerScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    src: "/samples/bracket.glb",
    title: "ASSY-BRKT-014 / 조립 브래킷 샘플",
    description:
      "전체화면 검토에 맞춘 GLTF 뷰어입니다. 분석 패널 없이 캔버스와 표시 옵션만 두고 PDF/CAD 뷰어처럼 빠르게 조작할 수 있습니다.",
  },
} satisfies Meta<typeof GltfViewerScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workspace: Story = {};

export const WireframeReview: Story = {
  args: {
    initialAutoRotate: true,
    initialRenderMode: "wireframe",
    initialShowGrid: false,
    description: "와이어프레임 검토",
  },
};

export const ErrorState: Story = {
  args: {
    src: "",
    description: "오류 상태",
    title: "손상된 모델 경로",
  },
};
