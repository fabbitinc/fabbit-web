import { useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listCategories,
  renameCategory,
  listDefaultOwners,
  upsertDefaultOwner,
  deleteDefaultOwner,
  getPartFilterOptions,
  listParts,
  lookupParts,
  getPartDetail,
  getPartBom,
  getPartBomTree,
  getPartSuppliers,
  getPartFiles,
  getPartProjects,
  getPartOwner,
  updatePartOwner,
  registerDrawingForPart,
  deleteDrawingFromPart,
  attachFilesToPart,
  detachFileFromPart,
} from "../parts";
import {
  createFileUpload,
  uploadFileToPresignedUrl,
  completeFileUpload,
  uploadFiles,
} from "../file";
import type {
  ListPartsParams,
  LookupPartsParams,
  UpdatePartOwnerRequest,
  RenameCategoryRequest,
  PartDefaultOwnerRequest,
  PartDetailResponse,
  RegisterDrawingResponse,
} from "../types/parts";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;
export const DEFAULT_OWNERS_QUERY_KEY = ["defaultOwners"] as const;
export const PART_FILTER_OPTIONS_QUERY_KEY = ["partFilterOptions"] as const;
export const PARTS_QUERY_KEY = ["parts"] as const;
export const PART_DETAIL_QUERY_KEY = ["partDetail"] as const;
export const PART_BOM_QUERY_KEY = ["partBom"] as const;
export const PART_BOM_TREE_QUERY_KEY = ["partBomTree"] as const;
export const PART_SUPPLIERS_QUERY_KEY = ["partSuppliers"] as const;
export const PART_FILES_QUERY_KEY = ["partFiles"] as const;
export const PART_PROJECTS_QUERY_KEY = ["partProjects"] as const;
export const PART_OWNER_QUERY_KEY = ["partOwner"] as const;

/** 카테고리 목록 조회 훅 (부품 개수 포함) */
export function useCategories() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY],
    queryFn: listCategories,
  });
}

/** 카테고리 이름 변경 mutation */
export function useRenameCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, request }: { category: string; request: RenameCategoryRequest }) =>
      renameCategory(category, request),
    onSuccess: () => {
      toast.success("카테고리 이름이 변경되었습니다");
      queryClient.invalidateQueries({ queryKey: [...CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...DEFAULT_OWNERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: PART_FILTER_OPTIONS_QUERY_KEY });
    },
    onError: () => {
      toast.error("카테고리 이름 변경에 실패했습니다");
    },
  });
}

/** 기본 담당 설정 목록 조회 훅 */
export function useDefaultOwners() {
  return useQuery({
    queryKey: [...DEFAULT_OWNERS_QUERY_KEY],
    queryFn: listDefaultOwners,
  });
}

/** 기본 담당 설정 upsert mutation */
export function useUpsertDefaultOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PartDefaultOwnerRequest) => upsertDefaultOwner(request),
    onSuccess: () => {
      toast.success("기본 담당 설정이 저장되었습니다");
      queryClient.invalidateQueries({ queryKey: [...DEFAULT_OWNERS_QUERY_KEY] });
    },
    onError: () => {
      toast.error("기본 담당 설정 저장에 실패했습니다");
    },
  });
}

/** 기본 담당 설정 삭제 mutation */
export function useDeleteDefaultOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category?: string | null) => deleteDefaultOwner(category),
    onSuccess: () => {
      toast.success("기본 담당 설정이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: [...DEFAULT_OWNERS_QUERY_KEY] });
    },
    onError: () => {
      toast.error("기본 담당 설정 삭제에 실패했습니다");
    },
  });
}

/** Part 필터 옵션 조회 훅 */
export function usePartFilterOptions() {
  return useQuery({
    queryKey: PART_FILTER_OPTIONS_QUERY_KEY,
    queryFn: getPartFilterOptions,
  });
}

/** Part 목록 조회 훅 */
export function useParts(params: ListPartsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PARTS_QUERY_KEY, params],
    queryFn: () => listParts(params),
    enabled: options?.enabled,
  });
}

export const PART_LOOKUP_QUERY_KEY = ["partLookup"] as const;

/** 부품 Lookup 조회 훅 (picker용, exclude_linked 지원) */
export function useLookupParts(params: LookupPartsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PART_LOOKUP_QUERY_KEY, params],
    queryFn: () => lookupParts(params),
    enabled: options?.enabled,
  });
}

const CONVERSION_POLL_INTERVAL = 1_000;
const CONVERSION_POLL_TIMEOUT = 1 * 60 * 1000;

interface PendingDrawingTracker {
  drawingId: string;
  drawingNumber: string;
  name: string;
  startedAt: number;
}

const pendingDrawingTrackerByPart = new Map<string, PendingDrawingTracker>();

function getPendingDrawingTracker(partId: string | undefined) {
  if (!partId) return null;
  return pendingDrawingTrackerByPart.get(partId) ?? null;
}

function clearPendingDrawingTracker(partId: string | undefined) {
  if (!partId) return;
  pendingDrawingTrackerByPart.delete(partId);
}

function trackPendingDrawing(
  partId: string | undefined,
  drawing: RegisterDrawingResponse,
) {
  if (!partId) return;
  pendingDrawingTrackerByPart.set(partId, {
    drawingId: drawing.drawing_id,
    drawingNumber: drawing.drawing_number,
    name: drawing.name,
    startedAt: Date.now(),
  });
}

function createPendingDrawing(
  tracker: PendingDrawingTracker,
  currentDrawing: PartDetailResponse["drawing"],
) {
  if (currentDrawing?.id === tracker.drawingId) {
    return {
      ...currentDrawing,
      conversion_status: "PENDING",
    };
  }

  return {
    id: tracker.drawingId,
    drawing_number: tracker.drawingNumber,
    name: tracker.name,
    version: null,
    status: null,
    conversion_status: "PENDING",
    thumbnail_url: null,
    pdf_url: null,
    original_file_url: null,
  };
}

/** Part 상세 조회 훅 (도면 변환 PENDING 시 자동 폴링) */
export function usePartDetail(partId: string | undefined) {
  const pollStartRef = useRef<number | null>(null);
  const pendingDrawingTracker = getPendingDrawingTracker(partId);

  const query = useQuery({
    queryKey: [...PART_DETAIL_QUERY_KEY, partId],
    queryFn: () => getPartDetail(partId!),
    enabled: !!partId,
  });

  const data = useMemo(() => {
    if (!query.data || !pendingDrawingTracker) {
      return query.data;
    }

    const currentDrawing = query.data.drawing;
    const hasSettledTrackedDrawing =
      currentDrawing?.id === pendingDrawingTracker.drawingId &&
      currentDrawing.conversion_status != null &&
      currentDrawing.conversion_status !== "PENDING";

    if (hasSettledTrackedDrawing) {
      return query.data;
    }

    return {
      ...query.data,
      drawing: createPendingDrawing(pendingDrawingTracker, currentDrawing),
    };
  }, [pendingDrawingTracker, query.data]);

  const conversionStatus = data?.drawing?.conversion_status;
  const isPending = conversionStatus === "PENDING";
  const { refetch } = query;

  // 업로드 직후 상세 응답이 늦게 따라와도 polling을 유지한다.
  useEffect(() => {
    if (isPending) {
      pollStartRef.current =
        pendingDrawingTracker?.startedAt ?? pollStartRef.current ?? Date.now();
    } else if (!isPending) {
      pollStartRef.current = null;
    }
  }, [isPending, pendingDrawingTracker?.startedAt]);

  // PENDING인 동안 주기적으로 refetch하고, 완료/실패가 확인되면 추적을 정리한다.
  useEffect(() => {
    if (!partId || !isPending) return;

    const id = setInterval(() => {
      if (
        pollStartRef.current &&
        Date.now() - pollStartRef.current > CONVERSION_POLL_TIMEOUT
      ) {
        clearPendingDrawingTracker(partId);
        clearInterval(id);
        void refetch();
        return;
      }

      void refetch().then((result) => {
        const trackedDrawing = getPendingDrawingTracker(partId);
        const nextDrawing = result.data?.drawing;

        if (
          trackedDrawing &&
          nextDrawing?.id === trackedDrawing.drawingId &&
          nextDrawing.conversion_status &&
          nextDrawing.conversion_status !== "PENDING"
        ) {
          clearPendingDrawingTracker(partId);
        }
      });
    }, CONVERSION_POLL_INTERVAL);

    return () => clearInterval(id);
  }, [isPending, partId, refetch]);

  return {
    ...query,
    data,
  };
}

/** 부품이 속한 프로젝트 목록 조회 훅 */
export function usePartProjects(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_PROJECTS_QUERY_KEY, partId],
    queryFn: () => getPartProjects(partId!),
    enabled: !!partId,
  });
}

/** Part BOM 조회 훅 (children + parents) */
export function usePartBom(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_BOM_QUERY_KEY, partId],
    queryFn: () => getPartBom(partId!),
    enabled: !!partId,
  });
}

/** Part 공급사 조회 훅 */
export function usePartSuppliers(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_SUPPLIERS_QUERY_KEY, partId],
    queryFn: () => getPartSuppliers(partId!),
    enabled: !!partId,
  });
}

/** Part 첨부 파일 조회 훅 */
export function usePartFiles(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_FILES_QUERY_KEY, partId],
    queryFn: () => getPartFiles(partId!),
    enabled: !!partId,
  });
}

/** Part 담당자/팀 조회 훅 */
export function usePartOwner(partId: string | undefined) {
  return useQuery({
    queryKey: [...PART_OWNER_QUERY_KEY, partId],
    queryFn: () => getPartOwner(partId!),
    enabled: !!partId,
  });
}

/** Part 담당자/팀 수정 mutation */
export function useUpdatePartOwner(partId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePartOwnerRequest) => updatePartOwner(partId!, request),
    onSuccess: () => {
      toast.success("담당 설정이 변경되었습니다");
      queryClient.invalidateQueries({ queryKey: [...PART_OWNER_QUERY_KEY, partId] });
      queryClient.invalidateQueries({ queryKey: [...PART_DETAIL_QUERY_KEY, partId] });
    },
    onError: () => {
      toast.error("담당 설정 변경에 실패했습니다");
    },
  });
}

/** Part BOM 트리 조회 훅 */
export function usePartBomTree(
  partId: string | undefined,
  direction: "forward" | "reverse" = "forward",
) {
  return useQuery({
    queryKey: [...PART_BOM_TREE_QUERY_KEY, partId, direction],
    queryFn: () => getPartBomTree(partId!, direction),
    enabled: !!partId,
  });
}

/**
 * 도면 업로드 + Part 등록 통합 mutation
 * 1. presigned URL 발급
 * 2. S3 업로드
 * 3. 업로드 완료 확인
 * 4. Part에 도면 등록
 */
export function useUploadDrawing(partId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const contentType = file.type || "application/octet-stream";
      const { file_id, upload_url } = await createFileUpload({
        original_name: file.name,
        content_type: contentType,
        file_size: file.size,
      });

      await uploadFileToPresignedUrl(upload_url, file, contentType);

      await completeFileUpload(file_id);

      return registerDrawingForPart(partId!, file_id);
    },
    onSuccess: (drawing) => {
      if (drawing.conversion_status === "PENDING") {
        trackPendingDrawing(partId, drawing);
      } else {
        clearPendingDrawingTracker(partId);
      }

      toast.success("도면이 등록되었습니다");
      queryClient.invalidateQueries({
        queryKey: [...PART_DETAIL_QUERY_KEY, partId],
      });
    },
    onError: (err) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr?.response?.data?.message || "도면 업로드에 실패했습니다",
      );
    },
  });
}

/** Part에 연결된 도면 삭제 mutation */
export function useDeleteDrawing(partId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteDrawingFromPart(partId!),
    onSuccess: () => {
      clearPendingDrawingTracker(partId);
      toast.success("도면이 삭제되었습니다");
      queryClient.invalidateQueries({
        queryKey: [...PART_DETAIL_QUERY_KEY, partId],
      });
    },
    onError: (err) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr?.response?.data?.message || "도면 삭제에 실패했습니다",
      );
    },
  });
}

/**
 * 첨부 파일 업로드 + Part 연결 통합 mutation
 * 1. 파일 개수에 따라 단건/배치 업로드 수행
 * 2. 모든 file_id를 일괄로 Part에 연결
 */
export function useAttachFiles(partId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const fileIds = await uploadFiles(files);

      // Part에 일괄 연결
      return attachFilesToPart(partId!, { file_ids: fileIds });
    },
    onSuccess: () => {
      toast.success("파일이 첨부되었습니다");
      queryClient.invalidateQueries({
        queryKey: [...PART_FILES_QUERY_KEY, partId],
      });
      queryClient.invalidateQueries({
        queryKey: [...PART_DETAIL_QUERY_KEY, partId],
      });
    },
    onError: (err) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr?.response?.data?.message || "파일 첨부에 실패했습니다",
      );
    },
  });
}

/** Part 첨부 파일 제거 mutation */
export function useDetachFile(partId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => detachFileFromPart(partId!, fileId),
    onSuccess: () => {
      toast.success("파일이 삭제되었습니다");
      queryClient.invalidateQueries({
        queryKey: [...PART_FILES_QUERY_KEY, partId],
      });
      queryClient.invalidateQueries({
        queryKey: [...PART_DETAIL_QUERY_KEY, partId],
      });
    },
    onError: (err) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr?.response?.data?.message || "파일 삭제에 실패했습니다",
      );
    },
  });
}
