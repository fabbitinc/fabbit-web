import type { Meta, StoryObj } from "@storybook/react-vite";
import { GltfViewerScreen } from "@fabbit/components";

function encodeBase64(bytes: Uint8Array) {
  if (typeof btoa === "function") {
    let binary = "";

    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }

    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
}

function createSampleGltfSrc() {
  const vertices = [
    -0.65,
    -0.45,
    -0.65,
    0.65,
    -0.45,
    -0.65,
    0.65,
    -0.45,
    0.65,
    -0.65,
    -0.45,
    0.65,
    0,
    0.8,
    0,
  ];
  const indices = [0, 1, 2, 0, 2, 3, 0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4];
  const vertexByteLength = vertices.length * Float32Array.BYTES_PER_ELEMENT;
  const indexByteLength = indices.length * Uint16Array.BYTES_PER_ELEMENT;
  const buffer = new ArrayBuffer(vertexByteLength + indexByteLength);

  new Float32Array(buffer, 0, vertices.length).set(vertices);
  new Uint16Array(buffer, vertexByteLength, indices.length).set(indices);

  const gltf = {
    asset: {
      generator: "storybook-gltf-screen-sample",
      version: "2.0",
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "조립 브래킷 샘플" }],
    meshes: [
      {
        name: "조립 브래킷 샘플",
        primitives: [
          {
            attributes: { POSITION: 0 },
            indices: 1,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        doubleSided: true,
        name: "도장 강판",
        pbrMetallicRoughness: {
          baseColorFactor: [0.16, 0.52, 0.88, 1],
          metallicFactor: 0.12,
          roughnessFactor: 0.38,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 5,
        max: [0.65, 0.8, 0.65],
        min: [-0.65, -0.45, -0.65],
        type: "VEC3",
      },
      {
        bufferView: 1,
        componentType: 5123,
        count: 18,
        type: "SCALAR",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteLength: vertexByteLength,
        byteOffset: 0,
        target: 34962,
      },
      {
        buffer: 0,
        byteLength: indexByteLength,
        byteOffset: vertexByteLength,
        target: 34963,
      },
    ],
    buffers: [
      {
        byteLength: buffer.byteLength,
        uri: `data:application/octet-stream;base64,${encodeBase64(
          new Uint8Array(buffer),
        )}`,
      },
    ],
  };

  return `data:model/gltf+json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(gltf),
  )}`;
}

const SAMPLE_GLTF_SRC = createSampleGltfSrc();

const meta = {
  title: "Components/GltfViewerScreen",
  component: GltfViewerScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    src: SAMPLE_GLTF_SRC,
    title: "ASSY-BRKT-014 / 조립 브래킷 샘플",
    subtitle: "3D 모델 검토",
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
    subtitle: "와이어프레임 검토",
  },
};

export const ErrorState: Story = {
  args: {
    src: "",
    subtitle: "오류 상태",
    title: "손상된 모델 경로",
  },
};
