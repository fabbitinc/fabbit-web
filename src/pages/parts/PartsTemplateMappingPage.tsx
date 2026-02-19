import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMappingStore, useUploadStore } from "@/stores/onboarding";
import { confirmMapping, listMappings, updateMapping } from "@/api/onboarding";
import type { MappingResponse } from "@/api/types/onboarding";
import { extractApiErrorMessage } from "@/features/onboarding/utils/mappingUtils";
import { useMappingDerivedState } from "@/features/onboarding/hooks/useMappingDerivedState";
import { useMappingActions } from "@/features/onboarding/hooks/useMappingActions";
import { KanbanBoard } from "@/features/onboarding/components/kanban/KanbanBoard";
import { cn } from "@/lib/utils";
import "@/pages/parts/parts-template-mapping.css";

interface LocationState {
  fileName?: string;
}

export function PartsTemplateMappingPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const location = useLocation();
  const { fileName } = (location.state as LocationState | null) ?? {};

  const defaultMappingName = partNumber ? "부품 상세 템플릿" : "부품 마스터 템플릿";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [mappingList, setMappingList] = useState<MappingResponse[]>([]);

  const setStep = useMappingStore((s) => s.setStep);
  const getMappingResult = useMappingStore((s) => s.getMappingResult);
  const setMappingId = useMappingStore((s) => s.setMappingId);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);

  const derived = useMappingDerivedState();
  const {
    hasMappings,
    hasUnselectedMappings,
    hasRequiredPartMergeKeys,
    hasRelationMergeKeyIssues,
    blockingIssueCount,
  } = derived;
  const { handleResetMappings } = useMappingActions(
    derived.relationTargetInfoByType,
  );

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  useEffect(() => {
    if (!isSaveDialogOpen) return;

    let cancelled = false;
    setIsLoadingMappings(true);

    listMappings()
      .then((response) => {
        if (cancelled) return;

        const items = response.items || [];
        setMappingList(items);

      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(extractApiErrorMessage(err, "매핑 목록을 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMappings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSaveDialogOpen]);

  const handleOpenSaveDialog = () => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return;
    }

    if (!hasRequiredPartMergeKeys) {
      toast.error("부품의 필수 매칭키가 모두 지정되어야 합니다.");
      return;
    }

    if (hasRelationMergeKeyIssues) {
      toast.error("각 섹션에서 기본 속성을 사용한 경우 매칭키를 지정해야 합니다.");
      return;
    }

    if (hasUnselectedMappings) {
      toast.error(
        "속성을 선택하지 않은 카드가 있습니다. 모든 카드의 속성을 선택해주세요.",
      );
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const handleConfirm = async (payload: {
    saveMode: "existing" | "new";
    selectedMappingId: string;
    mappingName: string;
    duplicateNameExists: boolean;
  }) => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return;
    }

    let finalName = "";
    let selectedMappingId = "";
    if (payload.saveMode === "existing") {
      if (!payload.selectedMappingId) {
        toast.error("업데이트할 기존 매핑을 선택해주세요.");
        return;
      }
      const selected = mappingList.find((item) => item.id === payload.selectedMappingId);
      if (!selected) {
        toast.error("선택한 기존 매핑 정보를 찾을 수 없습니다.");
        return;
      }
      finalName = selected.name;
      selectedMappingId = selected.id;
    } else {
      finalName = payload.mappingName.trim();
      if (!finalName) {
        toast.error("매핑 이름을 입력해주세요.");
        return;
      }
      if (payload.duplicateNameExists) {
        toast.error("동일한 이름의 매핑이 이미 존재합니다.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const draftMapping = getMappingResult();
      // TODO: validate API 임시 비활성화
      // const validation = await validateMapping({ upload_id: primaryUploadId, mapping: draftMapping });
      // const normalizedMapping = validation.normalized_mapping || draftMapping;
      const normalizedMapping = draftMapping;

      const response =
        payload.saveMode === "existing"
          ? await updateMapping(selectedMappingId, {
              upload_id: primaryUploadId,
              mapping: normalizedMapping,
            })
          : await confirmMapping({
              upload_id: primaryUploadId,
              name: finalName,
              mapping: normalizedMapping,
            });
      setMappingId(response.id);

      toast.success(
        payload.saveMode === "existing"
          ? "기존 매핑이 업데이트되었습니다"
          : "매핑이 확정되었습니다",
      );
      setIsSaveDialogOpen(false);
      navigate(partNumber ? `/parts/${partNumber}` : "/parts");
    } catch (err) {
      console.error("Mapping confirmation failed:", err);
      toast.error(extractApiErrorMessage(err, "매핑 확정에 실패했습니다"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDisabledReason = !hasMappings
    ? "매핑된 카드가 없습니다."
    : `${blockingIssueCount}개 미완료`;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        {/* 헤더 */}
        <div className="rounded-lg border bg-card px-6 py-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">매핑 확인</h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={handleResetMappings}
            >
              <RotateCcw className="size-3.5" />
              초기화
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {fileName
              ? `${fileName} 분석 결과를 검토하고 최종 매핑을 확정하세요.`
              : "분석 결과를 검토하고 최종 매핑을 확정하세요."}
          </p>
        </div>

        {/* 칸반보드 (요약바 포함) */}
        <KanbanBoard />

        {/* 확정 버튼 */}
        <div className="flex items-center justify-end">
          {(!hasMappings || hasUnselectedMappings || !hasRequiredPartMergeKeys || hasRelationMergeKeyIssues) && !isSubmitting ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    disabled
                    onClick={handleOpenSaveDialog}
                  >
                    최종 승인 완료
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                hideArrow
                className="max-w-[320px] rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white"
              >
                {confirmDisabledReason}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              disabled={isSubmitting}
              onClick={handleOpenSaveDialog}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  확정 중...
                </>
              ) : (
                "최종 승인 완료"
              )}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <MappingSaveDialog
          open={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          isLoadingMappings={isLoadingMappings}
          isSubmitting={isSubmitting}
          mappings={mappingList}
          defaultMappingName={defaultMappingName}
          onConfirm={handleConfirm}
        />
      </Dialog>
    </div>
  );
}

function MappingSaveDialog({
  open,
  onOpenChange,
  isLoadingMappings,
  isSubmitting,
  mappings,
  defaultMappingName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoadingMappings: boolean;
  isSubmitting: boolean;
  mappings: MappingResponse[];
  defaultMappingName: string;
  onConfirm: (payload: {
    saveMode: "existing" | "new";
    selectedMappingId: string;
    mappingName: string;
    duplicateNameExists: boolean;
  }) => void;
}) {
  const hasMappingsInList = mappings.length > 0;
  const [saveMode, setSaveMode] = useState<"existing" | "new">("new");
  const [selectedMappingId, setSelectedMappingId] = useState("");
  const [mappingName, setMappingName] = useState("");

  useEffect(() => {
    if (!open) return;

    if (hasMappingsInList) {
      setSaveMode("existing");
      setSelectedMappingId(mappings[0].id);
      setMappingName(mappings[0].name);
    } else {
      setSaveMode("new");
      setSelectedMappingId("");
      setMappingName(defaultMappingName);
    }
  }, [open, hasMappingsInList, mappings, defaultMappingName]);

  const existingNameSet = useMemo(
    () => new Set(mappings.map((item) => item.name.trim().toLowerCase())),
    [mappings],
  );

  const duplicateNameExists = useMemo(() => {
    if (saveMode !== "new") return false;
    const normalizedName = mappingName.trim().toLowerCase();
    if (!normalizedName) return false;
    return existingNameSet.has(normalizedName);
  }, [saveMode, mappingName, existingNameSet]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>매핑 저장 방식 선택</DialogTitle>
        <DialogDescription>
          기존 매핑을 업데이트하거나 새 매핑을 생성할 수 있습니다.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!hasMappingsInList}
            onClick={() => setSaveMode("existing")}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              saveMode === "existing"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
              !hasMappingsInList && "cursor-not-allowed opacity-50",
            )}
          >
            기존 매핑 업데이트
          </button>
          <button
            type="button"
            onClick={() => setSaveMode("new")}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              saveMode === "new"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50",
            )}
          >
            신규 매핑 생성
          </button>
        </div>

        {saveMode === "existing" && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">기존 매핑</p>
            <Select
              value={selectedMappingId}
              onValueChange={setSelectedMappingId}
              disabled={isLoadingMappings || !hasMappingsInList}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="업데이트할 매핑을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {mappings.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {saveMode === "new" && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">매핑 이름</p>
            <Input
              value={mappingName}
              onChange={(e) => setMappingName(e.target.value)}
              placeholder="매핑 이름을 입력하세요"
              disabled={isLoadingMappings}
            />
            {duplicateNameExists && (
              <p className="text-xs text-red-600">동일한 이름은 사용할 수 없습니다.</p>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          onClick={() =>
            onConfirm({ saveMode, selectedMappingId, mappingName, duplicateNameExists })
          }
          disabled={
            isLoadingMappings ||
            isSubmitting ||
            (saveMode === "new" && (!mappingName.trim() || duplicateNameExists)) ||
            (saveMode === "existing" && !selectedMappingId)
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "확인"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
