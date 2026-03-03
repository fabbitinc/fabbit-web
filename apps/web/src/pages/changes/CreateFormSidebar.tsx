import { useState, useImperativeHandle, forwardRef, useRef, useCallback } from "react";
import { Plus, X, FileText, FileSpreadsheet, Image, File, Box, FilePen } from "lucide-react";
import {
  useLookupMembers,
  useLookupLabels,
  useLookupParts,
} from "@/api/hooks/useLookup";
import {
  MemberPickerSection,
  LabelPickerSection,
  PartPickerSection,
} from "@/components/sidebar-pickers";

/** 파일 타입별 아이콘 */
function FileIcon({ name }: { name: string }) {
  const cls = "h-4 w-4 shrink-0";
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className={`${cls} text-red-500`} />;
    case "step":
    case "stp":
      return <Box className={`${cls} text-blue-500`} />;
    case "dwg":
      return <FilePen className={`${cls} text-amber-500`} />;
    case "xlsx":
    case "xls":
    case "csv":
      return <FileSpreadsheet className={`${cls} text-emerald-500`} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return <Image className={`${cls} text-purple-500`} />;
    default:
      return <File className={`${cls} text-muted-foreground`} />;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface CreateFormSidebarHandle {
  assigneeIds: string[];
  reviewerIds: string[];
  labelIds: string[];
  partIds: string[];
  files: File[];
}

interface CreateFormSidebarProps {
  showReviewers?: boolean;
}

export const CreateFormSidebar = forwardRef<CreateFormSidebarHandle, CreateFormSidebarProps>(
  function CreateFormSidebar({ showReviewers = false }, ref) {
    // 담당자
    const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
    const [membersEnabled, setMembersEnabled] = useState(false);
    const { data: membersData } = useLookupMembers({ enabled: membersEnabled });
    const members = membersData ?? [];

    // 검토자
    const [reviewerIds, setReviewerIds] = useState<string[]>([]);
    const [reviewerMembersEnabled, setReviewerMembersEnabled] = useState(false);
    const { data: reviewerMembersData } = useLookupMembers({ enabled: showReviewers && reviewerMembersEnabled });
    const reviewerMembers = reviewerMembersData ?? [];

    // 라벨
    const [labelIds, setLabelIds] = useState<string[]>([]);
    const [labelsEnabled, setLabelsEnabled] = useState(false);
    const { data: labelsData } = useLookupLabels({ enabled: labelsEnabled });
    const labels = labelsData ?? [];

    // 부품
    const [partIds, setPartIds] = useState<string[]>([]);
    const [partsEnabled, setPartsEnabled] = useState(false);
    const [partsSearch, setPartsSearch] = useState("");
    const { data: partsData, isFetching: isPartsSearching } = useLookupParts(
      partsSearch,
      { enabled: partsEnabled },
    );
    const searchedParts = partsData ?? [];

    // 선택 후 검색어 변경 시 이미 선택된 부품이 사라지는 것을 방지하기 위한 캐시
    const partCacheRef = useRef<Map<string, { id: string; partNumber: string; name: string | null }>>(new Map());
    for (const p of searchedParts) {
      partCacheRef.current.set(p.id, { id: p.id, partNumber: p.partNumber, name: p.name });
    }

    const displayParts = partIds
      .map((id) => partCacheRef.current.get(id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, partNumber: p!.partNumber, name: p!.name ?? "" }));

    const mergedSearchedParts = searchedParts.map((p) => ({
      id: p.id,
      partNumber: p.partNumber,
      name: p.name,
    }));

    const handlePartsSync = useCallback((ids: string[]) => {
      setPartIds(ids);
    }, []);

    // 첨부파일
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ref로 현재 선택 상태 노출
    useImperativeHandle(ref, () => ({
      get assigneeIds() { return assigneeIds; },
      get reviewerIds() { return reviewerIds; },
      get labelIds() { return labelIds; },
      get partIds() { return partIds; },
      get files() { return files; },
    }), [assigneeIds, reviewerIds, labelIds, partIds, files]);

    return (
      <>
        {showReviewers && (
          <MemberPickerSection
            label="검토자"
            applyLabel="검토자 적용"
            availableMembers={reviewerMembers.map((m) => ({ id: m.id, name: m.fullName, email: m.email }))}
            selectedIds={reviewerIds}
            displayItems={
              reviewerIds
                .map((id) => reviewerMembers.find((m) => m.id === id))
                .filter(Boolean)
                .map((m) => ({ id: m!.id, name: m!.fullName }))
            }
            onSync={setReviewerIds}
            onRequestMembers={() => setReviewerMembersEnabled(true)}
          />
        )}

        <MemberPickerSection
          label="담당자"
          applyLabel="담당자 적용"
          availableMembers={members.map((m) => ({ id: m.id, name: m.fullName, email: m.email }))}
          selectedIds={assigneeIds}
          displayItems={
            assigneeIds
              .map((id) => members.find((m) => m.id === id))
              .filter(Boolean)
              .map((m) => ({ id: m!.id, name: m!.fullName }))
          }
          onSync={setAssigneeIds}
          onRequestMembers={() => setMembersEnabled(true)}
        />

        <LabelPickerSection
          availableLabels={labels.map((l) => ({ id: l.id, name: l.name, colorHex: l.color }))}
          selectedIds={labelIds}
          displayLabels={
            labelIds
              .map((id) => labels.find((l) => l.id === id))
              .filter(Boolean)
              .map((l) => ({ id: l!.id, name: l!.name, colorHex: l!.color }))
          }
          onSync={setLabelIds}
          onRequestLabels={() => setLabelsEnabled(true)}
        />

        <PartPickerSection
          searchedParts={mergedSearchedParts}
          selectedIds={partIds}
          displayParts={displayParts}
          onSync={handlePartsSync}
          onRequestParts={() => setPartsEnabled(true)}
          onSearchChange={setPartsSearch}
          isSearching={isPartsSearching}
        />

        {/* 첨부파일 */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground">
              첨부파일
              {files.length > 0 && (
                <span className="ml-1 text-muted-foreground/50">
                  ({files.length})
                </span>
              )}
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []);
                if (selected.length > 0) {
                  setFiles((prev) => [...prev, ...selected]);
                }
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          {files.length > 0 ? (
            <div className="mt-2 space-y-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
                >
                  <FileIcon name={file.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="hidden shrink-0 rounded p-0.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive group-hover:inline-flex cursor-pointer"
                    onClick={() => {
                      setFiles((prev) => prev.filter((_, i) => i !== idx));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground/50">
              첨부된 파일 없음
            </p>
          )}
        </div>
      </>
    );
  },
);
