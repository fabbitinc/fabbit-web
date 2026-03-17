import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  CircleAlert,
  Download,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fabbit/ui";
import { cn } from "@fabbit/ui";
import { FileIcon } from "./file-icon";

export interface PartDrawingAttachmentItem {
  drawingId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface PartFileAttachmentItem {
  fileId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string | null;
  createdAt: string;
}

export interface PartAttachmentsTabProps {
  drawings: PartDrawingAttachmentItem[];
  files: PartFileAttachmentItem[];
  isEditable?: boolean;
  isDeleting?: boolean;
  isDrawingUploading?: boolean;
  isFileUploading?: boolean;
  isLoading?: boolean;
  showLoadingIndicator?: boolean;
  onDeleteDrawing: (drawingId: string) => Promise<void> | void;
  onDeleteFile: (fileId: string) => Promise<void> | void;
  onUploadDrawings: (files: File[]) => Promise<void> | void;
  onUploadFiles: (files: File[]) => Promise<void> | void;
  onRejectDrawings?: (payload: {
    acceptedFiles: File[];
    rejectedFiles: File[];
  }) => void;
}

interface SectionHeaderProps {
  title: React.ReactNode;
  action: React.ReactNode;
  helperText?: string;
  showLoadingIndicator?: boolean;
}

interface SectionBlockProps {
  title: React.ReactNode;
  action: React.ReactNode;
  children: React.ReactNode;
  helperText?: string;
  isDropActive?: boolean;
  isDropDisabled?: boolean;
  isLoading?: boolean;
  showLoadingIndicator?: boolean;
  onDragLeave?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DRAWING_ACCEPT = [
  ".dwg",
  ".dxf",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".bmp",
  ".tif",
  ".tiff",
  ".webp",
  ".sldprt",
  ".sldasm",
  ".step",
  ".stp",
  ".iges",
  ".igs",
  ".brep",
  ".brp",
  ".stl",
  ".obj",
  ".3mf",
  ".fbx",
  ".glb",
  ".gltf",
] as const;

const DRAWING_ACCEPT_STRING = DRAWING_ACCEPT.join(",");
const DRAWING_FORMAT_GROUPS = [
  {
    label: "이미지",
    extensions: ["PNG", "JPG", "JPEG", "BMP", "TIF", "TIFF", "WEBP"],
  },
  { label: "2D", extensions: ["DWG", "DXF", "PDF"] },
  {
    label: "3D",
    extensions: [
      "SLDPRT",
      "SLDASM",
      "STEP",
      "STP",
      "IGES",
      "IGS",
      "BREP",
      "BRP",
      "STL",
      "OBJ",
      "3MF",
      "FBX",
      "GLB",
      "GLTF",
    ],
  },
] as const;

function isAcceptedDrawingFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return DRAWING_ACCEPT.includes(extension as (typeof DRAWING_ACCEPT)[number]);
}

function splitDrawingFiles(fileList: FileList | File[]) {
  const acceptedFiles: File[] = [];
  const rejectedFiles: File[] = [];

  Array.from(fileList).forEach((file) => {
    if (isAcceptedDrawingFile(file)) {
      acceptedFiles.push(file);
      return;
    }

    rejectedFiles.push(file);
  });

  return { acceptedFiles, rejectedFiles };
}

async function downloadAttachmentFile(item: {
  fileUrl: string | null;
  originalName: string;
}) {
  if (!item.fileUrl) {
    return;
  }

  try {
    const pathname = new URL(item.fileUrl, window.location.origin).pathname;
    const fallbackName = decodeURIComponent(
      pathname.split("/").pop() || item.originalName,
    );
    const response = await fetch(item.fileUrl);

    if (!response.ok) {
      throw new Error("파일 다운로드에 실패했습니다.");
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = item.originalName || fallbackName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    const link = document.createElement("a");
    link.href = item.fileUrl;
    link.download = item.originalName;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

async function triggerDownloads(
  items: Array<{ fileUrl: string | null; originalName: string }>,
) {
  await Promise.all(items.map((item) => downloadAttachmentFile(item)));
}

function toggleSelection(items: string[], itemId: string) {
  return items.includes(itemId)
    ? items.filter((currentId) => currentId !== itemId)
    : [...items, itemId];
}

function SectionHeader({
  title,
  action,
  helperText,
  showLoadingIndicator = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-lg font-semibold text-foreground">{title}</p>
        </div>
        {helperText ? (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {showLoadingIndicator ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            불러오는 중
          </div>
        ) : null}
        {action}
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  action,
  children,
  helperText,
  isDropActive = false,
  isLoading = false,
  showLoadingIndicator = false,
  onDragLeave,
  onDragOver,
  onDrop,
}: SectionBlockProps) {
  return (
    <section
      aria-busy={isLoading}
      className={cn(
        "app-panel rounded-lg p-4 transition-colors",
        isDropActive && "border-primary bg-primary/5",
      )}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <SectionHeader
        action={action}
        helperText={helperText}
        showLoadingIndicator={showLoadingIndicator}
        title={title}
      />
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
      {message}
    </p>
  );
}

function SelectionToolbar({
  canDelete,
  selectedCount,
  hasDownloadable,
  isDeleting,
  onDownload,
  onDelete,
}: {
  canDelete: boolean;
  selectedCount: number;
  hasDownloadable: boolean;
  isDeleting: boolean;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-4 py-2">
      <p className="text-sm font-medium text-foreground">
        {selectedCount}개 선택됨
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          disabled={selectedCount === 0 || !hasDownloadable}
          size="sm"
          type="button"
          variant="outline"
          onClick={onDownload}
        >
          <Download className="size-4" />
          다운로드
        </Button>
        {canDelete ? (
          <Button
            disabled={selectedCount === 0 || isDeleting}
            size="sm"
            type="button"
            variant="outline"
            onClick={onDelete}
          >
            <Trash2 className="size-4 text-destructive" />
            삭제
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function AttachmentTable({
  children,
  isEditable,
  isSelectionMode,
  isAllSelected,
  isIndeterminate,
  onToggleAll,
}: {
  children: React.ReactNode;
  isEditable: boolean;
  isSelectionMode: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-border/70">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/30">
            {isSelectionMode ? (
              <th className="w-10 px-4 py-2">
                <Checkbox
                  aria-label="전체 선택"
                  checked={isIndeterminate ? "indeterminate" : isAllSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>
            ) : null}
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
              파일명
            </th>
            <th className="w-24 px-4 py-2 text-right font-medium text-muted-foreground">
              크기
            </th>
            <th className="w-32 px-4 py-2 text-right font-medium text-muted-foreground">
              날짜
            </th>
            {!isSelectionMode ? (
              <th
                className={cn(
                  "px-4 py-2 text-right font-medium text-muted-foreground",
                  isEditable ? "w-24" : "w-16",
                )}
              >
                액션
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">{children}</tbody>
      </table>
    </div>
  );
}

function DrawingRow({
  drawing,
  isEditable,
  isDeleting,
  isSelectionMode,
  isSelected,
  onDelete,
  onToggleSelected,
}: {
  drawing: PartDrawingAttachmentItem;
  isEditable: boolean;
  isDeleting: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onDelete: (drawingId: string) => void;
  onToggleSelected: (drawingId: string) => void;
}) {
  return (
    <tr
      className={cn(
        "bg-card transition-colors hover:bg-muted/20",
        isSelectionMode && "cursor-pointer",
        isSelected && "bg-primary/5",
      )}
      onClick={
        isSelectionMode
          ? () => onToggleSelected(drawing.drawingId)
          : undefined
      }
    >
      {isSelectionMode ? (
        <td className="w-10 px-4 py-2.5">
          <Checkbox
            aria-label={`${drawing.originalName} 선택`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelected(drawing.drawingId)}
            onClick={(event) => event.stopPropagation()}
          />
        </td>
      ) : null}
      <td className="px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileIcon
            contentType={drawing.contentType}
            name={drawing.originalName}
          />
          <span className="min-w-0 truncate font-medium text-foreground">
            {drawing.originalName}
          </span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">
        {formatFileSize(drawing.fileSize)}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">
        {formatDate(drawing.createdAt)}
      </td>
      {!isSelectionMode ? (
        <td className="px-4 py-2.5">
          <div className="flex items-center justify-end gap-0.5">
            {drawing.fileUrl ? (
              <Button
                aria-label="다운로드"
                size="icon"
                type="button"
                variant="ghost"
                className="size-8"
                onClick={() => {
                  void downloadAttachmentFile(drawing);
                }}
              >
                <Download className="size-4" />
              </Button>
            ) : null}
            {isEditable ? (
              <Button
                aria-label="삭제"
                disabled={isDeleting}
                size="icon"
                type="button"
                variant="ghost"
                className="size-8"
                onClick={() => onDelete(drawing.drawingId)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
}

function FileRow({
  file,
  isEditable,
  isDeleting,
  isSelectionMode,
  isSelected,
  onDelete,
  onToggleSelected,
}: {
  file: PartFileAttachmentItem;
  isEditable: boolean;
  isDeleting: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onDelete: (fileId: string) => void;
  onToggleSelected: (fileId: string) => void;
}) {
  return (
    <tr
      className={cn(
        "bg-card transition-colors hover:bg-muted/20",
        isSelectionMode && "cursor-pointer",
        isSelected && "bg-primary/5",
      )}
      onClick={
        isSelectionMode ? () => onToggleSelected(file.fileId) : undefined
      }
    >
      {isSelectionMode ? (
        <td className="w-10 px-4 py-2.5">
          <Checkbox
            aria-label={`${file.originalName} 선택`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelected(file.fileId)}
            onClick={(event) => event.stopPropagation()}
          />
        </td>
      ) : null}
      <td className="px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <FileIcon contentType={file.contentType} name={file.originalName} />
          <span className="min-w-0 truncate font-medium text-foreground">
            {file.originalName}
          </span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">
        {formatFileSize(file.fileSize)}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-right text-muted-foreground">
        {formatDate(file.createdAt)}
      </td>
      {!isSelectionMode ? (
        <td className="px-4 py-2.5">
          <div className="flex items-center justify-end gap-0.5">
            {file.fileUrl ? (
              <Button
                aria-label="다운로드"
                size="icon"
                type="button"
                variant="ghost"
                className="size-8"
                onClick={() => {
                  void downloadAttachmentFile(file);
                }}
              >
                <Download className="size-4" />
              </Button>
            ) : null}
            {isEditable ? (
              <Button
                aria-label="삭제"
                disabled={isDeleting}
                size="icon"
                type="button"
                variant="ghost"
                className="size-8"
                onClick={() => onDelete(file.fileId)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export function PartAttachmentsTab({
  drawings,
  files,
  isEditable = true,
  isDeleting = false,
  isDrawingUploading = false,
  isFileUploading = false,
  isLoading = false,
  showLoadingIndicator = false,
  onDeleteDrawing,
  onDeleteFile,
  onUploadDrawings,
  onUploadFiles,
  onRejectDrawings,
}: PartAttachmentsTabProps) {
  const drawingInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDropTarget, setActiveDropTarget] = useState<
    "drawing" | "file" | null
  >(null);
  const [isDrawingSelectionMode, setIsDrawingSelectionMode] = useState(false);
  const [isFileSelectionMode, setIsFileSelectionMode] = useState(false);
  const [selectedDrawingIds, setSelectedDrawingIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<
    | { id: string; kind: "drawing"; name: string }
    | { id: string; kind: "file"; name: string }
    | { kind: "drawing-selection"; count: number; ids: string[] }
    | { kind: "file-selection"; count: number; ids: string[] }
    | null
  >(null);

  useEffect(() => {
    if (drawings.length === 0) {
      setIsDrawingSelectionMode(false);
      setSelectedDrawingIds([]);
      return;
    }

    const drawingIds = new Set(drawings.map((d) => d.drawingId));
    setSelectedDrawingIds((current) =>
      current.filter((id) => drawingIds.has(id)),
    );
  }, [drawings]);

  useEffect(() => {
    if (files.length === 0) {
      setIsFileSelectionMode(false);
      setSelectedFileIds([]);
      return;
    }

    const fileIds = new Set(files.map((f) => f.fileId));
    setSelectedFileIds((current) =>
      current.filter((id) => fileIds.has(id)),
    );
  }, [files]);

  function clearDrawingSelection() {
    setSelectedDrawingIds([]);
    setIsDrawingSelectionMode(false);
  }

  function clearFileSelection() {
    setSelectedFileIds([]);
    setIsFileSelectionMode(false);
  }

  function handleSectionDragOver(
    target: "drawing" | "file",
    event: DragEvent<HTMLElement>,
  ) {
    if (
      isLoading ||
      (target === "drawing"
        ? !isEditable || isDrawingUploading
        : !isEditable || isFileUploading)
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setActiveDropTarget(target);
  }

  function handleSectionDragLeave(
    target: "drawing" | "file",
    event: DragEvent<HTMLElement>,
  ) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    if (activeDropTarget === target) {
      setActiveDropTarget(null);
    }
  }

  async function handleDrawingDrop(event: DragEvent<HTMLElement>) {
    if (isLoading || !isEditable || isDrawingUploading) {
      return;
    }

    event.preventDefault();
    setActiveDropTarget(null);
    const { acceptedFiles, rejectedFiles } = splitDrawingFiles(
      event.dataTransfer.files,
    );

    if (rejectedFiles.length > 0) {
      onRejectDrawings?.({ acceptedFiles, rejectedFiles });
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    await Promise.resolve(onUploadDrawings(acceptedFiles));
  }

  async function handleFileDrop(event: DragEvent<HTMLElement>) {
    if (isLoading || !isEditable || isFileUploading) {
      return;
    }

    event.preventDefault();
    setActiveDropTarget(null);
    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length === 0) {
      return;
    }

    await Promise.resolve(onUploadFiles(droppedFiles));
  }

  const isDrawingAllSelected =
    drawings.length > 0 && selectedDrawingIds.length === drawings.length;
  const isDrawingIndeterminate =
    selectedDrawingIds.length > 0 &&
    selectedDrawingIds.length < drawings.length;

  const isFileAllSelected =
    files.length > 0 && selectedFileIds.length === files.length;
  const isFileIndeterminate =
    selectedFileIds.length > 0 && selectedFileIds.length < files.length;

  return (
    <>
      <div className="space-y-4">
        <SectionBlock
          helperText={
            isEditable
              ? "여러 파일을 끌어다 놓거나 선택해 바로 연결할 수 있습니다."
              : undefined
          }
          isDropActive={activeDropTarget === "drawing"}
          isDropDisabled={!isEditable || isDrawingUploading || isLoading}
          isLoading={isLoading}
          onDragLeave={(event) => handleSectionDragLeave("drawing", event)}
          onDragOver={(event) => handleSectionDragOver("drawing", event)}
          onDrop={(event) => {
            void handleDrawingDrop(event);
          }}
          showLoadingIndicator={showLoadingIndicator}
          title={
            <>
              도면
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="지원되는 도면 파일 형식 보기"
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    type="button"
                  >
                    <CircleAlert className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="w-[19rem] max-w-[calc(100vw-2rem)] rounded-xl px-3 py-2.5 text-left shadow-lg"
                  hideArrow
                  side="right"
                  sideOffset={6}
                >
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-background/75">
                      지원 포맷
                    </p>
                    {DRAWING_FORMAT_GROUPS.map((group) => (
                      <div
                        key={group.label}
                        className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-2"
                      >
                        <span className="pt-0.5 text-[10px] font-semibold leading-4 text-background/75">
                          {group.label}
                        </span>
                        <span className="whitespace-normal break-words text-[10px] leading-4 text-background/90">
                          {group.extensions.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </>
          }
          action={
            <div className="flex items-center gap-1.5">
              {drawings.length > 0 ? (
                <Button
                  disabled={isLoading}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isDrawingSelectionMode) {
                      clearDrawingSelection();
                      return;
                    }

                    setIsDrawingSelectionMode(true);
                  }}
                >
                  {isDrawingSelectionMode ? "취소" : "선택"}
                </Button>
              ) : null}
              {isEditable ? (
                <Button
                  disabled={isDrawingUploading || isLoading}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => drawingInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  도면 추가
                </Button>
              ) : null}
            </div>
          }
        >
          <input
            ref={drawingInputRef}
            accept={DRAWING_ACCEPT_STRING}
            aria-label="부품 도면 업로드"
            className="hidden"
            multiple
            type="file"
            onChange={async (event) => {
              const { acceptedFiles, rejectedFiles } = splitDrawingFiles(
                event.target.files ?? [],
              );

              if (rejectedFiles.length > 0) {
                onRejectDrawings?.({ acceptedFiles, rejectedFiles });
              }

              if (acceptedFiles.length === 0) {
                return;
              }

              try {
                await Promise.resolve(onUploadDrawings(acceptedFiles));
              } finally {
                event.target.value = "";
              }
            }}
          />

          {isDrawingSelectionMode ? (
            <SelectionToolbar
              canDelete={isEditable}
              selectedCount={selectedDrawingIds.length}
              hasDownloadable={
                drawings.some(
                  (d) =>
                    selectedDrawingIds.includes(d.drawingId) && d.fileUrl,
                )
              }
              isDeleting={isDeleting}
              onDownload={() => {
                const selected = drawings.filter(
                  (d) =>
                    selectedDrawingIds.includes(d.drawingId) && d.fileUrl,
                );
                void triggerDownloads(selected);
                clearDrawingSelection();
              }}
              onDelete={() =>
                setPendingDelete({
                  kind: "drawing-selection",
                  count: selectedDrawingIds.length,
                  ids: selectedDrawingIds,
                })
              }
            />
          ) : null}

          {drawings.length === 0 ? (
            <EmptyState message="등록된 도면이 없습니다." />
          ) : (
            <AttachmentTable
              isEditable={isEditable}
              isSelectionMode={isDrawingSelectionMode}
              isAllSelected={isDrawingAllSelected}
              isIndeterminate={isDrawingIndeterminate}
              onToggleAll={() => {
                if (isDrawingAllSelected) {
                  setSelectedDrawingIds([]);
                } else {
                  setSelectedDrawingIds(
                    drawings.map((d) => d.drawingId),
                  );
                }
              }}
            >
              {drawings.map((drawing) => (
                <DrawingRow
                  key={drawing.drawingId}
                  drawing={drawing}
                  isEditable={isEditable}
                  isDeleting={isDeleting}
                  isSelectionMode={isDrawingSelectionMode}
                  isSelected={selectedDrawingIds.includes(drawing.drawingId)}
                  onDelete={(drawingId) =>
                    setPendingDelete({
                      id: drawingId,
                      kind: "drawing",
                      name: drawing.originalName,
                    })
                  }
                  onToggleSelected={(drawingId) =>
                    setSelectedDrawingIds((current) =>
                      toggleSelection(current, drawingId),
                    )
                  }
                />
              ))}
            </AttachmentTable>
          )}
        </SectionBlock>

        <SectionBlock
          helperText={
            isEditable
              ? "여러 파일을 끌어다 놓거나 선택해 바로 연결할 수 있습니다."
              : undefined
          }
          isDropActive={activeDropTarget === "file"}
          isDropDisabled={!isEditable || isFileUploading || isLoading}
          isLoading={isLoading}
          onDragLeave={(event) => handleSectionDragLeave("file", event)}
          onDragOver={(event) => handleSectionDragOver("file", event)}
          onDrop={(event) => {
            void handleFileDrop(event);
          }}
          title="일반 파일"
          action={
            <div className="flex items-center gap-1.5">
              {files.length > 0 ? (
                <Button
                  disabled={isLoading}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (isFileSelectionMode) {
                      clearFileSelection();
                      return;
                    }

                    setIsFileSelectionMode(true);
                  }}
                >
                  {isFileSelectionMode ? "취소" : "선택"}
                </Button>
              ) : null}
              {isEditable ? (
                <Button
                  disabled={isFileUploading || isLoading}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  파일 추가
                </Button>
              ) : null}
            </div>
          }
        >
          <input
            ref={fileInputRef}
            aria-label="부품 일반 파일 업로드"
            className="hidden"
            multiple
            type="file"
            onChange={async (event) => {
              const nextFiles = Array.from(event.target.files ?? []);

              if (nextFiles.length === 0) {
                return;
              }

              try {
                await Promise.resolve(onUploadFiles(nextFiles));
              } finally {
                event.target.value = "";
              }
            }}
          />

          {isFileSelectionMode ? (
            <SelectionToolbar
              canDelete={isEditable}
              selectedCount={selectedFileIds.length}
              hasDownloadable={
                files.some(
                  (f) => selectedFileIds.includes(f.fileId) && f.fileUrl,
                )
              }
              isDeleting={isDeleting}
              onDownload={() => {
                const selected = files.filter(
                  (f) => selectedFileIds.includes(f.fileId) && f.fileUrl,
                );
                void triggerDownloads(selected);
                clearFileSelection();
              }}
              onDelete={() =>
                setPendingDelete({
                  kind: "file-selection",
                  count: selectedFileIds.length,
                  ids: selectedFileIds,
                })
              }
            />
          ) : null}

          {files.length === 0 ? (
            <EmptyState message="등록된 일반 파일이 없습니다." />
          ) : (
            <AttachmentTable
              isEditable={isEditable}
              isSelectionMode={isFileSelectionMode}
              isAllSelected={isFileAllSelected}
              isIndeterminate={isFileIndeterminate}
              onToggleAll={() => {
                if (isFileAllSelected) {
                  setSelectedFileIds([]);
                } else {
                  setSelectedFileIds(files.map((f) => f.fileId));
                }
              }}
            >
              {files.map((file) => (
                <FileRow
                  key={file.fileId}
                  file={file}
                  isEditable={isEditable}
                  isDeleting={isDeleting}
                  isSelectionMode={isFileSelectionMode}
                  isSelected={selectedFileIds.includes(file.fileId)}
                  onDelete={(fileId) =>
                    setPendingDelete({
                      id: fileId,
                      kind: "file",
                      name: file.originalName,
                    })
                  }
                  onToggleSelected={(fileId) =>
                    setSelectedFileIds((current) =>
                      toggleSelection(current, fileId),
                    )
                  }
                />
              ))}
            </AttachmentTable>
          )}
        </SectionBlock>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={
          pendingDelete?.kind === "drawing"
            ? "도면을 삭제할까요?"
            : pendingDelete?.kind === "drawing-selection"
              ? "선택한 도면을 삭제할까요?"
              : pendingDelete?.kind === "file-selection"
                ? "선택한 파일을 삭제할까요?"
                : "파일을 삭제할까요?"
        }
        description={
          pendingDelete
            ? "name" in pendingDelete
              ? `${pendingDelete.name} 연결을 제거합니다.`
              : `선택한 ${pendingDelete.count}개 연결을 제거합니다.`
            : "선택한 파일 연결을 제거합니다."
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        variant="destructive"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) {
            return;
          }

          if (pendingDelete.kind === "drawing") {
            await Promise.resolve(onDeleteDrawing(pendingDelete.id));
            clearDrawingSelection();
          } else if (pendingDelete.kind === "file") {
            await Promise.resolve(onDeleteFile(pendingDelete.id));
            clearFileSelection();
          } else if (pendingDelete.kind === "drawing-selection") {
            for (const drawingId of pendingDelete.ids) {
              await Promise.resolve(onDeleteDrawing(drawingId));
            }

            clearDrawingSelection();
          } else {
            for (const fileId of pendingDelete.ids) {
              await Promise.resolve(onDeleteFile(fileId));
            }

            clearFileSelection();
          }

          setPendingDelete(null);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
}
