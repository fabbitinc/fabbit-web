import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import { SelectionDialog, type SelectionDialogProps } from "@fabbit/components";
import { Badge, UserAvatar } from "@fabbit/ui";

interface StorySelectionItem {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  avatarName?: string;
}

function StorySelectionDialog(props: SelectionDialogProps<StorySelectionItem>) {
  return <SelectionDialog {...props} />;
}

const sampleMembers: StorySelectionItem[] = [
  { id: "u-1", title: "문서연", subtitle: "품질 엔지니어", avatarName: "문서연" },
  { id: "u-2", title: "김하준", subtitle: "생산기술", avatarName: "김하준" },
  { id: "u-3", title: "박민우", subtitle: "구매 담당", avatarName: "박민우" },
];

const sampleIssues: StorySelectionItem[] = [
  { id: "cr-102", title: "#102 도면 리비전 반영", subtitle: "도면 승인 대기", status: "OPEN" },
  { id: "cr-118", title: "#118 BOM 불일치 확인", subtitle: "검토 요청됨", status: "REVIEW" },
  { id: "cr-121", title: "#121 공급사 변경 영향", subtitle: "초안 작성 중", status: "DRAFT" },
];

const meta = {
  title: "Components/SelectionDialog",
  component: StorySelectionDialog as ComponentType<SelectionDialogProps<StorySelectionItem>>,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof StorySelectionDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MemberSelection: Story = {
  render: () => (
    <StorySelectionDialog
      open
      description="변경 요청 담당자로 지정할 멤버를 선택합니다."
      emptyMessage="검색 조건에 맞는 멤버가 없습니다."
      getItemId={(item) => item.id}
      isLoading={false}
      isPending={false}
      items={sampleMembers}
      searchPlaceholder="이름 또는 역할로 검색"
      searchValue=""
      selectedIds={["u-2"]}
      title="담당자 편집"
      onConfirm={() => undefined}
      onOpenChange={() => undefined}
      onSearchChange={() => undefined}
      onToggle={() => undefined}
      renderItem={(item) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={item.avatarName ?? item.title} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
        </div>
      )}
    />
  ),
};

export const Showcase: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <StorySelectionDialog
        open
        description="변경 요청 담당자로 지정할 멤버를 선택합니다."
        emptyMessage="검색 조건에 맞는 멤버가 없습니다."
        getItemId={(item) => item.id}
        isLoading={false}
        isPending={false}
        items={sampleMembers}
        searchPlaceholder="이름 또는 역할로 검색"
        searchValue=""
        selectedIds={["u-1", "u-3"]}
        title="담당자 편집"
        onConfirm={() => undefined}
        onOpenChange={() => undefined}
        onSearchChange={() => undefined}
        onToggle={() => undefined}
        renderItem={(item) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={item.avatarName ?? item.title} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
          </div>
        )}
      />

      <StorySelectionDialog
        open
        description="연결할 변경 요청을 선택합니다."
        emptyMessage="검색 조건에 맞는 변경 요청이 없습니다."
        getItemId={(item) => item.id}
        isLoading={false}
        isPending={false}
        items={sampleIssues}
        searchPlaceholder="번호 또는 제목으로 검색"
        searchValue="도면"
        selectedIds={["cr-102"]}
        title="변경 요청 연결"
        onConfirm={() => undefined}
        onOpenChange={() => undefined}
        onSearchChange={() => undefined}
        onToggle={() => undefined}
        renderItem={(item) => (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            {item.status ? <Badge variant="outline">{item.status}</Badge> : null}
          </div>
        )}
      />
    </div>
  ),
};
