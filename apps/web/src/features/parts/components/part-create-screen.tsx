import { useEffect, useState } from "react";
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

  return (
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
      onBack={onBack}
      onChange={setFormValues}
      onExtendedFieldsChange={setExtendedFields}
      onSubmit={() =>
        {
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
              partNumber: formValues.partNumber,
              unit: formValues.unit ?? "",
            });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "확장 속성 값을 확인해 주세요.");
          }
        }
      }
    />
  );
}
