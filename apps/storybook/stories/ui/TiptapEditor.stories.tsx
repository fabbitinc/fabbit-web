import type { Meta, StoryObj } from "@storybook/react-vite";
import { TiptapEditor } from "@fabbit/ui";

const meta = {
  title: "ui/TiptapEditor",
  component: TiptapEditor,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    placeholder: "내용을 입력하세요...",
    editable: true,
    minHeight: 120,
  },
} satisfies Meta<typeof TiptapEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    content: "<p>설계 변경 사유: 인버터 하우징 간섭으로 인해 <strong>브레이크 조립체</strong> 위치를 15mm 이동합니다.</p><ul><li>도면 수정 필요</li><li>시뮬레이션 재검증 필요</li></ul>",
  },
};

export const ReadOnly: Story = {
  args: {
    content: "<p>이 내용은 <strong>읽기 전용</strong>입니다. 편집할 수 없습니다.</p>",
    editable: false,
  },
};

export const HiddenToolbar: Story = {
  args: {
    hideToolbar: true,
    placeholder: "툴바 없이 입력...",
  },
};

export const SmallHeight: Story = {
  args: {
    minHeight: 60,
    placeholder: "댓글을 작성하세요...",
  },
};

export const Showcase: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">편집 모드</p>
        <TiptapEditor placeholder="내용을 입력하세요..." />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">내용 포함</p>
        <TiptapEditor
          content="<p>AL-6061 소재의 <strong>열처리 공정</strong>을 T6에서 T651로 변경합니다.</p><blockquote>공급사 협의 완료</blockquote>"
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">읽기 전용</p>
        <TiptapEditor
          content="<p>CNC 가공 조건: 주축 회전수 <strong>12,000 RPM</strong>, 이송속도 800mm/min</p>"
          editable={false}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">툴바 숨김</p>
        <TiptapEditor hideToolbar placeholder="댓글을 작성하세요..." minHeight={60} />
      </div>
    </div>
  ),
};
