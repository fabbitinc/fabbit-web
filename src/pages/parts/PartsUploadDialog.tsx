import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { josa } from "es-hangul";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePartsUploadStore } from "@/stores/partsUploadStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  listMappings,
  createUpload,
  batchCreateUploads,
  completeUpload,
  batchCompleteUploads,
  startSynthesis,
  getSynthesisBatch,
  searchNodes,
} from "@/api/onboarding";
import { PARTS_QUERY_KEY, PART_FILTER_OPTIONS_QUERY_KEY } from "@/api/hooks/useParts";
import type {
  MappingResponse,
  NodeSearchItem,
  SynthesisBatchStatusResponse,
} from "@/api/types/onboarding";

const UPLOAD_ACCEPT = ".xlsx,.xls,.csv";

type FileStatus = "validating" | "uploading" | "completed" | "failed";

interface UploadFileEntry {
  id: string;
  name: string;
  size: number;
  status: FileStatus;
  progress: number;
  uploadId?: string;
  error?: string;
  rootContext?: Record<string, string>;
}

const MERGE_KEY_HINTS: Record<string, string> = {
  Part: "품번을 입력해 주세요.",
  Supplier: "업체명을 입력해 주세요.",
  Drawing: "도면번호를 입력해 주세요.",
  Project: "프로젝트코드를 입력해 주세요.",
};

// --- 노드 검색 입력 ---

function NodeSearchInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<NodeSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const doSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }
      timerRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const res = await searchNodes(label, query.trim());
          setResults(res.items);
          setOpen(true);
        } catch {
          setResults([]);
          setOpen(false);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    },
    [label],
  );

  useLayoutEffect(() => {
    if (!open || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open, results]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 드롭다운 열림 시: 드롭다운만 스크롤 허용, 나머지(파일 목록 등) 스크롤 비활성화
  useEffect(() => {
    if (!open) return;
    function handleWheel(e: WheelEvent) {
      if (dropdownRef.current?.contains(e.target as Node)) {
        e.stopPropagation();
        e.preventDefault();
        dropdownRef.current.querySelector("ul")?.scrollBy(0, e.deltaY);
        return;
      }
      e.preventDefault();
    }
    document.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });
    return () =>
      document.removeEventListener("wheel", handleWheel, { capture: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        className="h-7 text-xs"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          doSearch(e.target.value);
        }}
        onFocus={() => {
          if (value.trim() && results.length > 0) setOpen(true);
        }}
      />
      {isLoading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      )}
      {open &&
        value.trim() &&
        createPortal(
          <div
            ref={dropdownRef}
            className="pointer-events-auto fixed z-[9999] rounded-md border bg-popover shadow-md"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <ul className="max-h-[140px] overflow-y-auto overscroll-contain py-1">
              {results.map((item) => (
                <li key={item.value}>
                  <button
                    type="button"
                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    {item.label || item.value}
                    {item.label && item.value && item.label !== item.value && (
                      <span className="ml-1.5 text-muted-foreground">
                        {item.value}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {!isLoading &&
                !results.some((r) => r.value === value.trim()) && (
                  <>
                    {results.length > 0 && (
                      <li aria-hidden className="my-1 border-t" />
                    )}
                    <li>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onChange(value.trim());
                          setOpen(false);
                        }}
                      >
                        <Plus className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          <span className="font-medium text-foreground">
                            {value.trim()}
                          </span>{" "}
                          새로 추가
                        </span>
                      </button>
                    </li>
                  </>
                )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

// --- 유틸리티 ---

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isSupportedFile(file: File): boolean {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  return UPLOAD_ACCEPT.split(",").includes(ext);
}

/** 파일에서 헤더(첫 행)만 추출 — sheetRows:1 로 최소 파싱 */
async function parseFileHeaders(file: File): Promise<string[]> {
  const isCSV = file.name.toLowerCase().endsWith(".csv");
  let workbook: XLSX.WorkBook;

  if (isCSV) {
    const text = await file.text();
    workbook = XLSX.read(text, { type: "string", sheetRows: 1 });
  } else {
    const buf = await file.arrayBuffer();
    workbook = XLSX.read(buf, { type: "array", sheetRows: 1 });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    rawNumbers: false,
  });

  if (rows.length === 0) return [];

  return rows[0].map((h) => String(h ?? "").trim()).filter(Boolean);
}

/** mapped_headers가 파일 헤더에 모두 포함되는지 검증 (case-insensitive, 추가 컬럼은 허용) */
function validateHeaders(
  fileHeaders: string[],
  mappedHeaders: string[],
): { valid: boolean; missing: string[] } {
  const normalized = new Set(fileHeaders.map((h) => h.toLowerCase().trim()));
  const missing: string[] = [];

  for (const col of mappedHeaders) {
    if (!normalized.has(col.toLowerCase().trim())) {
      missing.push(col);
    }
  }

  return { valid: missing.length === 0, missing };
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

// --- 데이터 처리 진행 상태 ---

function normalizeStatus(status: string) {
  return status.toLowerCase();
}

function SynthesisProgress({
  batchStatus,
  fileNames,
}: {
  batchStatus: SynthesisBatchStatusResponse | null;
  fileNames: Map<string, string>;
}) {
  if (!batchStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          처리 상태를 불러오는 중…
        </span>
      </div>
    );
  }

  const {
    accepted_count,
    completed_count,
    failed_job_count,
    processing_count,
    pending_count,
    items,
    failed,
  } = batchStatus;
  const doneCount = completed_count + failed_job_count;
  const overallPercent =
    accepted_count > 0 ? Math.round((doneCount / accepted_count) * 100) : 0;
  const isDone = pending_count === 0 && processing_count === 0;

  return (
    <div className="space-y-4">
      {/* 전체 요약 */}
      <div className="rounded-md border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {isDone
              ? failed_job_count > 0
                ? "일부 파일 처리에 실패했어요"
                : "처리가 완료되었어요"
              : "데이터 처리 중…"}
          </span>
          {!isDone && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {/* 전체 진행률 바 */}
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isDone && failed_job_count > 0
                ? "bg-amber-500"
                : isDone
                  ? "bg-emerald-500"
                  : "bg-primary",
            )}
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        {/* 카운트 요약 */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            전체 {accepted_count}개 · 완료 {completed_count}개
            {failed_job_count > 0 && (
              <span className="text-red-600"> · 실패 {failed_job_count}개</span>
            )}
            {processing_count > 0 && ` · 처리 중 ${processing_count}개`}
            {pending_count > 0 && ` · 대기 ${pending_count}개`}
          </span>
        </div>
      </div>

      {/* 파일별 상태 목록 */}
      <div className="max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
        {items.map((item) => {
          const s = normalizeStatus(item.status);
          const fileName = fileNames.get(item.upload_id) ?? item.upload_id;
          const itemPercent =
            item.total_rows > 0
              ? Math.round((item.processed_rows / item.total_rows) * 100)
              : 0;

          return (
            <div
              key={item.job_id}
              className={cn(
                "rounded-md border px-3 py-2",
                s === "failed"
                  ? "border-red-500/20 bg-red-500/5"
                  : "bg-background",
              )}
            >
              <div className="flex items-center gap-3">
                {/* 상태 아이콘 */}
                {s === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : s === "failed" ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : s === "processing" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                )}

                {/* 파일명 + 상태 텍스트 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {fileName}
                  </p>
                </div>

                {/* 오른쪽 상태 뱃지 */}
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    s === "completed" && "text-emerald-600",
                    s === "failed" && "text-red-600",
                    s === "processing" && "text-primary",
                    s === "pending" && "text-muted-foreground",
                  )}
                >
                  {s === "completed" && "완료"}
                  {s === "failed" && "실패"}
                  {s === "processing" && `${itemPercent}%`}
                  {s === "pending" && "대기"}
                </span>
              </div>

              {/* 상세 정보 */}
              <div className="mt-1 pl-7">
                {s === "processing" && (
                  <>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${itemPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.processed_rows.toLocaleString()}/
                      {item.total_rows.toLocaleString()}행 처리됨
                    </p>
                  </>
                )}

                {s === "completed" && (
                  <p className="text-xs text-muted-foreground">
                    {item.total_rows.toLocaleString()}행 처리 완료
                  </p>
                )}

                {s === "failed" && (
                  <div className="text-xs">
                    <p className="text-red-600">
                      {item.processed_rows.toLocaleString()}/
                      {item.processed_rows.toLocaleString()}/
                      {item.total_rows.toLocaleString()}행 처리 중 오류{" "}
                      {item.error_count}건 발생
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 시작 실패 항목 */}
        {failed.map((f) => (
          <div
            key={f.upload_id}
            className="rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {fileNames.get(f.upload_id) ?? f.upload_id}
              </p>
              <span className="shrink-0 text-xs font-medium text-red-600">
                시작 실패
              </span>
            </div>
            <p className="mt-1 pl-7 text-xs text-red-600">{f.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 컴포넌트 ---

export function PartsUploadDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isOpen = usePartsUploadStore((s) => s.isOpen);
  const partNumber = usePartsUploadStore((s) => s.partNumber);
  const closeModal = usePartsUploadStore((s) => s.closeModal);

  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFileEntry[]>([]);
  const [mappingOptions, setMappingOptions] = useState<MappingResponse[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [synthesisState, setSynthesisState] = useState<{
    batchId: string;
    fileNames: Map<string, string>;
  } | null>(null);
  const [batchStatus, setBatchStatus] =
    useState<SynthesisBatchStatusResponse | null>(null);
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setIsLoadingMappings(true);

    listMappings()
      .then((response) => {
        if (cancelled) return;
        const items = [...(response.items || [])].sort((a, b) => {
          const aTime = Date.parse(a.created_at || "");
          const bTime = Date.parse(b.created_at || "");
          if (!Number.isNaN(aTime) && !Number.isNaN(bTime))
            return bTime - aTime;
          return b.version - a.version;
        });
        setMappingOptions(items);
        setSelectedTemplateId((prev) => {
          if (prev && items.some((item) => item.id === prev)) return prev;
          return items[0]?.id ?? "";
        });
      })
      .catch(() => {
        if (cancelled) return;
        setMappingOptions([]);
        setSelectedTemplateId("");
        toast.error("매핑 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMappings(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 데이터 처리 배치 상태 polling
  useEffect(() => {
    if (!synthesisState) return;

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const status = await getSynthesisBatch(synthesisState!.batchId);
        if (cancelled) return;
        setBatchStatus(status);

        const isDone =
          status.pending_count === 0 && status.processing_count === 0;
        if (isDone) {
          // 합성 완료 → 부품 목록 갱신
          void queryClient.invalidateQueries({ queryKey: [...PARTS_QUERY_KEY] });
          void queryClient.invalidateQueries({ queryKey: [...PART_FILTER_OPTIONS_QUERY_KEY] });
          return;
        }
      } catch (e) {
        console.error("Batch status poll failed:", e);
      }

      if (!cancelled) {
        timerId = setTimeout(poll, 2000);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [synthesisState]);

  const selectedTemplate =
    mappingOptions.find((m) => m.id === selectedTemplateId) ??
    mappingOptions[0];

  // ROOT_BOM scope일 때, node_columns가 비어있는 relation의 target_label 추출
  const requiredRootLabels = useMemo(() => {
    if (
      !selectedTemplate ||
      selectedTemplate.scope.toUpperCase() !== "ROOT_BOM"
    )
      return [];
    return selectedTemplate.mapping.relation_mappings
      .filter((rm) => Object.keys(rm.node_columns).length === 0)
      .map((rm) => rm.target_label)
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [selectedTemplate]);

  // 각 라벨별로 연결된 파일 컬럼명 (rel_columns의 키)
  const rootLabelRelColumns = useMemo(() => {
    if (!selectedTemplate || requiredRootLabels.length === 0)
      return {} as Record<string, string[]>;
    const map: Record<string, string[]> = {};
    for (const rm of selectedTemplate.mapping.relation_mappings) {
      if (Object.keys(rm.node_columns).length > 0) continue;
      const cols = Object.values(rm.rel_columns);
      if (cols.length > 0) {
        map[rm.target_label] = [...(map[rm.target_label] || []), ...cols];
      }
    }
    return map;
  }, [selectedTemplate, requiredRootLabels]);

  // root_context가 필요한 파일 컬럼명 Set (필요한 컬럼 뱃지 강조용)
  const rootContextColumns = useMemo(() => {
    const set = new Set<string>();
    for (const cols of Object.values(rootLabelRelColumns)) {
      for (const col of cols) set.add(col);
    }
    return set;
  }, [rootLabelRelColumns]);

  const isSynthesisProcessing =
    synthesisState !== null &&
    (batchStatus === null ||
      batchStatus.pending_count > 0 ||
      batchStatus.processing_count > 0);
  const isBusy =
    isSubmitting ||
    isSynthesisProcessing ||
    uploadedFiles.some(
      (f) => f.status === "validating" || f.status === "uploading",
    );
  const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
  const allSettled =
    uploadedFiles.length > 0 &&
    uploadedFiles.every(
      (f) => f.status === "completed" || f.status === "failed",
    );
  const canSubmit =
    Boolean(selectedTemplate) &&
    completedFiles.length > 0 &&
    allSettled &&
    (requiredRootLabels.length === 0 ||
      completedFiles.every((f) =>
        requiredRootLabels.every((label) => f.rootContext?.[label]?.trim()),
      ));

  function updateFileStatus(fileId: string, updates: Partial<UploadFileEntry>) {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
    );
  }

  // --- 파일 처리 플로우: 검증 → 업로드 ---

  async function handleFiles(files: File[]) {
    if (files.length === 0 || !selectedTemplate) return;

    const validFiles = files.filter(isSupportedFile);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      toast.warning("지원하지 않는 파일 형식이 포함되어 제외되었습니다", {
        description: "Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
      });
    }

    if (validFiles.length === 0) return;

    const { mapped_headers } = selectedTemplate;

    // 1) 엔트리 생성 (validating 상태)
    const entries: UploadFileEntry[] = validFiles.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      status: "validating" as const,
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...entries]);

    // 2) 각 파일 헤더 검증
    const validated: { entry: UploadFileEntry; file: File }[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const entry = entries[i];
      const file = validFiles[i];

      try {
        const headers = await parseFileHeaders(file);

        if (headers.length === 0) {
          updateFileStatus(entry.id, {
            status: "failed",
            error: "파일에서 헤더를 찾을 수 없습니다",
          });
          continue;
        }

        const result = validateHeaders(headers, mapped_headers);

        if (!result.valid) {
          const preview = result.missing.slice(0, 3).join(", ");
          const suffix =
            result.missing.length > 3
              ? ` 외 ${result.missing.length - 3}개`
              : "";
          updateFileStatus(entry.id, {
            status: "failed",
            error: `필수 컬럼 누락: ${preview}${suffix}`,
          });
          continue;
        }

        // 검증 통과
        updateFileStatus(entry.id, { progress: 10 });
        validated.push({ entry, file });
      } catch (error) {
        console.error(`Header parse failed: ${file.name}`, error);
        updateFileStatus(entry.id, {
          status: "failed",
          error: "파일 헤더를 읽을 수 없습니다",
        });
      }
    }

    if (validated.length === 0) return;

    // 3) 검증 통과 파일만 업로드
    if (validated.length === 1) {
      await uploadSingleFile(validated[0].entry, validated[0].file);
    } else {
      await uploadBatchFiles(
        validated.map((v) => v.entry),
        validated.map((v) => v.file),
      );
    }
  }

  async function uploadSingleFile(entry: UploadFileEntry, file: File) {
    updateFileStatus(entry.id, { status: "uploading", progress: 15 });

    try {
      // URL 발급
      const uploadInfo = await createUpload({
        original_name: file.name,
        content_type: file.type || "application/octet-stream",
        file_size: file.size,
      });

      updateFileStatus(entry.id, {
        uploadId: uploadInfo.upload_id,
        progress: 20,
      });

      // S3 업로드 (20~85)
      await uploadWithProgress(uploadInfo.upload_url, file, (percent) => {
        updateFileStatus(entry.id, {
          progress: Math.min(85, Math.max(20, Math.round(20 + percent * 0.65))),
        });
      });

      updateFileStatus(entry.id, { progress: 90 });

      // 업로드 완료 확인
      await completeUpload(uploadInfo.upload_id);

      updateFileStatus(entry.id, { status: "completed", progress: 100 });
    } catch (error) {
      console.error("File upload failed:", error);
      updateFileStatus(entry.id, {
        status: "failed",
        progress: 0,
        error: "업로드에 실패했습니다",
      });
    }
  }

  async function uploadBatchFiles(entries: UploadFileEntry[], files: File[]) {
    for (const entry of entries) {
      updateFileStatus(entry.id, { status: "uploading", progress: 15 });
    }

    try {
      // URL 일괄 발급
      const batchResponse = await batchCreateUploads({
        items: files.map((file) => ({
          original_name: file.name,
          content_type: file.type || "application/octet-stream",
          file_size: file.size,
        })),
      });

      // entryId → uploadId 로컬 매핑 (React state와 무관하게 추적)
      const entryUploadMap = new Map<string, string>();
      const completedUploadIds: string[] = [];

      await Promise.allSettled(
        batchResponse.items.map(async (uploadInfo, idx) => {
          const entry = entries[idx];
          entryUploadMap.set(entry.id, uploadInfo.upload_id);
          updateFileStatus(entry.id, {
            uploadId: uploadInfo.upload_id,
            progress: 20,
          });

          try {
            // S3 업로드 (20~85)
            await uploadWithProgress(
              uploadInfo.upload_url,
              files[idx],
              (percent) => {
                updateFileStatus(entry.id, {
                  progress: Math.min(
                    85,
                    Math.max(20, Math.round(20 + percent * 0.65)),
                  ),
                });
              },
            );

            updateFileStatus(entry.id, { progress: 90 });
            completedUploadIds.push(uploadInfo.upload_id);
          } catch (error) {
            console.error(`File upload failed: ${entry.name}`, error);
            updateFileStatus(entry.id, {
              status: "failed",
              progress: 0,
              error: "업로드에 실패했습니다",
            });
          }
        }),
      );

      // 업로드 완료 일괄 확인
      if (completedUploadIds.length > 0) {
        const completeResult = await batchCompleteUploads({
          upload_ids: completedUploadIds,
        });

        const failedIds = new Set(
          completeResult.failed.map((f) => f.upload_id),
        );

        for (const entry of entries) {
          const uploadId = entryUploadMap.get(entry.id);
          if (!uploadId) continue;
          if (failedIds.has(uploadId)) {
            updateFileStatus(entry.id, {
              status: "failed",
              progress: 0,
              error: "업로드 완료 확인에 실패했습니다",
            });
          } else if (completedUploadIds.includes(uploadId)) {
            updateFileStatus(entry.id, {
              status: "completed",
              progress: 100,
            });
          }
        }
      }
    } catch (error) {
      console.error("Batch upload failed:", error);
      for (const entry of entries) {
        updateFileStatus(entry.id, {
          status: "failed",
          progress: 0,
          error: "배치 업로드 요청에 실패했습니다",
        });
      }
    }
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }

  function handleClose() {
    if (isBusy) return;
    setSelectedTemplateId("");
    setOverwrite(false);
    setUploadedFiles([]);
    setSynthesisState(null);
    setBatchStatus(null);
    closeModal();
  }


  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;

    const uploadIds = completedFiles
      .map((f) => f.uploadId)
      .filter(Boolean) as string[];

    setIsSubmitting(true);

    try {
      const result = await startSynthesis({
        mapping_id: selectedTemplate!.id,
        overwrite,
        uploads: uploadIds.map((id) => {
          const file = uploadedFiles.find((f) => f.uploadId === id);
          return {
            upload_id: id,
            root_context: file?.rootContext || null,
          };
        }),
      });

      if (result.accepted_count === 0) {
        toast.error("처리를 시작하지 못했어요.");
        setIsSubmitting(false);
        return;
      }

      if (result.failed.length > 0) {
        toast.warning(
          `${result.failed.length}개 파일의 처리를 시작하지 못했어요.`,
        );
      }

      // uploadId → fileName 매핑
      const fileNames = new Map<string, string>();
      for (const f of uploadedFiles) {
        if (f.uploadId) fileNames.set(f.uploadId, f.name);
      }

      setSynthesisState({ batchId: result.batch_id, fileNames });
      setIsSubmitting(false);
    } catch (error) {
      console.error("Synthesis start failed:", error);
      toast.error("처리 시작에 실패했어요.", {
        description: "잠시 후 다시 시도해 주세요.",
      });
      setIsSubmitting(false);
    }
  }

  function handleMoveToTemplate() {
    handleClose();
    navigate(
      partNumber ? `/parts/${partNumber}/templates` : "/parts/templates",
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {synthesisState ? "데이터 처리" : "부품 업로드"}
          </DialogTitle>
          <DialogDescription>
            {synthesisState
              ? "업로드한 파일을 처리하고 있어요. 완료될 때까지 잠시 기다려 주세요."
              : "매핑과 파일을 선택하고 업로드를 실행해 주세요."}
          </DialogDescription>
        </DialogHeader>

        {synthesisState ? (
          <SynthesisProgress
            batchStatus={batchStatus}
            fileNames={synthesisState.fileNames}
          />
        ) : isLoadingMappings ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
            매핑 목록을 불러오는 중이에요...
          </div>
        ) : !selectedTemplate ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">
              사용할 매핑이 없습니다.
            </p>
            <p className="mt-1 text-muted-foreground">
              먼저 속성 분석에서 매핑을 생성해 주세요.
            </p>
            <div className="mt-3">
              <Button
                variant="outline"
                className="ai-outline-btn ai-theme-1"
                onClick={handleMoveToTemplate}
              >
                <Sparkles className="ai-outline-btn__icon h-4 w-4" />
                속성 분석으로 이동
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 매핑 선택 */}
            <div>
              <Label className="text-xs">매핑 선택</Label>
              <Select
                value={selectedTemplate?.id ?? ""}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="매핑 선택" />
                </SelectTrigger>
                <SelectContent>
                  {mappingOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} (v{template.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 필요한 컬럼 */}
            {selectedTemplate.mapped_headers.length > 0 && (
              <div>
                <Label className="text-xs">필요한 컬럼</Label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedTemplate.mapped_headers.map((header) => (
                    <span
                      key={header}
                      className={cn(
                        "inline-flex items-center rounded-md border px-2 py-1 text-xs",
                        rootContextColumns.has(header)
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                          : "border-border bg-muted/30 text-foreground",
                      )}
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ROOT_BOM: 파일에 없는 연결 정보 안내 */}
            {requiredRootLabels.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                <p className="text-xs font-medium text-foreground">
                  직접 지정이 필요한 연결 정보
                </p>
                <div className="mt-0.5 text-xs text-muted-foreground space-y-0.5">
                  {requiredRootLabels.map((label) => {
                    const localLabel = t(`mapping:nodeLabel.${label}`, label);
                    const cols = rootLabelRelColumns[label];
                    return (
                      <p key={label}>
                        {cols && cols.length > 0
                          ? `'${cols.join("', '")}' 컬럼을 처리하려면 대상 ${josa(localLabel, "을/를")} 알아야 해요.`
                          : `${localLabel} 정보가 파일에 포함되어 있지 않아요.`}{" "}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 파일 업로드 드롭존 */}
            <div>
              <Label className="text-xs">파일 업로드</Label>
              <div
                onDragOver={(e) => {
                  if (isBusy) return;
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  if (isBusy) return;
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  if (isBusy) return;
                  e.preventDefault();
                  setIsDragOver(false);
                  void handleFiles(Array.from(e.dataTransfer.files));
                }}
                onClick={() => !isBusy && fileRef.current?.click()}
                className={cn(
                  "mt-1 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
                  isBusy
                    ? "cursor-not-allowed border-border bg-muted/20 opacity-70"
                    : isDragOver
                      ? "border-primary bg-primary/5"
                      : "cursor-pointer border-border bg-muted/20 hover:border-primary/40",
                )}
              >
                <input
                  ref={fileRef}
                  type="file"
                  aria-label="부품 파일 업로드"
                  accept={UPLOAD_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files
                      ? Array.from(e.target.files)
                      : [];
                    void handleFiles(files);
                    e.target.value = "";
                  }}
                  disabled={isBusy}
                />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Excel(.xlsx, .xls), CSV 지원 · 여러 파일 선택 가능
                  </p>
                </div>
              </div>
            </div>

            {/* 업로드된 파일 목록 */}
            {uploadedFiles.length > 0 && (
              <div>
                <Label className="text-xs">
                  업로드된 파일 ({completedFiles.length}/{uploadedFiles.length})
                </Label>
                <div className="mt-1 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={cn(
                        "rounded-md border",
                        file.status === "failed"
                          ? "border-red-500/20 bg-red-500/5"
                          : "bg-background",
                      )}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        {/* 상태 아이콘 */}
                        {file.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : file.status === "failed" ? (
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                        )}

                        {/* 파일 정보 */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            {file.status === "validating" && (
                              <span className="text-xs text-primary">
                                검증 중…
                              </span>
                            )}
                            {file.status === "uploading" && (
                              <span className="text-xs text-primary">
                                {file.progress}%
                              </span>
                            )}
                          </div>
                          {/* 에러 메시지 */}
                          {file.status === "failed" && file.error && (
                            <p className="mt-1 text-xs text-red-600">
                              {file.error}
                            </p>
                          )}
                          {/* 진행률 바 */}
                          {(file.status === "validating" ||
                            file.status === "uploading") && (
                            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* 제거 버튼 */}
                        {file.status !== "uploading" &&
                          file.status !== "validating" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                              aria-label={`${file.name} 제거`}
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                      </div>

                      {/* ROOT_BOM: root_context 입력 */}
                      {file.status === "completed" &&
                        requiredRootLabels.length > 0 && (
                          <div className="border-t px-3 py-2 space-y-1.5">
                            <p className="text-[11px] text-muted-foreground">
                              이 파일의 데이터를 연결할 대상을 지정해 주세요
                            </p>
                            {requiredRootLabels.map((label) => (
                              <div
                                key={label}
                                className="flex items-center gap-2"
                              >
                                <span className="shrink-0 text-xs font-medium text-muted-foreground w-16">
                                  {t(`mapping:nodeLabel.${label}`, label)}
                                </span>
                                <NodeSearchInput
                                  label={label}
                                  placeholder={
                                    MERGE_KEY_HINTS[label] ??
                                    "식별값을 입력하세요"
                                  }
                                  value={file.rootContext?.[label] ?? ""}
                                  onChange={(val) => {
                                    setUploadedFiles((prev) =>
                                      prev.map((f) =>
                                        f.id === file.id
                                          ? {
                                              ...f,
                                              rootContext: {
                                                ...f.rootContext,
                                                [label]: val,
                                              },
                                            }
                                          : f,
                                      ),
                                    );
                                  }}
                                />
                                {completedFiles.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 shrink-0 px-2 text-[11px] text-muted-foreground"
                                    disabled={!file.rootContext?.[label]?.trim()}
                                    onClick={() => {
                                      const value = file.rootContext?.[label] ?? "";
                                      setUploadedFiles((prev) =>
                                        prev.map((f) =>
                                          f.status === "completed"
                                            ? {
                                                ...f,
                                                rootContext: {
                                                  ...f.rootContext,
                                                  [label]: value,
                                                },
                                              }
                                            : f,
                                        ),
                                      );
                                    }}
                                  >
                                    모두 적용
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 덮어쓰기 옵션 */}
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    기존 값 덮어쓰기
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {overwrite
                      ? "이미 등록된 부품이 있으면 엑셀 값으로 모두 덮어써요."
                      : "이미 등록된 부품이 있으면 비어 있는 항목만 엑셀에서 채워요."}
                  </p>
                </div>
                <Switch checked={overwrite} onCheckedChange={setOverwrite} />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {synthesisState ? (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSynthesisProcessing}
            >
              닫기
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isBusy}>
                취소
              </Button>
              <Button
                disabled={!canSubmit || isSubmitting}
                onClick={() => void handleSubmit()}
              >
                {isSubmitting && (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "처리 시작 중…" : "업로드 실행"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
