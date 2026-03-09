import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { josa } from "es-hangul";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { SynthesisProgressPanel } from "@fabbit/components";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@fabbit/ui";
import { useNavigate } from "react-router-dom";
import { PartsUploadNodeSearchInput } from "@/features/parts/components/parts-upload-node-search-input";
import { usePartsUploadBatchCompletionListener } from "@/features/parts/hooks/use-parts-upload-batch-completion-listener";
import { usePartsUploadBatchQuery } from "@/features/parts/hooks/use-parts-upload-batch-query";
import { usePartsUploadTemplateMappingListQuery } from "@/features/parts/hooks/use-parts-upload-template-mapping-list-query";
import { useSubmitPartsUploadAction } from "@/features/parts/hooks/use-submit-parts-upload-action";
import { usePartsUploadStore } from "@/features/parts/stores/parts-upload-store";
import type { PartsUploadBatchSessionModel, PartsUploadFileModel } from "@/features/parts/types/parts-upload-model";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UPLOAD_ACCEPT = ".xlsx,.xls,.csv";
const ROOT_CONTEXT_HINTS: Record<string, string> = {
  Part: "품번을 입력해 주세요.",
  Supplier: "업체명을 입력해 주세요.",
  Drawing: "도면번호를 입력해 주세요.",
  Project: "프로젝트 코드를 입력해 주세요.",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSupportedFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return UPLOAD_ACCEPT.split(",").includes(extension);
}

async function parseFileHeaders(file: File): Promise<string[]> {
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  const workbook = isCsv
    ? XLSX.read(await file.text(), { type: "string", sheetRows: 1 })
    : XLSX.read(await file.arrayBuffer(), { type: "array", sheetRows: 1 });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    rawNumbers: false,
  });

  return (rows[0] ?? []).map((header) => String(header ?? "").trim()).filter(Boolean);
}

function validateHeaders(fileHeaders: string[], mappedHeaders: string[]) {
  const normalizedHeaders = new Set(fileHeaders.map((header) => header.toLowerCase().trim()));
  const missing = mappedHeaders.filter((header) => !normalizedHeaders.has(header.toLowerCase().trim()));

  return {
    valid: missing.length === 0,
    missing,
  };
}

function formatMissingHeaderMessage(missingHeaders: string[]) {
  const preview = missingHeaders.slice(0, 3).join(", ");
  const suffix = missingHeaders.length > 3 ? ` 외 ${missingHeaders.length - 3}개` : "";
  return `필수 컬럼 누락: ${preview}${suffix}`;
}

function getRootLabelName(label: string) {
  const names: Record<string, string> = {
    Part: "부품",
    Supplier: "공급사",
    Drawing: "도면",
    Project: "프로젝트",
  };

  return names[label] ?? label;
}

function ExtraColumnsNotice({ columns }: { columns: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 text-left"
        onClick={() => setIsExpanded((previous) => !previous)}
      >
        <AlertTriangle className="size-4 shrink-0 text-amber-600" />
        <span className="flex-1 text-xs font-medium text-amber-700">미반영 컬럼 {columns.length}개</span>
        {isExpanded ? <ChevronUp className="size-4 shrink-0 text-amber-600" /> : <ChevronDown className="size-4 shrink-0 text-amber-600" />}
      </button>

      {isExpanded ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {columns.map((column) => (
            <span key={column} className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] text-amber-700">
              {column}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PartsUploadDialog() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stagedFilesRef = useRef<PartsUploadFileModel[]>([]);
  const previousMappingIdRef = useRef<string | null>(null);

  const isOpen = usePartsUploadStore((state) => state.isOpen);
  const contextPartId = usePartsUploadStore((state) => state.contextPartId);
  const closeDialog = usePartsUploadStore((state) => state.closeDialog);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedMappingId, setSelectedMappingId] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<PartsUploadFileModel[]>([]);
  const [batchSession, setBatchSession] = useState<PartsUploadBatchSessionModel | null>(null);

  const mappingListQuery = usePartsUploadTemplateMappingListQuery(isOpen);
  const submitPartsUploadAction = useSubmitPartsUploadAction();
  const batchStatusQuery = usePartsUploadBatchQuery(batchSession?.batchId ?? null);
  const { resetHandledBatchId } = usePartsUploadBatchCompletionListener({
    batchSession,
    batchStatus: batchStatusQuery.data,
    contextPartId,
  });

  const sortedMappings = useMemo(() => {
    return [...(mappingListQuery.data ?? [])].sort((left, right) => {
      const leftTime = Date.parse(left.createdAt);
      const rightTime = Date.parse(right.createdAt);

      if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
        return rightTime - leftTime;
      }

      return right.version - left.version;
    });
  }, [mappingListQuery.data]);

  const resolvedSelectedMappingId =
    selectedMappingId && sortedMappings.some((mapping) => mapping.id === selectedMappingId)
      ? selectedMappingId
      : sortedMappings[0]?.id ?? "";

  const selectedMapping = useMemo(
    () => sortedMappings.find((mapping) => mapping.id === resolvedSelectedMappingId) ?? sortedMappings[0] ?? null,
    [resolvedSelectedMappingId, sortedMappings],
  );

  const requiredRootLabels = useMemo(() => {
    if (!selectedMapping || selectedMapping.scope.toUpperCase() !== "ROOT_BOM") {
      return [];
    }

    return selectedMapping.mapping.relationMappings
      .filter((relation) => Object.keys(relation.nodeColumns).length === 0)
      .map((relation) => relation.targetLabel)
      .filter((label, index, labels) => labels.indexOf(label) === index);
  }, [selectedMapping]);

  const rootLabelRelationColumns = useMemo(() => {
    if (!selectedMapping || requiredRootLabels.length === 0) {
      return {} as Record<string, string[]>;
    }

    const relationColumns: Record<string, string[]> = {};

    for (const relation of selectedMapping.mapping.relationMappings) {
      if (Object.keys(relation.nodeColumns).length > 0) {
        continue;
      }

      const columns = Object.values(relation.relColumns);

      if (columns.length > 0) {
        relationColumns[relation.targetLabel] = [...(relationColumns[relation.targetLabel] ?? []), ...columns];
      }
    }

    return relationColumns;
  }, [requiredRootLabels.length, selectedMapping]);

  const rootContextColumns = useMemo(() => {
    const columns = new Set<string>();

    for (const values of Object.values(rootLabelRelationColumns)) {
      for (const value of values) {
        columns.add(value);
      }
    }

    return columns;
  }, [rootLabelRelationColumns]);

  const completedFiles = stagedFiles.filter((file) => file.status === "completed");
  const failedFiles = stagedFiles.filter((file) => file.status === "failed");
  const allSettled =
    stagedFiles.length > 0 &&
    stagedFiles.every((file) => file.status === "completed" || file.status === "failed");
  const isSynthesisProcessing =
    batchSession !== null &&
    (!batchStatusQuery.data ||
      batchStatusQuery.data.pendingCount > 0 ||
      batchStatusQuery.data.processingCount > 0);
  const isBusy =
    submitPartsUploadAction.isPending ||
    isSynthesisProcessing ||
    stagedFiles.some((file) => file.status === "validating");
  const canSubmit =
    Boolean(selectedMapping) &&
    completedFiles.length > 0 &&
    failedFiles.length === 0 &&
    allSettled &&
    (requiredRootLabels.length === 0 ||
      completedFiles.every((file) =>
        requiredRootLabels.every((label) => Boolean(file.rootContext?.[label]?.trim())),
      ));

  const updateStagedFile = useCallback((fileId: string, updater: Partial<PartsUploadFileModel>) => {
    setStagedFiles((previous) =>
      previous.map((file) => (file.id === fileId ? { ...file, ...updater } : file)),
    );
  }, []);

  useEffect(() => {
    stagedFilesRef.current = stagedFiles;
  }, [stagedFiles]);

  useEffect(() => {
    if (!selectedMapping) {
      previousMappingIdRef.current = null;
      return;
    }

    const previousMappingId = previousMappingIdRef.current;
    previousMappingIdRef.current = selectedMapping.id;

    if (!previousMappingId || previousMappingId === selectedMapping.id || stagedFilesRef.current.length === 0) {
      return;
    }

    void revalidateFiles(stagedFilesRef.current, selectedMapping.mappedHeaders, updateStagedFile);
  }, [selectedMapping, updateStagedFile]);

  async function handleFiles(nextFiles: File[]) {
    if (!selectedMapping || nextFiles.length === 0) {
      return;
    }

    const supportedFiles = nextFiles.filter(isSupportedFile);

    if (supportedFiles.length !== nextFiles.length) {
      toast.warning("지원하지 않는 파일 형식은 제외했습니다.");
    }

    if (supportedFiles.length === 0) {
      return;
    }

    const entries = supportedFiles.map<PartsUploadFileModel>((file) => ({
      id: `parts-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      file,
      status: "validating",
    }));

    setStagedFiles((previous) => [...previous, ...entries]);

    await revalidateFiles(entries, selectedMapping.mappedHeaders, updateStagedFile);
  }

  function removeFile(fileId: string) {
    setStagedFiles((previous) => previous.filter((file) => file.id !== fileId));
  }

  function resetDialog() {
    setSelectedMappingId("");
    setOverwrite(false);
    setStagedFiles([]);
    setBatchSession(null);
    resetHandledBatchId();
    previousMappingIdRef.current = null;
  }

  function handleClose() {
    if (isBusy) {
      return;
    }

    resetDialog();
    closeDialog();
  }

  async function handleSubmit() {
    if (!selectedMapping || !canSubmit) {
      return;
    }

    const result = await submitPartsUploadAction.mutateAsync({
      mappingId: selectedMapping.id,
      overwrite,
      files: completedFiles,
    });

    setBatchSession(result);
  }

  function handleMoveToTemplate() {
    handleClose();
    navigate(contextPartId ? `/parts/${contextPartId}/templates` : "/parts/templates");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{batchSession ? "데이터 처리" : "부품 업로드"}</DialogTitle>
          <DialogDescription>
            {batchSession
              ? "업로드한 파일의 부품/BOM 반영 상태를 확인합니다."
              : "매핑을 선택하고 Excel 또는 CSV 파일을 업로드하세요."}
          </DialogDescription>
        </DialogHeader>

        {batchSession ? (
          <SynthesisProgressPanel batchStatus={batchStatusQuery.data ?? null} fileNames={batchSession.fileNames} />
        ) : mappingListQuery.isLoading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            매핑 목록을 불러오는 중입니다.
          </div>
        ) : mappingListQuery.isError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-5">
            <p className="text-sm font-medium text-foreground">매핑 목록을 불러오지 못했습니다.</p>
            <p className="mt-1 text-sm text-muted-foreground">잠시 후 다시 시도하거나 속성 분석 화면에서 매핑을 다시 생성해 주세요.</p>
            <div className="mt-4 flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => void mappingListQuery.refetch()}>
                다시 시도
              </Button>
              <Button type="button" onClick={handleMoveToTemplate}>
                <Sparkles className="size-4" />
                속성 분석으로 이동
              </Button>
            </div>
          </div>
        ) : !selectedMapping ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-5">
            <p className="text-sm font-medium text-foreground">사용 가능한 매핑이 없습니다.</p>
            <p className="mt-1 text-sm text-muted-foreground">먼저 속성 분석에서 매핑을 생성한 뒤 다시 시도해 주세요.</p>
            <div className="mt-4">
              <Button type="button" onClick={handleMoveToTemplate}>
                <Sparkles className="size-4" />
                속성 분석으로 이동
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parts-upload-mapping">매핑 선택</Label>
              <Select value={resolvedSelectedMappingId} onValueChange={setSelectedMappingId}>
                <SelectTrigger id="parts-upload-mapping">
                  <SelectValue placeholder="매핑을 선택해 주세요." />
                </SelectTrigger>
                <SelectContent>
                  {sortedMappings.map((mapping) => (
                    <SelectItem key={mapping.id} value={mapping.id}>
                      {mapping.name} (v{mapping.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>필수 컬럼</Label>
              <div className="flex flex-wrap gap-2">
                {selectedMapping.mappedHeaders.map((header) => (
                  <span
                    key={header}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium",
                      rootContextColumns.has(header)
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                        : "border-border/70 bg-muted/40 text-foreground",
                    )}
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>

            {requiredRootLabels.length > 0 ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <p className="text-sm font-medium text-foreground">직접 지정이 필요한 연결 정보</p>
                <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {requiredRootLabels.map((label) => {
                    const targetName = getRootLabelName(label);
                    const columns = rootLabelRelationColumns[label];

                    return (
                      <p key={label}>
                        {columns && columns.length > 0
                          ? `'${columns.join("', '")}' 컬럼을 처리하려면 ${josa(targetName, "을/를")} 알아야 합니다.`
                          : `${targetName} 정보가 파일에 포함되어 있지 않습니다.`}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>파일 업로드</Label>
              <button
                type="button"
                className={cn(
                  "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                  isBusy
                    ? "cursor-not-allowed border-border bg-muted/20 opacity-70"
                    : isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-muted/20 hover:border-primary/40 hover:bg-primary/5",
                )}
                onClick={() => {
                  if (!isBusy) {
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  if (isBusy) {
                    return;
                  }

                  event.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(event) => {
                  if (isBusy) {
                    return;
                  }

                  event.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(event) => {
                  if (isBusy) {
                    return;
                  }

                  event.preventDefault();
                  setIsDragOver(false);
                  void handleFiles(Array.from(event.dataTransfer.files));
                }}
              >
                <input
                  ref={fileInputRef}
                  accept={UPLOAD_ACCEPT}
                  aria-label="부품 업로드 파일 선택"
                  className="hidden"
                  multiple
                  type="file"
                  onChange={(event) => {
                    const nextFiles = event.target.files ? Array.from(event.target.files) : [];
                    void handleFiles(nextFiles);
                    event.target.value = "";
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="size-5" />
                </div>
                <p className="mt-4 text-base font-medium text-foreground">파일을 드래그하거나 클릭해서 선택</p>
                <p className="mt-2 text-sm text-muted-foreground">Excel(.xlsx, .xls)과 CSV 파일을 여러 개 업로드할 수 있습니다.</p>
              </button>
            </div>

            {stagedFiles.length > 0 ? (
              <div className="space-y-2">
                <Label>업로드 대상 파일 ({completedFiles.length}/{stagedFiles.length})</Label>
                <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                  {stagedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "rounded-2xl border px-4 py-3",
                        file.status === "failed"
                          ? "border-destructive/30 bg-destructive/5"
                          : file.extraColumns && file.extraColumns.length > 0
                            ? "border-amber-500/30 bg-amber-500/5"
                            : "border-border/70 bg-background",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {file.status === "completed" ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        ) : file.status === "failed" ? (
                          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                        ) : (
                          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                {file.status === "validating" ? <span className="text-primary">검증 중</span> : null}
                              </div>
                            </div>

                            {file.status !== "validating" ? (
                              <Button
                                aria-label={`${file.name} 제거`}
                                className="shrink-0"
                                size="icon"
                                type="button"
                                variant="ghost"
                                onClick={() => removeFile(file.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            ) : null}
                          </div>

                          {file.status === "failed" && file.error ? (
                            <p className="mt-2 text-xs text-destructive">{file.error}</p>
                          ) : null}

                          {file.status !== "failed" && file.extraColumns && file.extraColumns.length > 0 ? (
                            <ExtraColumnsNotice columns={file.extraColumns} />
                          ) : null}
                        </div>
                      </div>

                      {file.status === "completed" && requiredRootLabels.length > 0 ? (
                        <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                          <p className="text-xs text-muted-foreground">이 파일의 데이터를 연결할 대상을 지정해 주세요.</p>
                          {requiredRootLabels.map((label) => (
                            <div key={`${file.id}-${label}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <span className="w-20 shrink-0 text-sm font-medium text-foreground">{getRootLabelName(label)}</span>
                              <PartsUploadNodeSearchInput
                                nodeLabel={label}
                                placeholder={ROOT_CONTEXT_HINTS[label] ?? "식별값을 입력해 주세요."}
                                value={file.rootContext?.[label] ?? ""}
                                onChange={(nextValue) => {
                                  updateStagedFile(file.id, {
                                    rootContext: {
                                      ...(file.rootContext ?? {}),
                                      [label]: nextValue,
                                    },
                                  });
                                }}
                              />
                              {completedFiles.length > 1 ? (
                                <Button
                                  disabled={!file.rootContext?.[label]?.trim()}
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    const rootValue = file.rootContext?.[label] ?? "";
                                    setStagedFiles((previous) =>
                                      previous.map((entry) =>
                                        entry.status === "completed"
                                          ? {
                                              ...entry,
                                              rootContext: {
                                                ...(entry.rootContext ?? {}),
                                                [label]: rootValue,
                                              },
                                            }
                                          : entry,
                                      ),
                                    );
                                  }}
                                >
                                  모두 적용
                                </Button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/70 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">기존 값 덮어쓰기</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {overwrite
                      ? "이미 등록된 부품이 있으면 엑셀 값으로 덮어씁니다."
                      : "이미 등록된 부품이 있으면 비어 있는 필드만 엑셀 값으로 채웁니다."}
                  </p>
                </div>
                <Switch checked={overwrite} onCheckedChange={setOverwrite} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {batchSession ? (
            <Button disabled={isSynthesisProcessing} type="button" variant="outline" onClick={handleClose}>
              닫기
            </Button>
          ) : (
            <>
              {failedFiles.length > 0 && allSettled ? (
                <p className="mr-auto text-xs text-destructive">업로드할 수 없는 파일을 제거한 뒤 다시 시도해 주세요.</p>
              ) : null}
              <Button disabled={isBusy} type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button disabled={!canSubmit || submitPartsUploadAction.isPending} type="button" onClick={() => void handleSubmit()}>
                {submitPartsUploadAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {submitPartsUploadAction.isPending ? "업로드 중..." : "업로드 실행"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

async function revalidateFiles(
  files: PartsUploadFileModel[],
  mappedHeaders: string[],
  updateFile: (fileId: string, updater: Partial<PartsUploadFileModel>) => void,
) {
  const normalizedHeaders = new Set(mappedHeaders.map((header) => header.toLowerCase().trim()));

  for (const file of files) {
    updateFile(file.id, {
      status: "validating",
      error: undefined,
      extraColumns: undefined,
    });

    try {
      const headers = await parseFileHeaders(file.file);

      if (headers.length === 0) {
        updateFile(file.id, {
          status: "failed",
          error: "파일에서 헤더를 찾을 수 없습니다.",
        });
        continue;
      }

      const validation = validateHeaders(headers, mappedHeaders);

      if (!validation.valid) {
        updateFile(file.id, {
          status: "failed",
          error: formatMissingHeaderMessage(validation.missing),
        });
        continue;
      }

      updateFile(file.id, {
        status: "completed",
        error: undefined,
        extraColumns: headers.filter((header) => !normalizedHeaders.has(header.toLowerCase().trim())),
      });
    } catch {
      updateFile(file.id, {
        status: "failed",
        error: "파일 헤더를 읽을 수 없습니다.",
      });
    }
  }
}
