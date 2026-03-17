import { useState } from "react";
import {
  PartEditorScreen,
  type PartEditorScreenFormValues,
  type PartEditorScreenOption,
} from "@fabbit/components";
import { CreatePartRequestLifecycleState } from "@/api/generated/orval/model/createPartRequestLifecycleState";
import { useCreatePartAction } from "@/features/parts/hooks/use-create-part-action";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import type { CreatePartRequestDto } from "@/features/parts/api/parts.types";
import type { PartDetailModel } from "@/features/parts/types/parts-model";

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
  const filterOptionsQuery = usePartFilterOptionsQuery();
  const createPartAction = useCreatePartAction({
    onSuccess: onCreated,
  });

  const categoryOptions = toOptions(filterOptionsQuery.data?.categories ?? []);
  const lifecycleOptions = filterOptionsQuery.data?.lifecycleStates?.length
    ? toOptions(filterOptionsQuery.data.lifecycleStates)
    : DEFAULT_LIFECYCLE_OPTIONS;

  return (
    <PartEditorScreen
      backLabel="부품 목록"
      categoryOptions={categoryOptions}
      formValues={formValues}
      isSubmitting={createPartAction.isPending}
      lifecycleOptions={lifecycleOptions}
      mode="create"
      unitOptions={DEFAULT_UNIT_OPTIONS}
      onBack={onBack}
      onChange={setFormValues}
      onSubmit={() =>
        createPartAction.mutate({
          category: formValues.category ?? "",
          description: formValues.description,
          isPhantom: formValues.isPhantom,
          leadTimeDays: formValues.leadTimeDays,
          lifecycleState: toCreatePartLifecycleState(formValues.lifecycleState),
          material: formValues.material,
          name: formValues.name,
          partNumber: formValues.partNumber,
          unit: formValues.unit ?? "",
        })
      }
    />
  );
}
