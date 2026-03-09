import {
  ArrowLeft,
  Boxes,
  Building2,
  CheckCircle2,
  FileStack,
  FolderKanban,
  PackageSearch,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  cn,
} from "@fabbit/ui";
import { FormSection } from "./form-section";

export interface PartEditorScreenOption {
  value: string;
  label: string;
}

export interface PartEditorScreenExtendedField {
  helperText?: string;
  id: string;
  label: string;
  placeholder?: string;
  value: string;
}

export interface PartEditorScreenDrawingSummary {
  drawingNumber: string | null;
  fileName: string;
  note?: string;
  revision: string | null;
  statusLabel: string;
  statusTone?: "accent" | "neutral" | "success" | "warning";
  updatedAtLabel: string;
}

export interface PartEditorScreenReferenceStats {
  attachments: number;
  childParts: number;
  linkedProjects: number;
  linkedSuppliers: number;
}

export interface PartEditorScreenFormValues {
  category: string | null;
  description: string;
  isPhantom: boolean;
  leadTimeDays: string;
  lifecycleState: string | null;
  material: string;
  name: string;
  ownerTeamId: string | null;
  partNumber: string;
  revision: string;
  unit: string | null;
}

export interface PartEditorScreenProps {
  backLabel?: string;
  categoryOptions: PartEditorScreenOption[];
  description?: string;
  drawing?: PartEditorScreenDrawingSummary | null;
  extendedFields?: PartEditorScreenExtendedField[];
  formValues: PartEditorScreenFormValues;
  heading?: string;
  isSubmitting?: boolean;
  lastSavedLabel?: string;
  lifecycleOptions: PartEditorScreenOption[];
  mode: "create" | "edit";
  onBack: () => void;
  onChange: (values: PartEditorScreenFormValues) => void;
  onExtendedFieldsChange?: (fields: PartEditorScreenExtendedField[]) => void;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  ownerTeamOptions: PartEditorScreenOption[];
  referenceStats?: PartEditorScreenReferenceStats;
  saveDraftLabel?: string;
  submitLabel?: string;
  unitOptions: PartEditorScreenOption[];
}

function getOptionLabel(options: PartEditorScreenOption[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? "미정";
}

function getBadgeVariant(
  tone: PartEditorScreenDrawingSummary["statusTone"] = "neutral",
) {
  if (tone === "success") {
    return "success";
  }
  if (tone === "warning") {
    return "warning";
  }
  if (tone === "accent") {
    return "accent";
  }
  return "neutral";
}

export function PartEditorScreen({
  backLabel = "부품 관리",
  categoryOptions,
  description,
  drawing = null,
  extendedFields = [],
  formValues,
  heading,
  isSubmitting = false,
  lastSavedLabel,
  lifecycleOptions,
  mode,
  onBack,
  onChange,
  onExtendedFieldsChange,
  onSaveDraft,
  onSubmit,
  ownerTeamOptions,
  referenceStats,
  saveDraftLabel,
  submitLabel,
  unitOptions,
}: PartEditorScreenProps) {
  const pageHeading = heading ?? (mode === "create" ? "새 부품 등록" : "부품 편집");
  const pageDescription =
    description ??
    (mode === "create"
      ? "식별 정보와 운영 속성을 먼저 고정하고, 생성 이후 도면과 프로젝트를 연결합니다."
      : "변경 영향이 큰 필드를 한 화면에서 정리하고, 저장 전에 연결 현황을 다시 확인합니다.");
  const primaryLabel = submitLabel ?? (mode === "create" ? "부품 생성" : "변경 저장");
  const secondaryLabel = saveDraftLabel ?? (mode === "create" ? "초안 저장" : "임시 저장");
  const stats = referenceStats ?? {
    attachments: 0,
    childParts: 0,
    linkedProjects: 0,
    linkedSuppliers: 0,
  };
  const requiredChecks = [
    { label: "품번", complete: formValues.partNumber.trim() !== "" },
    { label: "품명", complete: formValues.name.trim() !== "" },
    { label: "리비전", complete: formValues.revision.trim() !== "" },
    { label: "카테고리", complete: formValues.category !== null && formValues.category !== "" },
    { label: "단위", complete: formValues.unit !== null && formValues.unit !== "" },
  ];
  const progressChecks = [
    ...requiredChecks,
    { label: "상태", complete: formValues.lifecycleState !== null && formValues.lifecycleState !== "" },
    { label: "담당 팀", complete: formValues.ownerTeamId !== null && formValues.ownerTeamId !== "" },
    { label: "설명", complete: formValues.description.trim() !== "" },
  ];
  const completedCount = progressChecks.filter((item) => item.complete).length;
  const completionRate = Math.round((completedCount / progressChecks.length) * 100);
  const missingRequired = requiredChecks.filter((item) => !item.complete).map((item) => item.label);
  const canSubmit = missingRequired.length === 0 && !isSubmitting;
  const categoryLabel = getOptionLabel(categoryOptions, formValues.category);
  const lifecycleLabel = getOptionLabel(lifecycleOptions, formValues.lifecycleState);
  const unitLabel = getOptionLabel(unitOptions, formValues.unit);
  const ownerTeamLabel = getOptionLabel(ownerTeamOptions, formValues.ownerTeamId);
  const referenceItems = [
    { icon: FolderKanban, label: "연결 프로젝트", value: `${stats.linkedProjects}건` },
    { icon: Building2, label: "공급사 연결", value: `${stats.linkedSuppliers}곳` },
    { icon: FileStack, label: "첨부 파일", value: `${stats.attachments}개` },
    { icon: Boxes, label: "하위 구성", value: `${stats.childParts}개` },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <button
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={mode === "create" ? "accent" : "info"}>
              {mode === "create" ? "등록 세션" : "편집 세션"}
            </Badge>
            <Badge variant="outline">{lifecycleLabel}</Badge>
            {lastSavedLabel ? (
              <span className="text-sm text-muted-foreground">{lastSavedLabel}</span>
            ) : null}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {pageHeading}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {pageDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">준비도 {completionRate}%</Badge>
          <Badge variant="outline">필수 {requiredChecks.length - missingRequired.length}/{requiredChecks.length}</Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_22rem]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70">
            <CardContent className="relative p-6">
              <div className="absolute -left-12 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-secondary/60 blur-3xl" />
              <div className="relative space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                      현재 식별 정보
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <p className="font-mono text-3xl font-semibold text-foreground">
                        {formValues.partNumber.trim() || "PART-NUMBER"}
                      </p>
                      <Badge variant={mode === "create" ? "accent" : "outline"}>
                        {mode === "create" ? "신규 초안" : "변경 반영 중"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-base text-foreground">
                      {formValues.name.trim() || "품명이 아직 입력되지 않았습니다"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-right shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      리비전
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {formValues.revision.trim() || "A"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">카테고리</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{categoryLabel}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">단위</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{unitLabel}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">재질</p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formValues.material.trim() || "미정"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">담당 팀</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{ownerTeamLabel}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <FormSection title="식별 정보" description="품번과 기본 식별 속성을 먼저 고정합니다.">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="part-editor-part-number">품번 *</Label>
                    <Input
                      id="part-editor-part-number"
                      placeholder="예: DRV-BASE-0142"
                      value={formValues.partNumber}
                      onChange={(event) =>
                        onChange({ ...formValues, partNumber: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="part-editor-revision">리비전 *</Label>
                    <Input
                      id="part-editor-revision"
                      placeholder="예: B"
                      value={formValues.revision}
                      onChange={(event) =>
                        onChange({ ...formValues, revision: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="part-editor-name">품명 *</Label>
                  <Input
                    id="part-editor-name"
                    placeholder="예: 드라이브 유닛 베이스 플레이트"
                    value={formValues.name}
                    onChange={(event) =>
                      onChange({ ...formValues, name: event.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>카테고리 *</Label>
                    <Select
                      value={formValues.category ?? undefined}
                      onValueChange={(value) => onChange({ ...formValues, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>상태</Label>
                    <Select
                      value={formValues.lifecycleState ?? undefined}
                      onValueChange={(value) =>
                        onChange({ ...formValues, lifecycleState: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상태를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {lifecycleOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <FormSection title="운영 속성" description="단위, 재질, 담당 정보를 연결해 후속 흐름을 준비합니다.">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="part-editor-material">재질</Label>
                    <Input
                      id="part-editor-material"
                      placeholder="예: AL6061-T6"
                      value={formValues.material}
                      onChange={(event) =>
                        onChange({ ...formValues, material: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>단위 *</Label>
                    <Select
                      value={formValues.unit ?? undefined}
                      onValueChange={(value) => onChange({ ...formValues, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="단위를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="part-editor-lead-time">리드타임(일)</Label>
                    <Input
                      id="part-editor-lead-time"
                      inputMode="numeric"
                      placeholder="예: 14"
                      value={formValues.leadTimeDays}
                      onChange={(event) =>
                        onChange({ ...formValues, leadTimeDays: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>담당 팀</Label>
                    <Select
                      value={formValues.ownerTeamId ?? undefined}
                      onValueChange={(value) =>
                        onChange({ ...formValues, ownerTeamId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="담당 팀을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerTeamOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">팬텀 부품</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      재고를 보유하지 않고 상위 조립 안에서만 계산되는 부품으로 표시합니다.
                    </p>
                  </div>
                  <Switch
                    checked={formValues.isPhantom}
                    onCheckedChange={(checked) =>
                      onChange({ ...formValues, isPhantom: checked })
                    }
                  />
                </div>
              </FormSection>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-6">
              <FormSection title="설명 및 확장 속성" description="도면 외 추가 검색 키와 운영 메모를 정리합니다.">
                <div className="space-y-2">
                  <Label htmlFor="part-editor-description">설명</Label>
                  <Textarea
                    id="part-editor-description"
                    className="min-h-32"
                    placeholder="부품의 사용 맥락, 조립 유의사항, 공급 제약을 입력하세요"
                    value={formValues.description}
                    onChange={(event) =>
                      onChange({ ...formValues, description: event.target.value })
                    }
                  />
                </div>

                {extendedFields.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {extendedFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={`part-editor-extra-${field.id}`}>{field.label}</Label>
                        <Input
                          id={`part-editor-extra-${field.id}`}
                          placeholder={field.placeholder}
                          value={field.value}
                          onChange={(event) => {
                            if (!onExtendedFieldsChange) {
                              return;
                            }
                            onExtendedFieldsChange(
                              extendedFields.map((item) =>
                                item.id === field.id
                                  ? { ...item, value: event.target.value }
                                  : item,
                              ),
                            );
                          }}
                        />
                        {field.helperText ? (
                          <p className="text-xs text-muted-foreground">{field.helperText}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-5 text-sm text-muted-foreground">
                    추가 속성은 아직 정의되지 않았습니다. 템플릿 매핑이 확정되면 구매 코드, 표면 처리, 규격 키를 여기에 붙일 수 있습니다.
                  </div>
                )}
              </FormSection>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {missingRequired.length === 0
                  ? "필수 항목이 모두 채워졌습니다."
                  : `아직 ${missingRequired.join(", ")} 항목이 필요합니다.`}
              </p>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? "생성 후에는 프로젝트, 공급사, 도면 연결을 이어서 진행하면 됩니다."
                  : "저장 전에 연결 프로젝트와 도면 리비전이 변경 영향과 일치하는지 다시 확인하세요."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onSaveDraft ? (
                <Button type="button" variant="ghost" onClick={onSaveDraft}>
                  {secondaryLabel}
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={onBack}>
                취소
              </Button>
              <Button type="button" disabled={!canSubmit} onClick={onSubmit}>
                {isSubmitting ? "처리 중..." : primaryLabel}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="relative overflow-hidden border-primary/20">
            <div className="absolute inset-x-6 top-0 h-24 rounded-full bg-primary/12 blur-3xl" />
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant={mode === "create" ? "accent" : "info"}>
                  {mode === "create" ? "신규 구성" : "변경 세션"}
                </Badge>
                <Sparkles className="size-4 text-primary" />
              </div>
              <CardTitle>입력 준비도 {completionRate}%</CardTitle>
              <CardDescription>
                생성 전 필수 식별자와 운영 메타데이터가 얼마나 준비됐는지 한 눈에 봅니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-5">
              <Progress className="h-2.5" value={completionRate} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">필수 충족</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {requiredChecks.length - missingRequired.length}/{requiredChecks.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">추천 항목</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {completedCount - (requiredChecks.length - missingRequired.length)}/
                    {progressChecks.length - requiredChecks.length}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {progressChecks.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                      item.complete
                        ? "border-primary/20 bg-primary/5 text-foreground"
                        : "border-border/60 bg-background/60 text-muted-foreground",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.complete ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <span className="text-xs">대기</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">도면 연결 상태</CardTitle>
              <CardDescription>편집 중인 부품과 시각 산출물의 준비 상태입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {drawing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{drawing.fileName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{drawing.updatedAtLabel}</p>
                    </div>
                    <Badge variant={getBadgeVariant(drawing.statusTone)}>
                      {drawing.statusLabel}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">도면 번호</span>
                      <span className="font-mono text-foreground">
                        {drawing.drawingNumber ?? "미등록"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">도면 리비전</span>
                      <span className="font-medium text-foreground">
                        {drawing.revision ?? "미정"}
                      </span>
                    </div>
                  </div>
                  {drawing.note ? (
                    <p className="text-sm leading-6 text-muted-foreground">{drawing.note}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-5">
                  <div className="flex items-start gap-3">
                    <PackageSearch className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">도면이 아직 연결되지 않았습니다</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        부품 생성 후 PDF, DWG, 3D 뷰어 산출물을 연결하면 상세 화면과 공급사 흐름에서 바로 재사용할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">연결 현황</CardTitle>
              <CardDescription>편집 결과가 영향을 주는 주변 엔티티 범위입니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {referenceItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <p className="text-sm text-foreground">{item.label}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
