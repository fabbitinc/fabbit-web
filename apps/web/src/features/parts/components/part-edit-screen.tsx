import { useEffect, useRef, useState } from "react";
import {
  PartEditorScreen,
  type PartEditorScreenDrawingSummary,
  type PartEditorScreenExtendedField,
  type PartEditorScreenFormValues,
  type PartEditorScreenOption,
  type PartDrawingPreviewDrawing,
} from "@fabbit/components";
import { CreatePartRequestLifecycleState } from "@/api/generated/orval/model/createPartRequestLifecycleState";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { useUpdatePartDraftAction } from "@/features/parts/hooks/use-update-part-draft-action";
import { buildPartCustomPropertyFields, buildPartCustomPropertiesPayload } from "@/features/parts/lib/part-custom-properties";
import { buildPartSystemFields } from "@/features/parts/lib/part-property-meta";
import { openPartDrawingViewer } from "@/features/parts/lib/open-part-drawing-viewer";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { usePropertyMetaQuery } from "@/features/properties/hooks/use-property-meta-query";
import { toast } from "sonner";

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

const EMPTY_FORM_VALUES: PartEditorScreenFormValues = {
  description: "",
  itemType: "MANUFACTURED",
  leadTimeDays: "",
  lifecycleState: null,
  material: "",
  name: "",
  partNumber: "",
  revision: "",
  unit: null,
};

interface PartEditScreenProps {
  onBack: () => void;
  onSaved: (part: PartDetailModel) => void;
  partId: string;
  revisionId: string;
}

function toOptions(values: string[]): PartEditorScreenOption[] {
  return values.map((value) => ({ value, label: value }));
}

function toPartEditorFormValues(part: PartDetailModel): PartEditorScreenFormValues {
  return {
    description: part.description ?? "",
    itemType: part.isPhantom ? "PHANTOM" : "MANUFACTURED",
    leadTimeDays: part.leadTimeDays != null ? String(part.leadTimeDays) : "",
    lifecycleState: part.lifecycleState,
    material: part.material ?? "",
    name: part.name ?? "",
    partNumber: part.partNumber,
    revision: part.revision,
    unit: part.unit,
  };
}

function toDrawingSummary(
  drawing: PartDetailModel["drawing"],
): PartEditorScreenDrawingSummary | null {
  if (!drawing) {
    return null;
  }

  return {
    drawingNumber: drawing.drawingNumber,
    name: drawing.name,
    revision: drawing.version,
    version: drawing.version,
    status: drawing.status,
    conversionStatus: drawing.conversionStatus,
    viewerType: drawing.viewerType,
    viewerUrl: drawing.viewerUrl,
    previewUrl: drawing.previewUrl,
    originalFileUrl: drawing.originalFileUrl,
    failureMessage: drawing.failureMessage,
    webViewRequirement: drawing.webViewRequirement,
  };
}

export function PartEditScreen({ onBack, onSaved, partId, revisionId }: PartEditScreenProps) {
  const partQuery = usePartDetailQuery(partId, revisionId);
  const filterOptionsQuery = usePartFilterOptionsQuery();
  const propertyMetaQuery = usePropertyMetaQuery("PART", false);
  const updatePartDraftAction = useUpdatePartDraftAction(partId, revisionId, {
    onSuccess: onSaved,
  });
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const [extendedFields, setExtendedFields] = useState<PartEditorScreenExtendedField[]>([]);
  const initializedRevisionIdRef = useRef<string | null>(null);
  const initializedExtendedFieldsRevisionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!partQuery.data) {
      return;
    }

    if (initializedRevisionIdRef.current === revisionId) {
      return;
    }

    initializedRevisionIdRef.current = revisionId;
    setFormValues(toPartEditorFormValues(partQuery.data));
  }, [partQuery.data, revisionId]);

  useEffect(() => {
    if (!partQuery.data || !propertyMetaQuery.data) {
      return;
    }

    const nextFields = buildPartCustomPropertyFields(
      propertyMetaQuery.data,
      partQuery.data.extendedProperties,
    );

    if (initializedExtendedFieldsRevisionIdRef.current !== revisionId) {
      initializedExtendedFieldsRevisionIdRef.current = revisionId;
      setExtendedFields(nextFields);
      return;
    }

    setExtendedFields((currentFields) => {
      const currentFieldMap = new Map(currentFields.map((field) => [field.id, field.value]));

      return nextFields.map((field) => ({
        ...field,
        value: currentFieldMap.get(field.id) ?? field.value,
      }));
    });
  }, [partQuery.data, propertyMetaQuery.data, revisionId]);

  const lifecycleOptions = filterOptionsQuery.data?.lifecycleStates?.length
    ? toOptions(filterOptionsQuery.data.lifecycleStates)
    : DEFAULT_LIFECYCLE_OPTIONS;
  const systemFields = buildPartSystemFields(propertyMetaQuery.data);

  if (partQuery.isLoading && !partQuery.data) {
    return null;
  }

  if (partQuery.isError || !partQuery.data) {
    return null;
  }

  const part = partQuery.data;

  function handleOpenDrawingViewer(
    drawing: PartDrawingPreviewDrawing,
  ) {
    const title =
      part.name?.trim() ||
      part.partNumber ||
      drawing.drawingNumber ||
      drawing.name ||
      (drawing.viewerType === "PDF" ? "2D 도면" : "3D 모델");

    openPartDrawingViewer({
      category: part.category,
      description: part.description,
      drawing,
      partNumber: part.partNumber,
      revision: part.revision,
      title,
    });
  }

  return (
    <PartEditorScreen
      backLabel="부품 상세"
      drawing={toDrawingSummary(part.drawing)}
      extendedFields={extendedFields}
      formValues={formValues}
      heading="부품 편집"
      isSubmitting={updatePartDraftAction.isPending}
      lifecycleOptions={lifecycleOptions}
      lockedFields={{
        lifecycleState: true,
        partNumber: true,
        revision: true,
      }}
      mode="edit"
      submitLabel="저장"
      systemFields={systemFields}
      unitOptions={DEFAULT_UNIT_OPTIONS}
      onBack={onBack}
      onChange={setFormValues}
      onExtendedFieldsChange={setExtendedFields}
      onOpenDrawingViewer={handleOpenDrawingViewer}
      onSubmit={() =>
        {
          try {
            updatePartDraftAction.mutate({
              description: formValues.description,
              extendedProperties: buildPartCustomPropertiesPayload(propertyMetaQuery.data ?? [], extendedFields),
              leadTimeDays: formValues.leadTimeDays,
              material: formValues.material,
              name: formValues.name,
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
