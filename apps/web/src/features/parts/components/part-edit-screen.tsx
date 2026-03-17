import { useEffect, useRef, useState } from "react";
import {
  PartEditorScreen,
  type PartEditorScreenDrawingSummary,
  type PartEditorScreenFormValues,
  type PartEditorScreenOption,
  type PartDrawingPreviewDrawing,
} from "@fabbit/components";
import { CreatePartRequestLifecycleState } from "@/api/generated/orval/model/createPartRequestLifecycleState";
import { usePartFilterOptionsQuery } from "@/features/parts/hooks/use-part-filter-options-query";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { useUpdatePartDraftAction } from "@/features/parts/hooks/use-update-part-draft-action";
import { openPartDrawingViewer } from "@/features/parts/lib/open-part-drawing-viewer";
import type { PartDetailModel } from "@/features/parts/types/parts-model";

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
  category: null,
  description: "",
  isPhantom: false,
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
}

function toOptions(values: string[]): PartEditorScreenOption[] {
  return values.map((value) => ({ value, label: value }));
}

function toPartEditorFormValues(part: PartDetailModel): PartEditorScreenFormValues {
  return {
    category: part.category,
    description: part.description ?? "",
    isPhantom: part.isPhantom ?? false,
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

export function PartEditScreen({ onBack, onSaved, partId }: PartEditScreenProps) {
  const partQuery = usePartDetailQuery(partId);
  const filterOptionsQuery = usePartFilterOptionsQuery();
  const updatePartDraftAction = useUpdatePartDraftAction(partId, {
    onSuccess: onSaved,
  });
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES);
  const initializedPartIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!partQuery.data) {
      return;
    }

    if (initializedPartIdRef.current === partId) {
      return;
    }

    initializedPartIdRef.current = partId;
    setFormValues(toPartEditorFormValues(partQuery.data));
  }, [partId, partQuery.data]);

  const categoryOptions = toOptions(filterOptionsQuery.data?.categories ?? []);
  const lifecycleOptions = filterOptionsQuery.data?.lifecycleStates?.length
    ? toOptions(filterOptionsQuery.data.lifecycleStates)
    : DEFAULT_LIFECYCLE_OPTIONS;

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
      categoryOptions={categoryOptions}
      drawing={toDrawingSummary(part.drawing)}
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
      unitOptions={DEFAULT_UNIT_OPTIONS}
      onBack={onBack}
      onChange={setFormValues}
      onOpenDrawingViewer={handleOpenDrawingViewer}
      onSubmit={() =>
        updatePartDraftAction.mutate({
          category: formValues.category ?? "",
          description: formValues.description,
          isPhantom: formValues.isPhantom,
          leadTimeDays: formValues.leadTimeDays,
          material: formValues.material,
          name: formValues.name,
          unit: formValues.unit ?? "",
        })
      }
    />
  );
}
