import { ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { FormSection } from "./form-section";

export interface WorkOrderCreateBomOption {
  id: string;
  code: string;
  label: string;
}

export interface WorkOrderCreateTeamOption {
  id: string;
  name: string;
}

export interface WorkOrderCreateFormValues {
  productName: string;
  bomId: string | null;
  quantity: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  teamId: string | null;
  note: string;
}

export interface WorkOrderCreateScreenProps {
  formValues: WorkOrderCreateFormValues;
  bomOptions: WorkOrderCreateBomOption[];
  teamOptions: WorkOrderCreateTeamOption[];
  isSubmitting?: boolean;
  onBack: () => void;
  onChange: (values: WorkOrderCreateFormValues) => void;
  onSubmit: () => void;
}

export function WorkOrderCreateScreen({
  formValues,
  bomOptions,
  teamOptions,
  isSubmitting = false,
  onBack,
  onChange,
  onSubmit,
}: WorkOrderCreateScreenProps) {
  const isBomSelected = formValues.bomId !== null;
  const isQuantityValid = Number(formValues.quantity) > 0;
  const isDueDateValid = formValues.dueDate !== "" && new Date(formValues.dueDate) >= new Date(new Date().toDateString());
  const canSubmit = formValues.productName.trim() !== "" && isBomSelected && isQuantityValid && isDueDateValid && !isSubmitting;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">새 작업 등록</h1>
          <p className="mt-1 text-sm text-muted-foreground">작업지시를 생성합니다</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-8">
          <FormSection title="기본 정보" description="품목과 수량, 납기를 입력합니다">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wo-product">품목명 *</Label>
                <Input
                  id="wo-product"
                  placeholder="생산할 품목명을 입력하세요"
                  value={formValues.productName}
                  onChange={(e) => onChange({ ...formValues, productName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wo-quantity">수량 *</Label>
                  <Input
                    id="wo-quantity"
                    type="number"
                    min={1}
                    placeholder="0"
                    value={formValues.quantity}
                    onChange={(e) => onChange({ ...formValues, quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wo-duedate">납기 *</Label>
                  <Input
                    id="wo-duedate"
                    type="date"
                    value={formValues.dueDate}
                    onChange={(e) => onChange({ ...formValues, dueDate: e.target.value })}
                  />
                  {formValues.dueDate !== "" && !isDueDateValid && (
                    <p className="text-xs text-destructive">납기는 오늘 이후여야 합니다</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>우선순위</Label>
                <Select
                  value={formValues.priority}
                  onValueChange={(v) => onChange({ ...formValues, priority: v as "high" | "medium" | "low" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">긴급</SelectItem>
                    <SelectItem value="medium">보통</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          <FormSection title="기준본 정보" description="Released BOM을 선택합니다. 기준본 없이 작업을 생성할 수 없습니다.">
            <div className="space-y-2">
              <Label>BOM 기준본 *</Label>
              <Select
                value={formValues.bomId ?? ""}
                onValueChange={(v) => onChange({ ...formValues, bomId: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="BOM을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {bomOptions.map((bom) => (
                    <SelectItem key={bom.id} value={bom.id}>
                      {bom.code} — {bom.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isBomSelected && (
                <p className="text-xs text-muted-foreground">기준본을 반드시 선택해야 합니다</p>
              )}
            </div>
          </FormSection>

          <FormSection title="담당 정보" description="작업을 수행할 팀을 지정합니다">
            <div className="space-y-2">
              <Label>담당 조직</Label>
              <Select
                value={formValues.teamId ?? ""}
                onValueChange={(v) => onChange({ ...formValues, teamId: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당 팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {teamOptions.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormSection>

          <FormSection title="비고">
            <div className="space-y-2">
              <Label htmlFor="wo-note">메모</Label>
              <Input
                id="wo-note"
                placeholder="참고 사항을 입력하세요"
                value={formValues.note}
                onChange={(e) => onChange({ ...formValues, note: e.target.value })}
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            취소
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={onSubmit}>
            {isSubmitting ? "등록 중..." : "작업 등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
