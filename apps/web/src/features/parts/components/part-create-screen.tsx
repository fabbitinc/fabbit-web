import { useCallback, useEffect, useState } from "react";
import {
  PartEditorScreen,
  type PartEditorScreenExtendedField,
  type PartEditorScreenFormValues,
  type PartEditorScreenOption,
} from "@fabbit/components";
import { CreatePartRequestLifecycleState } from "@/api/generated/orval/model/createPartRequestLifecycleState";
import { useCreatePartAction } from "@/features/parts/hooks/use-create-part-action";
import { buildPartCustomPropertyFields, buildPartCustomPropertiesPayload } from "@/features/parts/lib/part-custom-properties";
import { buildPartSystemFields } from "@/features/parts/lib/part-property-meta";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import type { CreatePartRequestDto } from "@/features/parts/api/parts.types";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { usePropertyMetaQuery } from "@/features/properties/hooks/use-property-meta-query";
import { toast } from "sonner";
import { useNumberingCategoriesQuery } from "@/features/part-number-categories/hooks/use-numbering-categories-query";
import { useNextNumberQuery } from "@/features/part-number-categories/hooks/use-next-number-query";
import { useCheckNumberQuery } from "@/features/part-number-categories/hooks/use-check-number-query";
import { useCreateNumberingCategoryAction } from "@/features/part-number-categories/hooks/use-create-numbering-category-action";
import { NumberingCategoryFormModal } from "@/features/part-number-categories/components/numbering-category-form-modal";
import { useAuthStore } from "@/features/auth";

type PartLifecycleState = NonNullable<CreatePartRequestDto["lifecycle_state"]>;

const DEFAULT_LIFECYCLE_OPTIONS: PartEditorScreenOption[] = Object.values(
  CreatePartRequestLifecycleState,
).map((value) => ({
  value,
  label: value,
}));

const DEFAULT_UNIT_OPTIONS: PartEditorScreenOption[] = [
  { value: "EA", label: "EA" },
  { value: "SET", label: "SET" },
  { value: "ASSY", label: "ASSY" },
  { value: "KG", label: "KG" },
  { value: "G", label: "G" },
  { value: "M", label: "M" },
  { value: "MM", label: "MM" },
];

const INITIAL_FORM_VALUES: PartEditorScreenFormValues = {
  category: null,
  description: "",
  isPhantom: false,
  leadTimeDays: "",
  lifecycleState: null,
  material: "",
  name: "",
  partNumber: "",
  revision: "",
  unit: "EA",
};

interface PartCreateScreenProps {
  onBack: () => void;
  onCreated: (part: PartDetailModel) => void;
}

function toOptions(values: string[]): PartEditorScreenOption[] {
  return values.map((value) => ({ value, label: value }));
}

function toCreatePartLifecycleState(
  value: string | null,
): CreatePartRequestDto["lifecycle_state"] | null {
  if (value == null) {
    return null;
  }

  const allowedValues = new Set<PartLifecycleState>(Object.values(CreatePartRequestLifecycleState));
  return allowedValues.has(value as PartLifecycleState)
    ? (value as PartLifecycleState)
    : null;
}

export function PartCreateScreen({ onBack, onCreated }: PartCreateScreenProps) {
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [extendedFields, setExtendedFields] = useState<PartEditorScreenExtendedField[]>([]);
  const filterOptionsQuery = usePartFilterOptionsQuery();
  const propertyMetaQuery = usePropertyMetaQuery("PART", false);
  const createPartAction = useCreatePartAction({
    onSuccess: onCreated,
  });

  // 채번 카테고리 관련 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [numberingMode, setNumberingMode] = useState<"manual" | "auto">("manual");
  const [partNumberForCheck, setPartNumberForCheck] = useState("");
  const [inlineModalOpen, setInlineModalOpen] = useState(false);

  // 채번 카테고리 쿼리 훅
  const categoriesQuery = useNumberingCategoriesQuery();
  const nextNumberQuery = useNextNumberQuery(
    numberingMode === "auto" ? selectedCategoryId : undefined,
  );
  const checkNumberQuery = useCheckNumberQuery(partNumberForCheck);

  // 인라인 카테고리 생성
  const inlineCreateAction = useCreateNumberingCategoryAction({
    onSuccess: (category) => {
      setSelectedCategoryId(category.id);
      setInlineModalOpen(false);
    },
  });

  // 관리자 여부 확인
  const currentMembership = useAuthStore((s) => s.currentMembership);
  const isAdmin = currentMembership?.role === "ADMIN" || currentMembership?.role === "OWNER";

  // 품번 중복 확인 결과 -> availability 상태
  const partNumberAvailability = (() => {
    if (!partNumberForCheck.trim()) return null;
    if (checkNumberQuery.isFetching) return "checking" as const;
    if (checkNumberQuery.data?.available === true) return "available" as const;
    if (checkNumberQuery.data?.available === false) return "taken" as const;
    return null;
  })();

  const categoryOptions = toOptions(filterOptionsQuery.data?.categories ?? []);
  const lifecycleOptions = filterOptionsQuery.data?.lifecycleStates?.length
    ? toOptions(filterOptionsQuery.data.lifecycleStates)
    : DEFAULT_LIFECYCLE_OPTIONS;
  const systemFields = buildPartSystemFields(propertyMetaQuery.data);

  useEffect(() => {
    const metas = propertyMetaQuery.data ?? [];

    setExtendedFields((currentFields) => {
      const currentFieldMap = new Map(currentFields.map((field) => [field.id, field.value]));

      return buildPartCustomPropertyFields(metas, {}).map((field) => ({
        ...field,
        value: currentFieldMap.get(field.id) ?? field.value,
      }));
    });
  }, [propertyMetaQuery.data]);

  const handlePartNumberBlur = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed) {
      setPartNumberForCheck(trimmed);
    }
  }, []);

  const handleNumberingCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleNumberingModeChange = useCallback((mode: "manual" | "auto") => {
    setNumberingMode(mode);
  }, []);

  // 채번 카테고리 목록을 PartEditorScreen에 전달할 형태로 변환
  const numberingCategories = (categoriesQuery.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    prefix: c.prefix,
    delimiter: c.delimiter,
    digits: c.digits,
    previewPartNumber: c.previewPartNumber,
  }));

  return (
    <>
      <PartEditorScreen
        backLabel="부품 목록"
        categoryOptions={categoryOptions}
        extendedFields={extendedFields}
        formValues={formValues}
        isSubmitting={createPartAction.isPending}
        lifecycleOptions={lifecycleOptions}
        mode="create"
        systemFields={systemFields}
        unitOptions={DEFAULT_UNIT_OPTIONS}
        // 채번 카테고리 props
        numberingCategories={numberingCategories}
        numberingCategoriesLoading={categoriesQuery.isLoading}
        selectedNumberingCategoryId={selectedCategoryId}
        nextPartNumber={nextNumberQuery.data?.partNumber ?? null}
        nextPartNumberLoading={nextNumberQuery.isFetching}
        nextPartNumberNote={nextNumberQuery.data?.note ?? null}
        partNumberAvailability={partNumberAvailability}
        isAdmin={isAdmin}
        onNumberingCategoryChange={handleNumberingCategoryChange}
        onPartNumberBlur={handlePartNumberBlur}
        onNumberingModeChange={handleNumberingModeChange}
        onInlineCreateCategory={() => setInlineModalOpen(true)}
        onBack={onBack}
        onChange={setFormValues}
        onExtendedFieldsChange={setExtendedFields}
        onSubmit={() => {
          try {
            createPartAction.mutate({
              category: formValues.category ?? "",
              description: formValues.description,
              extendedProperties: buildPartCustomPropertiesPayload(propertyMetaQuery.data ?? [], extendedFields),
              isPhantom: formValues.isPhantom,
              leadTimeDays: formValues.leadTimeDays,
              lifecycleState: toCreatePartLifecycleState(formValues.lifecycleState),
              material: formValues.material,
              name: formValues.name,
              // 자동 채번 모드에서는 numberingCategoryId를 전달하고 partNumber는 생략
              ...(numberingMode === "auto" && selectedCategoryId
                ? { numberingCategoryId: selectedCategoryId }
                : { partNumber: formValues.partNumber }),
              unit: formValues.unit ?? "",
            });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "확장 속성 값을 확인해 주세요.");
          }
        }}
      />

      {/* 인라인 채번 카테고리 생성 모달 */}
      <NumberingCategoryFormModal
        open={inlineModalOpen}
        isPending={inlineCreateAction.isPending}
        onClose={() => setInlineModalOpen(false)}
        onSubmit={(values) => inlineCreateAction.mutate(values)}
      />
    </>
  );
}
