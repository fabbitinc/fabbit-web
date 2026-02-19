import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  Ellipsis,
  FlaskConical,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

const COMPONENT_SECTIONS = [
  { id: "button", label: "Button" },
  { id: "form", label: "Form" },
  { id: "status", label: "Status" },
  { id: "overlay", label: "Overlay" },
  { id: "list", label: "List" },
];

const EXTENDED_LABEL = "확장 속성";
const UNSELECTED_LABEL = "속성 선택";

const MOCK_TEMPLATE_ROWS = [
  { id: "TP-001", title: "Compact Header", owner: "SH", state: "Draft" },
  { id: "TP-002", title: "Issue Card", owner: "MK", state: "Review" },
  { id: "TP-003", title: "Schedule Lane", owner: "HN", state: "Ready" },
  { id: "TP-004", title: "Approval Sheet", owner: "BR", state: "Draft" },
  { id: "TP-005", title: "Parts Panel", owner: "YL", state: "Ready" },
  { id: "TP-006", title: "Template Hero", owner: "JW", state: "Review" },
];

const MOCK_TARGET_OPTIONS = [
  { property: "part_number" },
  { property: "name" },
  { property: "description" },
  { property: "material" },
  { property: "weight" },
  { property: "revision" },
];

const MOCK_MAPPED_PROPERTIES = ["part_number", "name"];
const MOCK_PART_MERGE_KEYS = ["part_number", "revision"];

interface PropertyGroupItem {
  value: string;
  items: string[];
}

function SectionCard({
  title,
  description,
  compact,
  children,
}: {
  title: string;
  description: string;
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-sm", compact ? "p-4" : "p-5")}>
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function TemplatesPreview() {
  const [compact, setCompact] = useState(false);
  const [intent, setIntent] = useState("default");
  const [progressValue, setProgressValue] = useState(52);
  const [partPropertyComboValue, setPartPropertyComboValue] = useState(UNSELECTED_LABEL);

  const mappedProperties = new Set(MOCK_MAPPED_PROPERTIES);
  const availableOptions = MOCK_TARGET_OPTIONS.filter(
    (opt) => !mappedProperties.has(opt.property),
  );
  const partMergeKeys = new Set(MOCK_PART_MERGE_KEYS);

  const partPropertyGroups = useMemo<PropertyGroupItem[]>(
    () => [
      {
        value: "선택",
        items: [UNSELECTED_LABEL],
      },
      {
        value: "기본 속성",
        items: availableOptions.map((opt) => opt.property),
      },
      {
        value: "확장",
        items: [EXTENDED_LABEL],
      },
    ],
    [availableOptions],
  );

  return (
    <div className="min-h-screen bg-background px-5 py-8 lg:px-8">
      <div className="dev-page-container space-y-5">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Dev / Templates Playground
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">컴포넌트 템플릿 실험실</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  프로덕션 화면과 분리된 독립 실험 공간입니다. 상태와 조합을 빠르게 확인하면서 화면 템플릿을 조립할 수 있습니다.
                </p>
              </div>
              <Badge variant="outline" className="gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Storybook-style
              </Badge>
            </div>

            <div className="grid gap-3 rounded-xl border border-border/80 bg-muted/30 p-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="intent">Primary Intent</Label>
                <Select value={intent} onValueChange={setIntent}>
                  <SelectTrigger id="intent" className="bg-background">
                    <SelectValue placeholder="Intent 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Progress</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setProgressValue((prev) => Math.max(0, prev - 10))}>
                    -10
                  </Button>
                  <Progress value={progressValue} className="h-2.5" />
                  <Button size="sm" variant="outline" onClick={() => setProgressValue((prev) => Math.min(100, prev + 10))}>
                    +10
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Compact Density</p>
                  <p className="text-xs text-muted-foreground">간격을 줄여 밀도 높은 UI를 확인합니다.</p>
                </div>
                <Switch checked={compact} onCheckedChange={setCompact} />
              </div>
            </div>
          </div>
        </section>

        <nav className="flex flex-wrap gap-2">
          {COMPONENT_SECTIONS.map((section) => (
            <Badge key={section.id} variant="secondary" className="rounded-full px-3 py-1 text-xs">
              <a href={`#${section.id}`}>{section.label}</a>
            </Badge>
          ))}
        </nav>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Button"
            description="버튼 사이즈와 variant 조합을 빠르게 확인합니다."
            compact={compact}
          >
            <div id="button" className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="xs">XS</Button>
                <Button size="sm">SM</Button>
                <Button size="default">MD</Button>
                <Button size="lg">LG</Button>
                <Button size="icon" aria-label="아이콘 버튼">
                  <LayoutTemplate className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Form"
            description="입력 필드와 선택 컴포넌트의 기본 상태를 확인합니다."
            compact={compact}
          >
            <div id="form" className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="template-name">Template name</Label>
                  <Input id="template-name" placeholder="예: Approval Summary Card" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="template-owner">Owner</Label>
                  <Input id="template-owner" placeholder="예: 디자인팀" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="template-notes">Notes</Label>
                <Textarea id="template-notes" placeholder="컴포넌트 사용 맥락 또는 테스트 포인트를 기록하세요." />
              </div>
              <div className="space-y-1.5 rounded-lg border border-border/80 bg-muted/30 p-3">
                <Label className="text-xs text-muted-foreground">카드 아이템 속성 Combobox (Groups + Auto Highlight)</Label>
                <Combobox
                  items={partPropertyGroups}
                  value={partPropertyComboValue}
                  onValueChange={(value) => setPartPropertyComboValue(value ?? UNSELECTED_LABEL)}
                  autoHighlight
                >
                  <ComboboxInput
                    className="w-[220px]"
                    placeholder="속성 검색 또는 선택"
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
                    <ComboboxList>
                      {(group) => (
                        <ComboboxGroup key={group.value} items={group.items}>
                          <ComboboxLabel>{group.value}</ComboboxLabel>
                          <ComboboxCollection>
                            {(item) => (
                              <ComboboxItem key={`${group.value}-${item}`} value={item}>
                                <span className="inline-flex items-center gap-1">
                                  {item}
                                  {partMergeKeys.has(item) && (
                                    <span className="text-[10px] font-semibold text-red-500">*</span>
                                  )}
                                </span>
                              </ComboboxItem>
                            )}
                          </ComboboxCollection>
                        </ComboboxGroup>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Status"
            description="토큰 기반 상태 배지와 진행 상태를 함께 점검합니다."
            compact={compact}
          >
            <div id="status" className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="status-chip status-chip--success">Success</span>
                <span className="status-chip status-chip--warning">Warning</span>
                <span className="status-chip status-chip--danger">Danger</span>
                <span className="status-chip status-chip--info">Info</span>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>현재 진행률</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} />
              </div>
              <Badge variant={intent === "warning" ? "secondary" : "outline"}>
                Intent: {intent}
              </Badge>
            </div>
          </SectionCard>

          <SectionCard
            title="Overlay"
            description="Tooltip/Popover/Dialog/Dropdown 인터랙션을 한곳에서 확인합니다."
            compact={compact}
          >
            <div id="overlay" className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>컴포넌트 포커스 힌트</TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader>
                    <PopoverTitle>빠른 조합 팁</PopoverTitle>
                    <PopoverDescription>
                      Input + Badge + Dropdown 조합이 리스트 관리 화면에서 자주 사용됩니다.
                    </PopoverDescription>
                  </PopoverHeader>
                </PopoverContent>
              </Popover>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>템플릿 저장 미리보기</DialogTitle>
                    <DialogDescription>
                      이 다이얼로그는 폼 저장 전 확인 단계용 샘플입니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button>저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="더보기">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="List"
          description="아바타/리스트/콜랩서블을 조합한 템플릿 목록 샘플입니다."
          compact={compact}
        >
          <div id="list" className="space-y-3">
            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-2">
                  Ready to Use Templates
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Separator className="my-2" />
                <ScrollArea className="h-56 rounded-lg border border-border bg-background">
                  <ul className="divide-y divide-border">
                    {MOCK_TEMPLATE_ROWS.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-8 w-8 border border-border">
                            <AvatarFallback className="text-xs">{item.owner}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.id}</p>
                          </div>
                        </div>
                        <Badge variant={item.state === "Ready" ? "default" : "outline"}>{item.state}</Badge>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
