import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";

export function resetTemplateMappingFlow() {
  useTemplateUploadStore.getState().resetUploadState();
  usePartTemplateMappingStore.getState().resetTemplateMappingState();
}
