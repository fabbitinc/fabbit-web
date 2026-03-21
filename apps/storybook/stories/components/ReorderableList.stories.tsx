import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, ChevronUp, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
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

/* ─── 유틸 ─── */

function swap<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/* ─── Stories ─── */

const meta = {
  title: "Components/ReorderableList",
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

    const moveUp = (index: number) => {
      if (index === 0) return;
      setItems(swap(items, index, index - 1));
    };

    const moveDown = (index: number) => {
      if (index === items.length - 1) return;
      setItems(swap(items, index, index + 1));
    };

    const toggleActive = (id: string) => {
      setItems(items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)));
    };

    const deleteItem = (id: string) => {
      setItems(items.filter((item) => item.id !== id));
    };

    return (
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-20 px-2 py-3 text-center font-medium">순서</th>
                <th className="px-4 py-3 text-left font-medium">항목</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">구분</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">입력 형식</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">입력 방식</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">필수</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">사용 여부</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-t border-border/70 align-middle">
                  <td className="px-2 py-1.5 text-center">
                    <div className="inline-flex flex-col">
                      <button
                        className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        type="button"
                        disabled={index === 0}
                        aria-label="위로 이동"
                        onClick={() => moveUp(index)}
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                        type="button"
                        disabled={index === items.length - 1}
                        aria-label="아래로 이동"
                        onClick={() => moveDown(index)}
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{item.name}</p>
                      {item.description ? (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={item.category === "system" ? "secondary" : "outline"}>
                      {item.category === "system" ? "기본 항목" : "사용자 정의"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{item.valueType}</td>
                  <td className="whitespace-nowrap px-4 py-3">{item.optionMode ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{item.required ? "필수" : "선택"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={item.active ? "success" : "outline"}>
                      {item.active ? "사용 중" : "사용 안 함"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
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
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={item.active ? "비활성화" : "활성화"}
                            onClick={() => toggleActive(item.id)}
                          >
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
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="삭제"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={4}>삭제</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={8}>
                    등록된 항목이 없습니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};
