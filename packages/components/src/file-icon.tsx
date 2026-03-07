import {
  Box,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FilePen,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@fabbit/ui";

export type FileIconKind =
  | "pdf"
  | "document"
  | "step"
  | "dwg"
  | "xlsx"
  | "image"
  | "audio"
  | "video"
  | "archive"
  | "code"
  | "other";

const DOCUMENT_EXTENSIONS = new Set(["doc", "docx", "hwp", "hwpx", "odt", "rtf", "txt", "md"]);
const STEP_EXTENSIONS = new Set(["step", "stp"]);
const DWG_EXTENSIONS = new Set(["dwg", "dxf"]);
const SPREADSHEET_EXTENSIONS = new Set(["csv", "xls", "xlsx", "ods"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tif", "tiff", "heic", "heif"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "flac", "aac", "m4a", "ogg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "avi", "mkv", "webm"]);
const ARCHIVE_EXTENSIONS = new Set(["zip", "rar", "7z", "tar", "gz", "bz2"]);
const CODE_EXTENSIONS = new Set(["json", "xml", "yaml", "yml", "js", "jsx", "ts", "tsx", "html", "css"]);

const FILE_ICON_META: Record<FileIconKind, { Icon: LucideIcon; className: string }> = {
  pdf: {
    Icon: File,
    className: "text-[var(--file-icon-pdf)]",
  },
  document: {
    Icon: FileText,
    className: "text-[var(--file-icon-document)]",
  },
  step: {
    Icon: Box,
    className: "text-[var(--file-icon-cad)]",
  },
  dwg: {
    Icon: FilePen,
    className: "text-[var(--file-icon-cad)]",
  },
  xlsx: {
    Icon: FileSpreadsheet,
    className: "text-[var(--file-icon-sheet)]",
  },
  image: {
    Icon: FileImage,
    className: "text-[var(--file-icon-image)]",
  },
  audio: {
    Icon: FileAudio,
    className: "text-[var(--file-icon-image)]",
  },
  video: {
    Icon: FileVideo,
    className: "text-[var(--file-icon-image)]",
  },
  archive: {
    Icon: FileArchive,
    className: "text-[var(--file-icon-archive)]",
  },
  code: {
    Icon: FileCode,
    className: "text-[var(--file-icon-code)]",
  },
  other: {
    Icon: File,
    className: "text-muted-foreground",
  },
};

function normalizeExtension(name?: string | null) {
  return name?.split(".").pop()?.toLowerCase() ?? "";
}

export interface ResolveFileIconKindOptions {
  contentType?: string | null;
  kind?: FileIconKind;
  name?: string | null;
}

export function resolveFileIconKind({
  contentType,
  kind,
  name,
}: ResolveFileIconKindOptions): FileIconKind {
  if (kind) {
    return kind;
  }

  const normalizedContentType = contentType?.toLowerCase() ?? "";
  const extension = normalizeExtension(name);

  if (normalizedContentType.includes("pdf") || extension === "pdf") return "pdf";

  if (
    normalizedContentType.includes("msword") ||
    normalizedContentType.includes("wordprocessingml") ||
    normalizedContentType.includes("haansoft") ||
    normalizedContentType.includes("hwp") ||
    normalizedContentType.includes("hwpx") ||
    DOCUMENT_EXTENSIONS.has(extension)
  ) {
    return "document";
  }

  if (normalizedContentType.includes("step") || normalizedContentType.includes("stp") || STEP_EXTENSIONS.has(extension)) {
    return "step";
  }

  if (normalizedContentType.includes("dwg") || normalizedContentType.includes("dxf") || DWG_EXTENSIONS.has(extension)) {
    return "dwg";
  }

  if (
    normalizedContentType.includes("spreadsheet") ||
    normalizedContentType.includes("sheet") ||
    normalizedContentType.includes("excel") ||
    normalizedContentType.includes("csv") ||
    SPREADSHEET_EXTENSIONS.has(extension)
  ) {
    return "xlsx";
  }

  if (normalizedContentType.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (normalizedContentType.startsWith("audio/") || AUDIO_EXTENSIONS.has(extension)) {
    return "audio";
  }

  if (normalizedContentType.startsWith("video/") || VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  if (
    normalizedContentType.includes("zip") ||
    normalizedContentType.includes("archive") ||
    normalizedContentType.includes("compressed") ||
    ARCHIVE_EXTENSIONS.has(extension)
  ) {
    return "archive";
  }

  if (
    normalizedContentType.includes("json") ||
    normalizedContentType.includes("xml") ||
    normalizedContentType.includes("javascript") ||
    normalizedContentType.includes("typescript") ||
    normalizedContentType.includes("yaml") ||
    CODE_EXTENSIONS.has(extension)
  ) {
    return "code";
  }

  return "other";
}

export interface FileIconProps extends ResolveFileIconKindOptions {
  className?: string;
}

export function FileIcon({ className, contentType, kind, name }: FileIconProps) {
  const resolvedKind = resolveFileIconKind({ contentType, kind, name });
  const { Icon, className: iconClassName } = FILE_ICON_META[resolvedKind];

  return <Icon className={cn("h-4 w-4 shrink-0", iconClassName, className)} />;
}
