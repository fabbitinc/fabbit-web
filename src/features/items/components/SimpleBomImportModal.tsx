import { useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBomImportStore } from "@/stores/bomImportStore";
import { useAttributes } from "@/api/hooks/useAttributes";
import {
  generateTempPresignedUrl,
  uploadFileToPresignedUrl,
  importBomSimple,
} from "@/api";
import {
  DATA_TYPE_MAP,
  PROPERTY_TYPES,
} from "@/features/upload/components/PropertyMappingCards";
import type { AttributeDefinitionDto } from "@/api/types/import";
import type { SimpleBomImportResponse } from "@/api/types/attribute";

type ImportStep = "upload" | "mapping" | "importing" | "result";

interface ColumnMappingState {
  excelColumn: string;
  attributeId: string | null;
  autoMatched: boolean;
}

// 컬럼 이름 정규화 (대소문자, 공백, 특수문자 무시)
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_\-./]+/g, "")
    .trim();
}

// 자동 매칭
function autoMatchColumns(
  headers: string[],
  attributes: AttributeDefinitionDto[],
): ColumnMappingState[] {
  return headers.map((header) => {
    const normalized = normalizeColumnName(header);

    // name 또는 displayName으로 매칭
    const matched = attributes.find(
      (attr) =>
        normalizeColumnName(attr.name) === normalized ||
        normalizeColumnName(attr.displayName) === normalized,
    );

    return {
      excelColumn: header,
      attributeId: matched?.id ?? null,
      autoMatched: !!matched,
    };
  });
}

export function SimpleBomImportModal() {
  const { isModalOpen, closeModal, projectId, folderId } = useBomImportStore();
  const { data: attributes = [] } = useAttributes(projectId);

  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMappingState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimpleBomImportResponse | null>(null);

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isModalOpen) {
      setStep("upload");
      setFile(null);
      setHeaders([]);
      setSampleRows([]);
      setColumnMappings([]);
      setError(null);
      setResult(null);
    }
  }, [isModalOpen]);

  // Step 1: 파일 선택 및 파싱
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);

      try {
        // 프론트에서 xlsx 파싱
        const isCSV = selectedFile.name.toLowerCase().endsWith(".csv");
        let workbook: XLSX.WorkBook;

        if (isCSV) {
          const text = await selectedFile.text();
          workbook = XLSX.read(text, { type: "string" });
        } else {
          const arrayBuffer = await selectedFile.arrayBuffer();
          workbook = XLSX.read(arrayBuffer, { type: "array" });
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
          defval: "",
          rawNumbers: false,
        });

        if (rawData.length < 2) {
          setError("파일에 데이터가 부족합니다. 헤더와 최소 1행의 데이터가 필요합니다.");
          return;
        }

        const parsedHeaders = rawData[0]
          .map((h) => String(h ?? "").trim())
          .filter(Boolean);

        const dataRows = rawData.slice(1, 6);
        const rows: Record<string, string>[] = dataRows.map((row) => {
          const record: Record<string, string> = {};
          parsedHeaders.forEach((header, i) => {
            record[header] = row[i] != null ? String(row[i]) : "";
          });
          return record;
        });

        setHeaders(parsedHeaders);
        setSampleRows(rows);

        // 자동 매칭
        const mappings = autoMatchColumns(parsedHeaders, attributes);
        setColumnMappings(mappings);
        setStep("mapping");
      } catch {
        setError("파일을 읽을 수 없습니다. 올바른 Excel 또는 CSV 파일인지 확인해 주세요.");
      }
    },
    [attributes],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFileSelect(selectedFile);
      e.target.value = "";
    },
    [handleFileSelect],
  );

  // 매핑 변경
  const updateMapping = (index: number, attributeId: string | null) => {
    setColumnMappings((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, attributeId, autoMatched: false } : m,
      ),
    );
  };

  // 매칭된 컬럼 수
  const matchedCount = columnMappings.filter((m) => m.attributeId).length;
  const unmatchedCount = columnMappings.filter((m) => !m.attributeId).length;

  // Step 3: 파일 업로드 및 서버 전송
  const handleImport = useCallback(async () => {
    if (!file || !projectId) return;

    setStep("importing");
    setError(null);

    try {
      // 파일 업로드
      const ext = file.name.toLowerCase().split(".").pop();
      let contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (ext === "csv") contentType = "text/csv";
      else if (ext === "xls") contentType = "application/vnd.ms-excel";

      const presigned = await generateTempPresignedUrl({
        fileName: file.name,
        contentType,
        fileSizeBytes: file.size,
      });

      await uploadFileToPresignedUrl(presigned.uploadUrl, file);

      // 매핑 정보와 함께 서버 전송
      const response = await importBomSimple({
        projectId,
        folderId: folderId ?? undefined,
        fileKey: presigned.fileKey,
        columnMappings: columnMappings.map((m) => ({
          excelColumn: m.excelColumn,
          attributeId: m.attributeId,
        })),
      });

      setResult(response);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "가져오기 중 오류가 발생했습니다");
      setStep("mapping");
    }
  }, [file, projectId, folderId, columnMappings]);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-3xl w-[80vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#3b82f6]" />
            BOM 가져오기
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: 파일 선택 */}
        {step === "upload" && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#dc2626]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div
              className="relative rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] p-12 text-center transition-colors hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileInput}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3b82f6]/10">
                  <Upload className="h-7 w-7 text-[#3b82f6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0f172a]">
                    BOM 파일을 드래그하거나 클릭하여 선택
                  </p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    Excel, CSV 파일 지원 (.xlsx, .xls, .csv)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 매핑 */}
        {step === "mapping" && (
          <>
            {/* 파일 정보 */}
            <div className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/10">
                <FileSpreadsheet className="h-5 w-5 text-[#22c55e]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0f172a]">{file?.name}</p>
                <p className="text-xs text-[#64748b]">
                  {headers.length}개 컬럼 · {matchedCount}개 매칭됨
                  {unmatchedCount > 0 && (
                    <span className="ml-1 text-[#f59e0b]">
                      · {unmatchedCount}개 미매칭
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("upload")}
                className="text-[#64748b]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3 text-sm text-[#dc2626]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* 매핑 테이블 */}
            <div className="flex-1 overflow-auto">
              <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] w-[35%]">
                        엑셀 컬럼
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-[#64748b] w-[30px]" />
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#64748b] w-[45%]">
                        매핑 속성
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-[#64748b] w-[20%]">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {columnMappings.map((mapping, index) => (
                      <tr key={mapping.excelColumn} className="hover:bg-[#f8fafc]">
                        <td className="px-4 py-3">
                          <code className="rounded bg-[#f1f5f9] px-2 py-0.5 text-xs font-mono text-[#0f172a]">
                            {mapping.excelColumn}
                          </code>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <ArrowRight className="h-4 w-4 text-[#94a3b8] mx-auto" />
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={mapping.attributeId ?? "__skip__"}
                            onValueChange={(value) =>
                              updateMapping(
                                index,
                                value === "__skip__" ? null : value,
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="매핑할 속성 선택..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__skip__">
                                <span className="text-[#94a3b8]">건너뛰기</span>
                              </SelectItem>
                              {attributes.map((attr) => {
                                const typeInfo = PROPERTY_TYPES.find(
                                  (t) => t.value === DATA_TYPE_MAP[attr.dataType],
                                );
                                return (
                                  <SelectItem key={attr.id} value={attr.id}>
                                    <span className="flex items-center gap-2">
                                      <span className="text-sm">{attr.displayName}</span>
                                      <span className="text-xs text-[#94a3b8]">
                                        {typeInfo?.label}
                                      </span>
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {mapping.attributeId ? (
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              mapping.autoMatched
                                ? "bg-[#22c55e]/10 text-[#22c55e]"
                                : "bg-[#3b82f6]/10 text-[#3b82f6]",
                            )}>
                              <CheckCircle2 className="h-3 w-3" />
                              {mapping.autoMatched ? "자동매칭" : "수동매칭"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-medium text-[#94a3b8]">
                              건너뛰기
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 안내 메시지 */}
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f8fafc] p-3 text-xs text-[#64748b]">
                <Settings className="h-4 w-4 shrink-0 text-[#94a3b8]" />
                필요한 속성이 없나요?{" "}
                <span className="font-medium text-[#3b82f6]">
                  프로젝트 설정 &gt; 속성
                </span>
                에서 추가하세요.
              </div>

              {/* 샘플 데이터 */}
              {sampleRows.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-[#64748b]">
                    샘플 데이터 미리보기
                  </p>
                  <div className="rounded-lg border border-[#e2e8f0] overflow-x-auto">
                    <table className="text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                          {headers.map((header) => {
                            const mapping = columnMappings.find(
                              (m) => m.excelColumn === header,
                            );
                            const isSkipped = !mapping?.attributeId;
                            return (
                              <th
                                key={header}
                                className={cn(
                                  "px-3 py-2 text-left font-medium whitespace-nowrap min-w-[80px]",
                                  isSkipped
                                    ? "text-[#94a3b8] line-through"
                                    : "text-[#0f172a]",
                                )}
                              >
                                {header}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f1f5f9]">
                        {sampleRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-[#f8fafc]">
                            {headers.map((header) => {
                              const mapping = columnMappings.find(
                                (m) => m.excelColumn === header,
                              );
                              const isSkipped = !mapping?.attributeId;
                              return (
                                <td
                                  key={header}
                                  className={cn(
                                    "px-3 py-1.5 whitespace-nowrap",
                                    isSkipped
                                      ? "text-[#94a3b8] line-through"
                                      : "text-[#0f172a]",
                                  )}
                                >
                                  {row[header] ?? ""}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-4">
              <p className="text-sm text-[#64748b]">
                {matchedCount > 0 ? (
                  <span className="text-[#22c55e]">
                    {matchedCount}개 컬럼이 매핑되었습니다
                  </span>
                ) : (
                  <span className="text-[#f59e0b]">
                    매핑된 컬럼이 없습니다
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeModal}>
                  취소
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={matchedCount === 0}
                  className="bg-[#3b82f6] hover:bg-[#2563eb]"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  가져오기
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: 가져오기 중 */}
        {step === "importing" && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
            <p className="mt-4 text-sm font-medium text-[#0f172a]">BOM 가져오는 중...</p>
            <p className="mt-1 text-xs text-[#64748b]">
              데이터를 처리하고 있습니다
            </p>
          </div>
        )}

        {/* Step 4: 결과 */}
        {step === "result" && result && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10">
                <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
              </div>
              <p className="mt-4 text-lg font-semibold text-[#0f172a]">
                가져오기 완료
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-[#22c55e]">
                  <CheckCircle2 className="h-4 w-4" />
                  {result.importedCount}개 가져옴
                </span>
                {result.skippedCount > 0 && (
                  <span className="flex items-center gap-1.5 text-[#f59e0b]">
                    <AlertTriangle className="h-4 w-4" />
                    {result.skippedCount}개 건너뜀
                  </span>
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4">
                <p className="text-sm font-medium text-[#dc2626]">오류 목록</p>
                <ul className="mt-2 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-[#dc2626]">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end border-t border-[#f1f5f9] pt-4">
              <Button onClick={closeModal} className="bg-[#3b82f6] hover:bg-[#2563eb]">
                완료
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
