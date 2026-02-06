import { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExcelViewer } from "./ExcelViewer";
import {
  CompactPropertyCard,
  ExpandedPropertyCard,
  convertAttributeToExistingProperty,
  convertSuggestedToPropertyMapping,
  convertExistsToPropertyMapping,
} from "./PropertyMappingCards";
import type {
  PropertyMapping,
  ExistingProperty,
} from "./PropertyMappingCards";
import type { BomAnalyzeResponse } from "@/api/types/import";

// re-export (하위 호환)
export type { PropertyMapping, ExistingProperty };
export {
  convertAttributeToExistingProperty,
  convertSuggestedToPropertyMapping,
  convertExistsToPropertyMapping,
};
export type SampleRow = Record<string, string>;

interface BomAnalyzePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName?: string;
  /** 분석 결과 데이터 */
  analyzeResult?: BomAnalyzeResponse;
  /** 원본 파일 (ExcelViewer용) */
  file?: File;
}

export function BomAnalyzePreview({
  isOpen,
  onClose,
  onConfirm,
  fileName = "",
  analyzeResult,
  file,
}: BomAnalyzePreviewProps) {
  const [existingMappings, setExistingMappings] = useState<PropertyMapping[]>(
    [],
  );
  const [newMappings, setNewMappings] = useState<PropertyMapping[]>([]);
  const [showExcelViewer, setShowExcelViewer] = useState(false);
  const [isExistingExpanded, setIsExistingExpanded] = useState(false);

  // analyzeResult에서 데이터 변환
  useEffect(() => {
    if (analyzeResult) {
      // 기존 속성 매핑 (existsAttributes)
      const existingMaps = analyzeResult.existsAttributes.map((attr, index) =>
        convertExistsToPropertyMapping(attr, index),
      );
      setExistingMappings(existingMaps);

      // 새 속성 매핑 (suggestedAttributes)
      const newMaps = analyzeResult.suggestedAttributes.map(
        (suggested, index) =>
          convertSuggestedToPropertyMapping(suggested, index),
      );
      setNewMappings(newMaps);
    }
  }, [analyzeResult]);

  // 연결 가능한 기존 속성 목록 (existsAttributes + similarAttributes)
  const existingPropertyList = useMemo<ExistingProperty[]>(() => {
    if (!analyzeResult) return [];

    const fromExists = analyzeResult.existsAttributes.map(
      convertAttributeToExistingProperty,
    );

    // suggestedAttributes의 similarAttribute도 포함 (중복 제거)
    const fromSimilar = analyzeResult.suggestedAttributes
      .filter((s) => s.similarAttribute)
      .map((s) => convertAttributeToExistingProperty(s.similarAttribute!))
      .filter((prop) => !fromExists.some((e) => e.id === prop.id));

    return [...fromExists, ...fromSimilar];
  }, [analyzeResult]);

  // 파일에서 직접 샘플 데이터 파싱
  const [sampleColumns, setSampleColumns] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    if (!file || !isOpen) {
      setSampleColumns([]);
      setSampleRows([]);
      return;
    }
    parseSampleData(file).then(({ headers, rows }) => {
      setSampleColumns(headers);
      setSampleRows(rows);
    });
  }, [file, isOpen]);

  const allMappings = [...existingMappings, ...newMappings];

  // 원본 컬럼명 → displayName 매핑 (사용자가 변경한 이름 반영)
  const getDisplayNameForColumn = (originalColumn: string): string => {
    const mapping = allMappings.find(
      (m) => m.originalColumn === originalColumn,
    );
    if (mapping) {
      // skip인 경우 원본 이름 + 취소선 표시를 위해 구분
      if (mapping.action === "skip") return originalColumn;
      // 기존 속성 사용 + 설정 완료 시 연결된 속성의 displayName 표시
      if (mapping.action === "link" && mapping.isConfigured && mapping.linkedPropertyId) {
        const linkedProperty = existingPropertyList.find(
          (p) => p.id === mapping.linkedPropertyId,
        );
        if (linkedProperty) return linkedProperty.displayName;
      }
      return mapping.displayName || originalColumn;
    }
    return originalColumn;
  };

  // 컬럼이 skip 상태인지 확인
  const isColumnSkipped = (originalColumn: string): boolean => {
    const mapping = allMappings.find(
      (m) => m.originalColumn === originalColumn,
    );
    return mapping?.action === "skip";
  };
  // 유사 속성 중 아직 설정되지 않은 것이 있을 때만 경고 표시
  const hasUnconfiguredSimilarProperties = newMappings.some(
    (p) => p.status === "similar" && !p.isConfigured,
  );
  const unconfiguredCount = newMappings.filter((p) => !p.isConfigured).length;

  const updateNewMapping = (id: string, updates: Partial<PropertyMapping>) => {
    setNewMappings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const updateExistingMapping = (
    id: string,
    updates: Partial<PropertyMapping>,
  ) => {
    setExistingMappings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-6xl w-[90vw] h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
            속성 매핑 설정
          </DialogTitle>
        </DialogHeader>

        {/* File Info */}
        <div className="flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/10">
            <FileSpreadsheet className="h-5 w-5 text-[#22c55e]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0f172a]">{fileName}</p>
            <p className="text-xs text-[#64748b]">
              {allMappings.length}개 속성 감지
              {unconfiguredCount > 0 && (
                <span className="ml-2 text-[#f59e0b]">
                  · {unconfiguredCount}개 설정 필요
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExcelViewer(true)}
            className="text-[#3b82f6] border-[#3b82f6]/30 hover:bg-[#3b82f6]/5"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            원본 보기
          </Button>
        </div>

        {/* Similar Property Warning */}
        {hasUnconfiguredSimilarProperties && (
          <div className="flex items-center gap-3 rounded-lg border border-[#fbbf24]/30 bg-[#fffbeb] p-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#f59e0b]" />
            <p className="text-sm text-[#92400e]">
              기존 속성과 유사한 속성이 감지되었습니다. 동일 속성인지 확인해
              주세요.
            </p>
          </div>
        )}

        {/* Property Sections */}
        <div className="flex-1 overflow-auto space-y-4 pr-2">
          {/* Existing Mappings - Collapsible */}
          {existingMappings.length > 0 && (
            <div className="rounded-lg border border-[#e2e8f0] overflow-hidden">
              <button
                onClick={() => setIsExistingExpanded(!isExistingExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExistingExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[#64748b]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#64748b]" />
                  )}
                  <span className="text-sm font-medium text-[#0f172a]">
                    기존 속성
                  </span>
                  <span className="rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-xs font-medium text-[#22c55e]">
                    {existingMappings.length}개
                  </span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
              </button>

              {isExistingExpanded && (
                <div className="p-4 space-y-2 bg-white">
                  {existingMappings.map((mapping) => (
                    <CompactPropertyCard
                      key={mapping.id}
                      mapping={mapping}
                      existingProperties={existingPropertyList}
                      onEdit={() =>
                        updateExistingMapping(mapping.id, {
                          isConfigured: false,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Mappings */}
          {newMappings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-[#0f172a]">
                  새 속성
                </span>
                <span className="rounded-full bg-[#3b82f6]/10 px-2 py-0.5 text-xs font-medium text-[#3b82f6]">
                  {newMappings.length}개
                </span>
              </div>
              <div className="space-y-3">
                {newMappings.map((mapping) =>
                  mapping.isConfigured ? (
                    <CompactPropertyCard
                      key={mapping.id}
                      mapping={mapping}
                      existingProperties={existingPropertyList}
                      onEdit={() =>
                        updateNewMapping(mapping.id, { isConfigured: false })
                      }
                    />
                  ) : (
                    <ExpandedPropertyCard
                      key={mapping.id}
                      mapping={mapping}
                      existingProperties={existingPropertyList}
                      onUpdate={(updates) =>
                        updateNewMapping(mapping.id, updates)
                      }
                      onConfirm={() =>
                        updateNewMapping(mapping.id, { isConfigured: true })
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {sampleRows.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-[#0f172a]">
                샘플 데이터
              </p>
              <div className="rounded-lg border border-[#e2e8f0] overflow-x-auto">
                <table className="text-sm">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      {sampleColumns.map((column) => {
                        const isSkipped = isColumnSkipped(column);
                        const displayName = getDisplayNameForColumn(column);
                        return (
                          <th
                            key={column}
                            className={cn(
                              "px-4 py-2 text-left text-xs font-medium whitespace-nowrap transition-all min-w-[100px]",
                              isSkipped
                                ? "text-[#94a3b8] line-through"
                                : "text-[#0f172a]",
                            )}
                          >
                            {displayName}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {sampleRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-[#f8fafc]">
                        {sampleColumns.map((column) => {
                          const isSkipped = isColumnSkipped(column);
                          return (
                            <td
                              key={column}
                              className={cn(
                                "px-4 py-2 whitespace-nowrap transition-all",
                                isSkipped
                                  ? "text-[#94a3b8] line-through"
                                  : "text-[#0f172a]",
                              )}
                            >
                              {row[column] ?? ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-[#94a3b8]">
                * 처음 {sampleRows.length}개 행만 표시됩니다
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-[#f1f5f9] pt-4">
          <div className="text-sm text-[#64748b]">
            {unconfiguredCount > 0 ? (
              <span className="text-[#f59e0b]">
                {unconfiguredCount}개 속성 설정이 필요합니다
              </span>
            ) : (
              <span className="text-[#22c55e]">모든 속성이 설정되었습니다</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={onConfirm}
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
              disabled={unconfiguredCount > 0}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              확인 후 생성
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Excel Viewer */}
      <ExcelViewer
        isOpen={showExcelViewer}
        onClose={() => setShowExcelViewer(false)}
        fileName={fileName}
        file={file}
      />
    </Dialog>
  );
}

// ============================================
// 파일에서 샘플 데이터 파싱
// ============================================
const SAMPLE_ROW_COUNT = 5;

async function parseSampleData(
  file: File,
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  try {
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    let workbook: XLSX.WorkBook;

    if (isCSV) {
      const text = await file.text();
      workbook = XLSX.read(text, { type: "string" });
    } else {
      const arrayBuffer = await file.arrayBuffer();
      workbook = XLSX.read(arrayBuffer, { type: "array" });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
      rawNumbers: false,
    });

    if (rawData.length < 2) return { headers: [], rows: [] };

    const headers = rawData[0].map((h) => String(h ?? "").trim()).filter(Boolean);
    const dataRows = rawData.slice(1, 1 + SAMPLE_ROW_COUNT);

    const rows: Record<string, string>[] = dataRows.map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, i) => {
        record[header] = row[i] != null ? String(row[i]) : "";
      });
      return record;
    });

    return { headers, rows };
  } catch (error) {
    console.error("Failed to parse sample data:", error);
    return { headers: [], rows: [] };
  }
}
