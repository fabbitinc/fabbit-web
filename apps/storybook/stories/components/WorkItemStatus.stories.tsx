import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChangeRequestStatusBadge,
  ChangeRequestStatusIcon,
  IssueStatusBadge,
  IssueStatusIcon,
} from "@fabbit/components";

function StatusRow({
  badge,
  description,
  icon,
  label,
}: {
  badge: ReactNode;
  description: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="grid grid-cols-[140px_120px_1fr] items-center gap-4 rounded-lg border bg-card px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {label}
      </div>
      <div>{badge}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function WorkItemStatusShowcase() {
  return (
    <div className="space-y-8 p-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">이슈 상태</h2>
          <p className="text-sm text-muted-foreground">
            목록, 상세 헤더, 연결 항목, 타임라인 이벤트가 같은 정의를 사용합니다.
          </p>
        </div>
        <StatusRow
          badge={<IssueStatusBadge state="OPEN" />}
          description="`OPEN`"
          icon={<IssueStatusIcon state="OPEN" className="h-4 w-4" />}
          label="열림"
        />
        <StatusRow
          badge={<IssueStatusBadge state="CLOSED" />}
          description="`CLOSED`"
          icon={<IssueStatusIcon state="CLOSED" className="h-4 w-4" />}
          label="닫힘"
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">변경 요청 상태</h2>
          <p className="text-sm text-muted-foreground">
            `OPEN`과 `SUBMITTED`는 동일한 제출 표현으로 수렴합니다.
          </p>
        </div>
        <StatusRow
          badge={<ChangeRequestStatusBadge state="DRAFT" />}
          description="`DRAFT`"
          icon={<ChangeRequestStatusIcon state="DRAFT" className="h-4 w-4" />}
          label="초안"
        />
        <StatusRow
          badge={<ChangeRequestStatusBadge state="SUBMITTED" />}
          description="`SUBMITTED`"
          icon={<ChangeRequestStatusIcon state="SUBMITTED" className="h-4 w-4" />}
          label="제출"
        />
        <StatusRow
          badge={<ChangeRequestStatusBadge state="OPEN" />}
          description="`OPEN`"
          icon={<ChangeRequestStatusIcon state="OPEN" className="h-4 w-4" />}
          label="제출"
        />
        <StatusRow
          badge={<ChangeRequestStatusBadge state="MERGED" />}
          description="`MERGED`"
          icon={<ChangeRequestStatusIcon state="MERGED" className="h-4 w-4" />}
          label="반영"
        />
        <StatusRow
          badge={<ChangeRequestStatusBadge state="CLOSED" />}
          description="`CLOSED`"
          icon={<ChangeRequestStatusIcon state="CLOSED" className="h-4 w-4" />}
          label="닫힘"
        />
      </section>
    </div>
  );
}

const meta = {
  title: "Components/WorkItemStatus",
  component: WorkItemStatusShowcase,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof WorkItemStatusShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => <WorkItemStatusShowcase />,
};
