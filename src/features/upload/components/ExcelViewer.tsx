import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExcelViewerProps {
  isOpen: boolean;
  onClose: () => void;
  file?: File;
  fileName?: string;
}

interface SheetData {
  name: string;
  data: (string | number | boolean | null)[][];
}

// Mock 데이터 (테스트용)
const MOCK_SHEETS: SheetData[] = [
  {
    name: "Sheet1",
    data: [
      ["Part Number", "Description", "Qty", "Material", "Unit", "Remark"],
      ["PART-001", "육각볼트 M10x30", 4, "STS304", "EA", ""],
      ["PART-002", "육각너트 M10", 8, "STS304", "EA", ""],
      ["PART-003", "평와셔 M10", 8, "Steel", "EA", ""],
      ["PART-004", "스프링와셔 M10", 4, "Steel", "EA", ""],
      ["PART-005", "브라켓 A", 2, "AL6061", "EA", "신규"],
      ["PART-006", "브라켓 B", 2, "AL6061", "EA", ""],
      ["PART-007", "샤프트 Ø20x100", 1, "SCM440", "EA", ""],
      ["PART-008", "베어링 6205", 2, "SUJ2", "EA", ""],
      ["PART-009", "오링 P20", 4, "NBR", "EA", ""],
      ["PART-010", "커버 플레이트", 1, "STS304", "EA", "도면참조"],
    ],
  },
];

export function ExcelViewer({
  isOpen,
  onClose,
  file,
  fileName = "BOM_Sample.xlsx",
}: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (file) {
        loadExcelFile(file);
      } else {
        // Mock 데이터 사용
        setSheets(MOCK_SHEETS);
        setActiveSheetIndex(0);
      }
    }
  }, [isOpen, file]);

  const loadExcelFile = async (file: File) => {
    setIsLoading(true);
    try {
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      let workbook: XLSX.WorkBook;

      if (isCSV) {
        // CSV는 텍스트로 읽기 (인코딩 처리)
        const text = await file.text();
        workbook = XLSX.read(text, { type: "string" });
      } else {
        // Excel은 바이너리로 읽기
        const arrayBuffer = await file.arrayBuffer();
        workbook = XLSX.read(arrayBuffer, { type: "array" });
      }

      const loadedSheets: SheetData[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        const data = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
          header: 1,
          defval: null,
        });
        return { name, data };
      });

      setSheets(loadedSheets);
      setActiveSheetIndex(0);
    } catch (error) {
      console.error("Failed to load file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSheet = sheets[activeSheetIndex];
  const maxColumns = activeSheet?.data.reduce((max, row) => Math.max(max, row.length), 0) ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl w-[95vw] h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-[#e2e8f0]">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-[#22c55e]" />
            {fileName}
          </DialogTitle>
        </DialogHeader>

        {/* Sheet Tabs */}
        {sheets.length > 1 && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#e2e8f0] bg-[#f8fafc]">
            {sheets.map((sheet, index) => (
              <button
                key={sheet.name}
                onClick={() => setActiveSheetIndex(index)}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-t-lg transition-colors",
                  index === activeSheetIndex
                    ? "bg-white border border-b-0 border-[#e2e8f0] font-medium text-[#0f172a]"
                    : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9]"
                )}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        )}

        {/* Spreadsheet Content */}
        <div className="flex-1 overflow-auto bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64748b]">파일 로딩 중...</p>
            </div>
          ) : activeSheet ? (
            <table className="border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f8fafc]">
                  {/* Row number header */}
                  <th className="w-12 min-w-[48px] px-2 py-2 border border-[#e2e8f0] bg-[#f1f5f9] text-center text-xs font-medium text-[#64748b]">
                    #
                  </th>
                  {/* Column headers (A, B, C, ...) */}
                  {Array.from({ length: maxColumns }, (_, i) => (
                    <th
                      key={i}
                      className="min-w-[100px] px-3 py-2 border border-[#e2e8f0] bg-[#f1f5f9] text-center text-xs font-medium text-[#64748b]"
                    >
                      {getColumnLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSheet.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-[#f8fafc]">
                    {/* Row number */}
                    <td className="px-2 py-1.5 border border-[#e2e8f0] bg-[#f1f5f9] text-center text-xs font-medium text-[#64748b]">
                      {rowIndex + 1}
                    </td>
                    {/* Cells */}
                    {Array.from({ length: maxColumns }, (_, colIndex) => {
                      const cellValue = row[colIndex];
                      const isHeader = rowIndex === 0;
                      return (
                        <td
                          key={colIndex}
                          className={cn(
                            "px-3 py-1.5 border border-[#e2e8f0] text-[#0f172a]",
                            isHeader && "bg-[#f8fafc] font-medium",
                            typeof cellValue === "number" && "text-right font-mono"
                          )}
                        >
                          {cellValue !== null && cellValue !== undefined
                            ? String(cellValue)
                            : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#64748b]">데이터가 없습니다</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
          <div className="text-xs text-[#64748b]">
            {activeSheet && (
              <>
                {activeSheet.data.length}행 × {maxColumns}열
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 컬럼 라벨 생성 (A, B, C, ..., Z, AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = "";
  let num = index;
  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
}
