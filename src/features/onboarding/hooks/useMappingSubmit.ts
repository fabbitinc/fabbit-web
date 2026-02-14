import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMappingStore, useUploadStore, useProcessingStore } from "@/stores/onboarding";
import { confirmMapping, validateMapping, startSynthesis } from "@/api/onboarding";
import { extractApiErrorMessage } from "@/features/onboarding/utils/mappingUtils";

/**
 * 매핑 확정 + 페이지 이동
 */
export function useMappingSubmit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmedMappingRef = useRef<{ id: string; signature: string } | null>(null);

  const getMappingResult = useMappingStore((s) => s.getMappingResult);
  const setMappingId = useMappingStore((s) => s.setMappingId);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);
  const setSynthesisJob = useProcessingStore((s) => s.setSynthesisJob);

  const handleSubmit = async () => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const draftMapping = getMappingResult();
      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: draftMapping,
      });
      const validationErrors = validation.errors || [];
      const validationWarnings = validation.warnings || [];

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0].message || "매핑 검증에 실패했습니다.");
        return;
      }

      if (validationWarnings.length > 0) {
        toast.warning(validationWarnings[0].message || "매핑 검증 경고가 있습니다.");
      }

      const normalizedMapping = validation.normalized_mapping || draftMapping;

      // 매핑 확정
      const mappingSignature = JSON.stringify(normalizedMapping);
      let confirmedMappingId =
        confirmedMappingRef.current?.signature === mappingSignature
          ? confirmedMappingRef.current.id
          : null;

      if (!confirmedMappingId) {
        const confirmResponse = await confirmMapping({
          upload_id: primaryUploadId,
          name: `mapping-${Date.now()}`,
          mapping: normalizedMapping,
        });
        confirmedMappingId = confirmResponse.id;
        confirmedMappingRef.current = {
          id: confirmResponse.id,
          signature: mappingSignature,
        };
        setMappingId(confirmResponse.id);
      }

      // 합성 시작
      const synthesisJob = await startSynthesis({ mapping_id: confirmedMappingId });
      setSynthesisJob(synthesisJob);

      toast.success("매핑이 확정되었습니다");
      navigate("/onboarding/explore");
    } catch (err) {
      console.error("Mapping confirmation failed:", err);
      toast.error(extractApiErrorMessage(err, "매핑 확정에 실패했습니다"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
}
