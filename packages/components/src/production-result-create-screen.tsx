import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  Label,
} from "@fabbit/ui";
import { FormSection } from "./form-section";

export interface ProductionResultCreateWorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  plannedQuantity: number;
  assigneeName: string;
}

export interface ProductionResultCreateFormValues {
  goodQuantity: string;
  defectQuantity: string;
  workStartTime: string;
  workEndTime: string;
  memo: string;
}

export interface ProductionResultCreateScreenProps {
  workOrder: ProductionResultCreateWorkOrder;
  formValues: ProductionResultCreateFormValues;
  isSubmitting?: boolean;
  onBack: () => void;
  onChange: (values: ProductionResultCreateFormValues) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onCreateDefectRecord: () => void;
}

export function ProductionResultCreateScreen({
  workOrder,
  formValues,
  isSubmitting = false,
  onBack,
  onChange,
  onSubmit,
  onSaveDraft,
  onCreateDefectRecord,
}: ProductionResultCreateScreenProps) {
  const goodQty = Number(formValues.goodQuantity) || 0;
  const defectQty = Number(formValues.defectQuantity) || 0;
  const totalQty = goodQty + defectQty;
  const isOverPlan = totalQty > workOrder.plannedQuantity;
  const isGoodValid = goodQty >= 0;
  const hasDefect = defectQty > 0;
  const canSubmit =
    goodQty > 0 &&
    isGoodValid &&
    formValues.workStartTime !== "" &&
    formValues.workEndTime !== "" &&
    !isOverPlan &&
    !isSubmitting;

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
          <h1 className="text-xl font-bold text-foreground">생산실적 입력</h1>
          <p className="mt-1 text-sm text-muted-foreground">작업 결과를 기록합니다</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-8">
          <FormSection title="참조 정보" description="작업지시 기본 정보입니다">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">작업번호</span>
                <p className="text-sm font-medium text-foreground">{workOrder.orderNumber}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">품목명</span>
                <p className="text-sm font-medium text-foreground">{workOrder.productName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">계획 수량</span>
                <p className="text-sm font-medium text-foreground">{workOrder.plannedQuantity.toLocaleString()}개</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">담당</span>
                <p className="text-sm font-medium text-foreground">{workOrder.assigneeName}</p>
              </div>
            </div>
          </FormSection>

          <FormSection title="실적 입력" description="양품, 불량, 작업시간을 입력합니다">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pr-good">양품 수량 *</Label>
                  <Input
                    id="pr-good"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formValues.goodQuantity}
                    onChange={(e) => onChange({ ...formValues, goodQuantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pr-defect">불량 수량</Label>
                  <Input
                    id="pr-defect"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formValues.defectQuantity}
                    onChange={(e) => onChange({ ...formValues, defectQuantity: e.target.value })}
                  />
                </div>
              </div>

              {isOverPlan && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>양품 + 불량({totalQty.toLocaleString()})이 계획 수량({workOrder.plannedQuantity.toLocaleString()})을 초과합니다</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pr-start">작업 시작 *</Label>
                  <Input
                    id="pr-start"
                    type="time"
                    value={formValues.workStartTime}
                    onChange={(e) => onChange({ ...formValues, workStartTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pr-end">작업 종료 *</Label>
                  <Input
                    id="pr-end"
                    type="time"
                    value={formValues.workEndTime}
                    onChange={(e) => onChange({ ...formValues, workEndTime: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="비고">
            <div className="space-y-2">
              <Label htmlFor="pr-memo">메모</Label>
              <Input
                id="pr-memo"
                placeholder="참고 사항을 입력하세요"
                value={formValues.memo}
                onChange={(e) => onChange({ ...formValues, memo: e.target.value })}
              />
            </div>
          </FormSection>
        </div>

        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            {hasDefect && (
              <Button type="button" variant="outline" onClick={onCreateDefectRecord}>
                불량 기록 작성
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onSaveDraft}>
              임시 저장
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              취소
            </Button>
            <Button type="button" disabled={!canSubmit} onClick={onSubmit}>
              {isSubmitting ? "저장 중..." : "완료 처리"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
