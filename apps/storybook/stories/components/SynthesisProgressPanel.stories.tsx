import type { Meta, StoryObj } from "@storybook/react-vite";
import { SynthesisProgressPanel, type SynthesisProgressPanelProps } from "@fabbit/components";

const processingStatus = {
  acceptedCount: 3,
  pendingCount: 1,
  processingCount: 1,
  completedCount: 1,
  failedJobCount: 0,
  failed: [],
  items: [
    {
      jobId: "job-1",
      fileId: "file-1",
      status: "completed",
      totalRows: 128,
      processedRows: 128,
      nodesCreated: 84,
      relationshipsCreated: 42,
      errorCount: 0,
      startedAt: "2026-03-06T08:00:00Z",
      completedAt: "2026-03-06T08:01:00Z",
    },
    {
      jobId: "job-2",
      fileId: "file-2",
      status: "processing",
      totalRows: 220,
      processedRows: 88,
      nodesCreated: 41,
      relationshipsCreated: 19,
      errorCount: 2,
      startedAt: "2026-03-06T08:02:00Z",
      completedAt: null,
    },
    {
      jobId: "job-3",
      fileId: "file-3",
      status: "pending",
      totalRows: 56,
      processedRows: 0,
      nodesCreated: 0,
      relationshipsCreated: 0,
      errorCount: 0,
      startedAt: null,
      completedAt: null,
    },
  ],
} satisfies SynthesisProgressPanelProps["batchStatus"];

const completeStatus = {
  acceptedCount: 2,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 2,
  failedJobCount: 0,
  failed: [],
  items: [
    {
      jobId: "job-4",
      fileId: "file-1",
      status: "completed",
      totalRows: 128,
      processedRows: 128,
      nodesCreated: 84,
      relationshipsCreated: 42,
      errorCount: 0,
      startedAt: "2026-03-06T08:00:00Z",
      completedAt: "2026-03-06T08:01:00Z",
    },
    {
      jobId: "job-5",
      fileId: "file-2",
      status: "completed",
      totalRows: 220,
      processedRows: 220,
      nodesCreated: 102,
      relationshipsCreated: 61,
      errorCount: 0,
      startedAt: "2026-03-06T08:02:00Z",
      completedAt: "2026-03-06T08:05:00Z",
    },
  ],
} satisfies SynthesisProgressPanelProps["batchStatus"];

const failedStatus = {
  acceptedCount: 3,
  pendingCount: 0,
  processingCount: 0,
  completedCount: 1,
  failedJobCount: 1,
  failed: [
    {
      fileId: "file-3",
      reason: "필수 헤더 `part_number`를 찾지 못했습니다.",
    },
  ],
  items: [
    {
      jobId: "job-6",
      fileId: "file-1",
      status: "completed",
      totalRows: 128,
      processedRows: 128,
      nodesCreated: 84,
      relationshipsCreated: 42,
      errorCount: 0,
      startedAt: "2026-03-06T08:00:00Z",
      completedAt: "2026-03-06T08:01:00Z",
    },
    {
      jobId: "job-7",
      fileId: "file-2",
      status: "failed",
      totalRows: 220,
      processedRows: 124,
      nodesCreated: 41,
      relationshipsCreated: 19,
      errorCount: 7,
      startedAt: "2026-03-06T08:02:00Z",
      completedAt: "2026-03-06T08:03:00Z",
    },
  ],
} satisfies SynthesisProgressPanelProps["batchStatus"];

const fileNames = {
  "file-1": "drive-unit-v3.xlsx",
  "file-2": "motor-controller-bom.csv",
  "file-3": "supplier-mapping.xlsx",
};

const meta = {
  title: "Components/SynthesisProgressPanel",
  component: SynthesisProgressPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SynthesisProgressPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    batchStatus: null,
    fileNames,
  },
};

export const Processing: Story = {
  args: {
    batchStatus: processingStatus,
    fileNames,
  },
};

export const Complete: Story = {
  args: {
    batchStatus: completeStatus,
    fileNames,
  },
};

export const PartialFailure: Story = {
  args: {
    batchStatus: failedStatus,
    fileNames,
  },
};

export const Showcase: Story = {
  render: () => (
    <div className="space-y-8">
      <SynthesisProgressPanel batchStatus={processingStatus} fileNames={fileNames} />
      <SynthesisProgressPanel batchStatus={failedStatus} fileNames={fileNames} />
    </div>
  ),
};
