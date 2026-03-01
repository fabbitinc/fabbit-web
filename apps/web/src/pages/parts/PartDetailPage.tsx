import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Pencil,
  MoreHorizontal,
  Network,
  FileText,
  Building2,
  ExternalLink,
  Package,
  MapPin,
  Layers,
  Loader2,
  Upload,
  Download,
  Trash2,
  FileDown,
  ImageDown,
  Clock,
  Paperclip,
  File,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileAxis3d,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePartDetail, usePartProjects, useUploadDrawing, useDeleteDrawing, usePartBom, usePartSuppliers, usePartFiles, useAttachFiles, useDetachFile } from "@/api/hooks/useParts";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type {
  PartDetailResponse,
  PartFileItem,
} from "@/api/types/parts";
import { HistoryTimeline } from "./history/HistoryTimeline";
import { MOCK_HISTORY } from "./history/mock-data";

// --- 헬퍼 ---

function LifecycleBadge({ state }: { state: string | null }) {
  if (!state) return <span className="text-muted-foreground/40">—</span>;

  const cls =
    state === "양산"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      : state === "개발"
        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
        : "border-muted bg-muted/50 text-muted-foreground";
  return (
    <Badge variant="outline" className={cls}>
      {state}
    </Badge>
  );
}

function Dash() {
  return <span className="text-muted-foreground/30">—</span>;
}

function EmptyBlock({
  message,
  icon: Icon = FileText,
  action,
}: {
  message: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground/30" />
      </div>
      <p className="text-sm text-muted-foreground/50">{message}</p>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

// --- 파일 아이콘 헬퍼 ---

function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function FileIcon({ filename }: { filename: string }) {
  const ext = getFileExtension(filename);

  // PDF
  if (ext === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
  // CAD 2D (도면)
  if (["dwg", "dxf"].includes(ext))
    return <FileText className="h-4 w-4 text-orange-500" />;
  // CAD 3D (모델)
  if (
    [
      "stp",
      "step",
      "igs",
      "iges",
      "stl",
      "obj",
      "3mf",
      "sat",
      "x_t",
      "x_b",
      "prt",
      "asm",
      "sldprt",
      "sldasm",
      "catpart",
      "catproduct",
    ].includes(ext)
  )
    return <FileAxis3d className="h-4 w-4 text-violet-500" />;
  // 이미지
  if (
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "bmp",
      "svg",
      "webp",
      "tiff",
      "tif",
      "ico",
      "heic",
      "avif",
    ].includes(ext)
  )
    return <FileImage className="h-4 w-4 text-emerald-500" />;
  // 동영상
  if (
    [
      "mp4",
      "avi",
      "mov",
      "mkv",
      "wmv",
      "flv",
      "webm",
      "m4v",
      "mpeg",
      "mpg",
      "3gp",
    ].includes(ext)
  )
    return <FileVideo className="h-4 w-4 text-pink-500" />;
  // 오디오
  if (["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext))
    return <FileAudio className="h-4 w-4 text-amber-500" />;
  // 스프레드시트
  if (["xls", "xlsx", "csv", "ods", "cell"].includes(ext))
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  // 문서
  if (["doc", "docx", "txt", "rtf", "odt", "hwp", "hwpx"].includes(ext))
    return <FileText className="h-4 w-4 text-blue-600" />;
  // 압축 파일
  if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"].includes(ext))
    return <FileArchive className="h-4 w-4 text-yellow-600" />;
  // 프레젠테이션
  if (["ppt", "pptx", "odp", "key"].includes(ext))
    return <FileText className="h-4 w-4 text-orange-600" />;
  // 코드/설정
  if (
    [
      "json",
      "xml",
      "yaml",
      "yml",
      "html",
      "css",
      "js",
      "ts",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "ini",
      "cfg",
      "conf",
      "toml",
    ].includes(ext)
  )
    return <FileCode className="h-4 w-4 text-slate-500" />;

  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// --- 헤더 영역 ---

function HeaderCard({ item }: { item: PartDetailResponse }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
        {/* 품번 + 상태 + 액션 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-xl font-bold text-foreground">
              {item.part_number}
            </h1>
            <LifecycleBadge state={item.lifecycle_state} />
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              편집
            </Button>
            <Button variant="outline" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 품명 */}
        {item.name && (
          <p className="mt-1 text-base text-foreground">{item.name}</p>
        )}

        {/* 핵심 속성 — 인라인 그리드 */}
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-4">
          <div>
            <dt className="text-[10px] text-muted-foreground/60">리비전</dt>
            <dd className="text-sm font-medium text-foreground">
              {item.revision ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">재질</dt>
            <dd className="text-sm text-foreground">{item.material ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">카테고리</dt>
            <dd className="text-sm text-foreground">{item.category ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground/60">단위</dt>
            <dd className="text-sm text-foreground">{item.unit ?? "—"}</dd>
          </div>
        </div>

        {/* 설명 (한 줄 truncate) */}
        {item.description && (
          <p className="mt-3 truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

      </div>
    </div>
  );
}

// 도면 프리뷰 (속성 탭용)
function DrawingPreview({
  item,
  onUpload,
  isUploading,
  onDelete,
}: {
  item: PartDetailResponse;
  onUpload: (file: File) => void;
  isUploading: boolean;
  onDelete: () => void;
}) {
  const hasDrawing = item.drawing != null;
  const [isDragging, setIsDragging] = useState(false);

  const DRAWING_ACCEPT = [".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".tif", ".tiff"];

  function isAcceptedFile(file: File): boolean {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    return DRAWING_ACCEPT.includes(ext);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isAcceptedFile(file)) {
      toast.error("지원하지 않는 파일 형식입니다", {
        description: `도면 파일(${DRAWING_ACCEPT.join(", ")})만 업로드 가능합니다.`,
      });
      return;
    }
    onUpload(file);
  }

  function handleClick() {
    if (isUploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = DRAWING_ACCEPT.join(",");
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onUpload(file);
    };
    input.click();
  }

  if (hasDrawing) {
    const drawing = item.drawing!;
    const hasThumbnail = !!drawing.thumbnail_url;
    const isConverting = drawing.conversion_status === "PENDING";

    function handleDrawingClick() {
      if (drawing.pdf_url) {
        window.open(drawing.pdf_url, "_blank", "noopener,noreferrer");
      }
    }

    async function handleDownload(url: string) {
      try {
        const pathname = new URL(url).pathname;
        const filename = decodeURIComponent(pathname.split("/").pop() || drawing.drawing_number);
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch {
        toast.error("다운로드에 실패했습니다");
      }
    }

    function handleDelete() {
      if (!window.confirm("도면을 삭제하시겠습니까?")) return;
      onDelete();
    }

    const downloadOptions = [
      { label: "원본 다운로드", icon: Download, url: drawing.original_file_url },
      { label: "PDF 다운로드", icon: FileDown, url: drawing.pdf_url },
      { label: "이미지 다운로드", icon: ImageDown, url: drawing.thumbnail_url },
    ].filter((opt) => opt.url != null);

    return (
      <div
        className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted/20"
      >
        {/* 프리뷰 영역 (클릭 시 PDF 보기) */}
        <div
          onClick={drawing.pdf_url ? handleDrawingClick : undefined}
          className={`flex h-full w-full items-center justify-center ${
            drawing.pdf_url ? "cursor-pointer" : ""
          }`}
        >
          {hasThumbnail ? (
            <img
              src={drawing.thumbnail_url!}
              alt={drawing.name ?? drawing.drawing_number}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <div className="relative">
                {isConverting ? (
                  <>
                    <Loader2 className="h-14 w-14 animate-spin" strokeWidth={1} />
                    <span className="mt-1 text-[10px]">변환 중...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-14 w-14" strokeWidth={1} />
                    <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Layers className="h-3 w-3" />
                    </div>
                  </>
                )}
              </div>
              {!isConverting && <span className="text-[10px]">도면 미리보기</span>}
            </div>
          )}
        </div>

        {/* 우상단 오버레이 액션 */}
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {downloadOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-8 items-center gap-1.5 rounded-md bg-background/95 px-2.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                  다운로드
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[150px]">
                {downloadOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.label}
                    onClick={() => handleDownload(opt.url!)}
                  >
                    <opt.icon className="mr-2 h-4 w-4" />
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="flex h-8 items-center gap-1.5 rounded-md bg-background/95 px-2.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            삭제
          </button>
        </div>

        {/* 좌하단 도면번호 */}
        <div className="absolute left-2 bottom-2">
          <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm">
            {drawing.drawing_number}
          </span>
        </div>

        {/* 우하단 PDF 보기 */}
        {drawing.pdf_url && (
          <div className="absolute right-2 bottom-2">
            <span className="flex h-6 items-center gap-1 rounded bg-background/80 px-2 text-muted-foreground shadow-sm">
              <ExternalLink className="h-3 w-3" />
              <span className="text-[10px]">PDF 보기</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm font-medium text-primary/70">업로드 중...</p>
        <p className="mt-1 text-[11px] text-primary/40">
          도면을 등록하고 있습니다
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/15 bg-muted/10 hover:border-primary/40 hover:bg-muted/20"
      }`}
    >
      <div
        className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
          isDragging
            ? "border-primary/40 bg-primary/10"
            : "border-2 border-dashed border-muted-foreground/15 group-hover:border-primary/30 group-hover:bg-primary/5"
        }`}
      >
        <Upload
          className={`h-5 w-5 transition-colors ${
            isDragging
              ? "text-primary"
              : "text-muted-foreground/25 group-hover:text-primary/50"
          }`}
        />
      </div>
      <p
        className={`text-sm font-medium transition-colors ${
          isDragging
            ? "text-primary"
            : "text-muted-foreground/35 group-hover:text-foreground/60"
        }`}
      >
        {isDragging ? "여기에 놓으세요" : "도면 등록"}
      </p>
      <p
        className={`mt-1 text-[11px] transition-colors ${
          isDragging
            ? "text-primary/60"
            : "text-muted-foreground/20 group-hover:text-muted-foreground/40"
        }`}
      >
        파일을 드래그하거나 클릭하여 업로드 · PDF, DWG, DXF
      </p>
    </button>
  );
}

// --- 탭 콘텐츠 ---

// 속성 탭
function PropertiesTab({
  item,
  onUploadDrawing,
  isUploadingDrawing,
  onDeleteDrawing,
}: {
  item: PartDetailResponse;
  onUploadDrawing: (file: File) => void;
  isUploadingDrawing: boolean;
  onDeleteDrawing: () => void;
}) {
  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "품번",
      value: <span className="font-mono text-xs">{item.part_number}</span>,
    },
    { label: "품명", value: item.name ?? <Dash /> },
    { label: "리비전", value: item.revision ?? <Dash /> },
    {
      label: "상태",
      value: <LifecycleBadge state={item.lifecycle_state} />,
    },
    { label: "카테고리", value: item.category ?? <Dash /> },
    { label: "재질", value: item.material ?? <Dash /> },
    { label: "단위", value: item.unit ?? <Dash /> },
    {
      label: "리드타임",
      value:
        item.lead_time_days != null ? `${item.lead_time_days}일` : <Dash />,
    },
    {
      label: "팬텀",
      value:
        item.is_phantom != null ? item.is_phantom ? "예" : "아니오" : <Dash />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      {/* 좌: 도면 프리뷰 */}
      <div className="lg:col-span-3">
        <DrawingPreview
          item={item}
          onUpload={onUploadDrawing}
          isUploading={isUploadingDrawing}
          onDelete={onDeleteDrawing}
        />
      </div>

      {/* 우: 속성 + 설명 */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border">
          <table className="w-full">
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border/40 last:border-b-0"
                >
                  <td className="w-24 py-2.5 pl-4 pr-2 text-xs text-muted-foreground">
                    {row.label}
                  </td>
                  <td className="py-2.5 pr-4 text-sm text-foreground">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {item.description && (
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              설명
            </h4>
            <p className="text-sm leading-relaxed text-foreground/80">
              {item.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// BOM 탭
function BomTab({ partId }: { partId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = usePartBom(partId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">불러오는 중...</span>
      </div>
    );
  }

  const children = data?.children ?? [];
  const parents = data?.parents ?? [];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            하위 부품
            <span className="text-xs font-normal text-muted-foreground">
              ({children.length})
            </span>
          </h4>
          {children.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => navigate(`/parts/${partId}/bom`)}
            >
              BOM 전체 보기 <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        {children.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Package className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground/50">
                  하위 부품이 없습니다
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {children.map((c) => (
              <div
                key={c.part_number}
                onClick={() => navigate(`/parts/${c.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-medium">
                      {c.part_number}
                    </span>
                    <p className="text-sm text-foreground">
                      {c.name ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  ×{c.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            상위 부품
            <span className="text-xs font-normal text-muted-foreground">
              ({parents.length})
            </span>
          </h4>
          {parents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => navigate(`/parts/${partId}/bom?direction=reverse`)}
            >
              역전개 보기 <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        {parents.length === 0 ? (
          <div className="rounded-lg border border-dashed px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Package className="h-4 w-4 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground/50">
                  상위 부품이 없습니다
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {parents.map((p) => (
              <div
                key={p.part_number}
                onClick={() => navigate(`/parts/${p.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-medium">
                      {p.part_number}
                    </span>
                    <p className="text-sm text-foreground">
                      {p.name ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">
                  ×{p.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 첨부 파일 탭
function AttachmentsTab({ partId }: { partId: string }) {
  const { data, isLoading } = usePartFiles(partId);
  const attachFiles = useAttachFiles(partId);
  const detachFile = useDetachFile(partId);
  const files = data?.items ?? [];
  const isAttaching = attachFiles.isPending;

  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PartFileItem | null>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      attachFiles.mutate(Array.from(e.dataTransfer.files));
    }
  }

  function handleClick() {
    if (isAttaching) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        attachFiles.mutate(Array.from(input.files));
      }
    };
    input.click();
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <div
              key={file.file_id}
              className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <FileIcon filename={file.original_name} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {file.original_name}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase">
                      {getFileExtension(file.original_name)}
                    </span>
                    <span>·</span>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>·</span>
                    <span>{formatDate(file.created_at)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {file.file_url && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(file.file_url!);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = file.original_name;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch {
                        toast.error("다운로드에 실패했습니다");
                      }
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(file)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 중 표시 */}
      {isAttaching && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-sm text-primary/70">파일을 업로드하고 있습니다...</p>
        </div>
      )}

      {/* 드롭존 */}
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isAttaching}
        className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
          files.length === 0 && !isAttaching ? "py-16" : "py-8"
        } ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/15 hover:border-primary/40 hover:bg-muted/20"
        } ${isAttaching ? "pointer-events-none opacity-50" : ""}`}
      >
        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
            isDragging
              ? "bg-primary/10"
              : "border-2 border-dashed border-muted-foreground/15 group-hover:border-primary/30 group-hover:bg-primary/5"
          }`}
        >
          <Upload
            className={`h-5 w-5 transition-colors ${
              isDragging
                ? "text-primary"
                : "text-muted-foreground/25 group-hover:text-primary/50"
            }`}
          />
        </div>
        <p
          className={`text-sm font-medium transition-colors ${
            isDragging
              ? "text-primary"
              : "text-muted-foreground/35 group-hover:text-foreground/60"
          }`}
        >
          {isDragging ? "여기에 놓으세요" : "파일 추가"}
        </p>
        <p
          className={`mt-1 text-[11px] transition-colors ${
            isDragging
              ? "text-primary/60"
              : "text-muted-foreground/20 group-hover:text-muted-foreground/40"
          }`}
        >
          파일을 드래그하거나 클릭하여 업로드
        </p>
      </button>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="첨부 파일 삭제"
        description={`"${deleteTarget?.original_name}"을(를) 삭제하시겠습니까?`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) detachFile.mutate(deleteTarget.file_id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

// 공급사 탭
function SuppliersTab({ partId }: { partId: string }) {
  const { data, isLoading } = usePartSuppliers(partId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">불러오는 중...</span>
      </div>
    );
  }

  const suppliers = data?.items ?? [];

  if (suppliers.length === 0)
    return <EmptyBlock message="등록된 공급사가 없습니다" icon={Building2} />;

  return (
    <div className="space-y-1.5">
      {suppliers.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {s.company_name}
              </p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                {s.code && <span className="font-mono">{s.code}</span>}
                {s.country && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {s.country}
                  </span>
                )}
              </p>
            </div>
          </div>
          {s.unit_cost != null && (
            <span className="text-sm font-medium text-foreground">
              ₩{s.unit_cost.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// 프로젝트 탭
function ProjectsTab({ partId }: { partId: string }) {
  const navigate = useNavigate();
  const { data, isLoading } = usePartProjects(partId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">불러오는 중...</span>
      </div>
    );
  }

  const projects = data?.items ?? [];

  if (projects.length === 0) {
    return <EmptyBlock message="연결된 프로젝트가 없습니다" icon={FolderKanban} />;
  }

  return (
    <div className="space-y-1.5">
      {projects.map((p) => (
        <div
          key={p.id}
          onClick={() => navigate(`/projects/${p.id}`)}
          className="flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              {p.description && (
                <p className="text-xs text-muted-foreground truncate max-w-md">
                  {p.description}
                </p>
              )}
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40" />
        </div>
      ))}
    </div>
  );
}

// 이력 탭
function HistoryTab() {
  return <HistoryTimeline entries={MOCK_HISTORY} />;
}

// --- 메인 컴포넌트 ---

type TabKey = "properties" | "bom" | "attachments" | "suppliers" | "projects" | "history";

const TABS: {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  count?: (item: PartDetailResponse) => number;
}[] = [
  { key: "properties", label: "속성", icon: Package },
  {
    key: "bom",
    label: "BOM",
    icon: Network,
    count: (i) => i.children_count + i.parents_count,
  },
  {
    key: "attachments",
    label: "첨부 파일",
    icon: Paperclip,
    count: (i) => i.files_count,
  },
  {
    key: "suppliers",
    label: "공급사",
    icon: Building2,
    count: (i) => i.suppliers_count,
  },
  {
    key: "projects",
    label: "프로젝트",
    icon: FolderKanban,
    count: (i) => i.projects_count,
  },
  { key: "history", label: "이력", icon: Clock },
];

export function PartDetailPage() {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("properties");

  const { data: item, isLoading, isError } = usePartDetail(partId);
  const uploadDrawing = useUploadDrawing(partId);
  const deleteDrawing = useDeleteDrawing(partId);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container">
          <div className="mb-8 flex items-center gap-1.5 text-sm">
            <button onClick={() => navigate("/parts")} className="text-muted-foreground hover:text-primary transition-colors">부품 관리</button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground/50">...</span>
          </div>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 또는 데이터 없음
  if (isError || !item) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container">
          <div className="mb-8 flex items-center gap-1.5 text-sm">
            <button onClick={() => navigate("/parts")} className="text-muted-foreground hover:text-primary transition-colors">부품 관리</button>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground/50">알 수 없음</span>
          </div>
          <EmptyBlock message="해당하는 부품을 찾을 수 없습니다" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* 브레드크럼 네비게이션 */}
      <div className="mb-4 flex items-center gap-1.5 text-sm">
        <button onClick={() => navigate("/parts")} className="text-muted-foreground hover:text-primary transition-colors">부품 관리</button>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold text-foreground">{item.part_number}</span>
      </div>

      {/* 비주얼 헤더 카드 */}
      <div className="mb-5">
        <HeaderCard item={item} />
      </div>

      {/* 아이콘 탭 바 */}
      <div className="mb-5 border-b">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.count?.(item);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {count != null && count > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                    {count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "properties" && (
        <PropertiesTab
          item={item}
          onUploadDrawing={(file) => uploadDrawing.mutate(file)}
          isUploadingDrawing={uploadDrawing.isPending}
          onDeleteDrawing={() => deleteDrawing.mutate()}
        />
      )}
      {activeTab === "bom" && <BomTab partId={partId!} />}
      {activeTab === "attachments" && <AttachmentsTab partId={partId!} />}
      {activeTab === "suppliers" && <SuppliersTab partId={partId!} />}
      {activeTab === "projects" && <ProjectsTab partId={partId!} />}
      {activeTab === "history" && <HistoryTab />}
    </div>
  );
}
