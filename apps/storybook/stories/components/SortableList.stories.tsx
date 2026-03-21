import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, PowerOff, Power, Trash2 } from "lucide-react";
import { SortableList, type SortableListColumn } from "@fabbit/components";
import { Badge, Button, Tooltip, TooltipContent, TooltipTrigger } from "@fabbit/ui";

/* ─── Mock 데이터 ─── */

interface PropertyItem {
  id: string;
  name: string;
  description?: string;
  category: "system" | "custom";
  valueType: string;
  optionMode: string | null;
  required: boolean;
  active: boolean;
}

const MOCK_PROPERTIES: PropertyItem[] = [
  {
    id: "1",
    name: "품명",
    description: "사람이 읽을 수 있는 부품 이름",
    category: "system",
    valueType: "문자열",
    optionMode: null,
    required: true,
    active: true,
  },
  {
    id: "2",
    name: "리비전",
    description: "부품 리비전",
    category: "system",
    valueType: "문자열",
    optionMode: null,
    required: false,
    active: true,
  },
  {
    id: "3",
    name: "품번",
    description: "부품의 고유 식별자",
    category: "system",
    valueType: "문자열",
    optionMode: null,
    required: true,
    active: true,
  },
  {
    id: "4",
    name: "재질",
    description: "부품 재질",
    category: "system",
    valueType: "문자열",
    optionMode: null,
    required: false,
    active: true,
  },
  {
    id: "5",
    name: "리드타임(일)",
    description: "부품 리드타임(일)",
    category: "system",
    valueType: "정수",
    optionMode: null,
    required: false,
    active: true,
  },
  {
    id: "6",
    name: "표면 처리",
    description: "도금, 도장 등 표면 처리 방식",
    category: "custom",
    valueType: "선택값",
    optionMode: "목록에서만 선택",
    required: false,
    active: true,
  },
  {
    id: "7",
    name: "검사 등급",
    description: "품질 검사 등급 (A/B/C)",
    category: "custom",
    valueType: "선택값",
    optionMode: "직접 입력 허용",
    required: false,
    active: false,
  },
  {
    id: "8",
    name: "공급업체 코드",
    category: "custom",
    valueType: "문자열",
    optionMode: null,
    required: false,
    active: true,
  },
];

/* ─── 컬럼 정의 ─── */

const columns: SortableListColumn<PropertyItem>[] = [
  {
    key: "name",
    header: "항목",
    render: (item) => (
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{item.name}</p>
        {item.description ? (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
    ),
  },
  {
    key: "category",
    header: "구분",
    className: "whitespace-nowrap",
    render: (item) => (
      <Badge variant={item.category === "system" ? "secondary" : "outline"}>
        {item.category === "system" ? "기본 항목" : "사용자 정의"}
      </Badge>
    ),
  },
  {
    key: "valueType",
    header: "입력 형식",
    className: "whitespace-nowrap",
    render: (item) => item.valueType,
  },
  {
    key: "optionMode",
    header: "입력 방식",
    className: "whitespace-nowrap",
    render: (item) => item.optionMode ?? "—",
  },
  {
    key: "required",
    header: "필수",
    className: "whitespace-nowrap",
    render: (item) => (item.required ? "필수" : "선택"),
  },
  {
    key: "active",
    header: "사용 여부",
    className: "whitespace-nowrap",
    render: (item) => (
      <Badge variant={item.active ? "success" : "outline"}>
        {item.active ? "사용 중" : "사용 안 함"}
      </Badge>
    ),
  },
];

/* ─── Stories ─── */

const meta = {
  title: "Components/SortableList",
  component: SortableList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(MOCK_PROPERTIES);

    return (
      <div className="mx-auto max-w-5xl">
        <SortableList
          columns={columns}
          emptyMessage="등록된 항목이 없습니다."
          getItemId={(item) => item.id}
          gridTemplateColumns="40px 1fr 120px 100px 120px 64px 100px 130px"
          items={items}
          renderActions={(item) => (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" aria-label="편집">
                    <Pencil className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>편집</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" aria-label={item.active ? "비활성화" : "활성화"}>
                    {item.active ? (
                      <PowerOff className="size-3.5 text-muted-foreground" />
                    ) : (
                      <Power className="size-3.5 text-primary" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  {item.active ? "비활성화" : "활성화"}
                </TooltipContent>
              </Tooltip>
              {item.category === "custom" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="삭제">
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>삭제</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          )}
          onReorder={setItems}
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className="mx-auto max-w-5xl">
      <SortableList<PropertyItem>
        columns={columns}
        emptyMessage="등록된 항목이 없습니다."
        getItemId={(item) => item.id}
        gridTemplateColumns="40px 1fr 120px 100px 120px 64px 100px 130px"
        items={[]}
        onReorder={() => {}}
      />
    </div>
  ),
};

export const FewItems: Story = {
  render: () => {
    const [items, setItems] = useState(MOCK_PROPERTIES.slice(0, 3));

    return (
      <div className="mx-auto max-w-5xl">
        <SortableList
          columns={columns}
          getItemId={(item) => item.id}
          gridTemplateColumns="40px 1fr 120px 100px 120px 64px 100px 130px"
          items={items}
          renderActions={(item) => (
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" aria-label="편집">
                <Pencil className="size-3.5" />
              </Button>
              {item.category === "custom" ? (
                <Button size="icon" variant="ghost" aria-label="삭제">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              ) : null}
            </div>
          )}
          onReorder={setItems}
        />
      </div>
    );
  },
};
