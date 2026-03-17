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

export interface FileIconExtensionRule {
  kind: FileIconKind;
  label: string;
  extensions: readonly string[];
}

const DOCUMENT_EXTENSIONS = ["doc", "docx", "hwp", "hwpx", "odt", "rtf", "txt", "md"] as const;
const STEP_EXTENSIONS = [
  "step",
  "stp",
  "iges",
  "igs",
  "stl",
  "obj",
  "3mf",
  "fbx",
  "glb",
  "gltf",
] as const;
const DWG_EXTENSIONS = ["dwg", "dxf"] as const;
const SPREADSHEET_EXTENSIONS = ["csv", "xls", "xlsx", "ods"] as const;
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "tif", "tiff", "heic", "heif"] as const;
const AUDIO_EXTENSIONS = ["mp3", "wav", "flac", "aac", "m4a", "ogg"] as const;
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm"] as const;
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz", "bz2"] as const;
const CODE_EXTENSIONS = ["json", "xml", "yaml", "yml", "js", "jsx", "ts", "tsx", "html", "css"] as const;

export const FILE_ICON_EXTENSION_RULES: ReadonlyArray<FileIconExtensionRule> = [
  { kind: "pdf", label: "PDF", extensions: ["pdf"] },
  { kind: "document", label: "문서", extensions: DOCUMENT_EXTENSIONS },
  { kind: "step", label: "3D CAD", extensions: STEP_EXTENSIONS },
  { kind: "dwg", label: "2D CAD", extensions: DWG_EXTENSIONS },
  { kind: "xlsx", label: "스프레드시트", extensions: SPREADSHEET_EXTENSIONS },
  { kind: "image", label: "이미지", extensions: IMAGE_EXTENSIONS },
  { kind: "audio", label: "오디오", extensions: AUDIO_EXTENSIONS },
  { kind: "video", label: "비디오", extensions: VIDEO_EXTENSIONS },
  { kind: "archive", label: "압축", extensions: ARCHIVE_EXTENSIONS },
  { kind: "code", label: "구조화 데이터", extensions: CODE_EXTENSIONS },
] as const;

const DOCUMENT_EXTENSION_SET = new Set<string>(DOCUMENT_EXTENSIONS);
const STEP_EXTENSION_SET = new Set<string>(STEP_EXTENSIONS);
const DWG_EXTENSION_SET = new Set<string>(DWG_EXTENSIONS);
const SPREADSHEET_EXTENSION_SET = new Set<string>(SPREADSHEET_EXTENSIONS);
const IMAGE_EXTENSION_SET = new Set<string>(IMAGE_EXTENSIONS);
const AUDIO_EXTENSION_SET = new Set<string>(AUDIO_EXTENSIONS);
const VIDEO_EXTENSION_SET = new Set<string>(VIDEO_EXTENSIONS);
const ARCHIVE_EXTENSION_SET = new Set<string>(ARCHIVE_EXTENSIONS);
const CODE_EXTENSION_SET = new Set<string>(CODE_EXTENSIONS);

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
    DOCUMENT_EXTENSION_SET.has(extension)
  ) {
    return "document";
  }

  if (
    normalizedContentType.startsWith("model/") ||
    normalizedContentType.includes("step") ||
    normalizedContentType.includes("stp") ||
    normalizedContentType.includes("iges") ||
    normalizedContentType.includes("igs") ||
    normalizedContentType.includes("stl") ||
    normalizedContentType.includes("obj") ||
    normalizedContentType.includes("gltf") ||
    STEP_EXTENSION_SET.has(extension)
  ) {
    return "step";
  }

  if (normalizedContentType.includes("dwg") || normalizedContentType.includes("dxf") || DWG_EXTENSION_SET.has(extension)) {
    return "dwg";
  }

  if (
    normalizedContentType.includes("spreadsheet") ||
    normalizedContentType.includes("sheet") ||
    normalizedContentType.includes("excel") ||
    normalizedContentType.includes("csv") ||
    SPREADSHEET_EXTENSION_SET.has(extension)
  ) {
    return "xlsx";
  }

  if (normalizedContentType.startsWith("image/") || IMAGE_EXTENSION_SET.has(extension)) {
    return "image";
  }

  if (normalizedContentType.startsWith("audio/") || AUDIO_EXTENSION_SET.has(extension)) {
    return "audio";
  }

  if (normalizedContentType.startsWith("video/") || VIDEO_EXTENSION_SET.has(extension)) {
    return "video";
  }

  if (
    normalizedContentType.includes("zip") ||
    normalizedContentType.includes("archive") ||
    normalizedContentType.includes("compressed") ||
    ARCHIVE_EXTENSION_SET.has(extension)
  ) {
    return "archive";
  }

  if (
    normalizedContentType.includes("json") ||
    normalizedContentType.includes("xml") ||
    normalizedContentType.includes("javascript") ||
    normalizedContentType.includes("typescript") ||
    normalizedContentType.includes("yaml") ||
    CODE_EXTENSION_SET.has(extension)
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
