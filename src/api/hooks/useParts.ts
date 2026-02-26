import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPartFilterOptions,
  listParts,
  getPartDetail,
  getPartBomTree,
  registerDrawingForPart,
  deleteDrawingFromPart,
  attachFilesToPart,
  detachFileFromPart,
} from "../parts";
import {
  createFileUpload,
  uploadFileToPresignedUrl,
  completeFileUpload,
} from "../file";
import type { ListPartsParams } from "../types/parts";

export const PART_FILTER_OPTIONS_QUERY_KEY = ["partFilterOptions"] as const;
export const PARTS_QUERY_KEY = ["parts"] as const;
export const PART_DETAIL_QUERY_KEY = ["partDetail"] as const;
export const PART_BOM_TREE_QUERY_KEY = ["partBomTree"] as const;

/** Part 필터 옵션 조회 훅 */
export function usePartFilterOptions() {
  return useQuery({
    queryKey: PART_FILTER_OPTIONS_QUERY_KEY,
    queryFn: getPartFilterOptions,
  });
}

/** Part 목록 조회 훅 */
export function useParts(params: ListPartsParams) {
  return useQuery({
    queryKey: [...PARTS_QUERY_KEY, params],
    queryFn: () => listParts(params),
  });
}

const CONVERSION_POLL_INTERVAL = 1_000;
const CONVERSION_POLL_TIMEOUT = 1 * 60 * 1000;

/** Part 상세 조회 훅 (도면 변환 PENDING 시 자동 폴링) */
export function usePartDetail(partId: string | undefined) {
  const pollStartRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: [...PART_DETAIL_QUERY_KEY, partId],
    queryFn: () => getPartDetail(partId!),
    enabled: !!partId,
  });

  const conversionStatus = query.data?.drawing?.conversion_status;
  const isPending = conversionStatus === "PENDING";

  // PENDING 상태 시작 시점 기록
  useEffect(() => {
    if (isPending && pollStartRef.current === null) {
      pollStartRef.current = Date.now();
    } else if (!isPending) {
      pollStartRef.current = null;
    }
  }, [isPending]);

  // PENDING인 동안 5초 간격 refetch, 5분 초과 시 중단
  useEffect(() => {
    if (!isPending) return;

    const id = setInterval(() => {
      if (
        pollStartRef.current &&
        Date.now() - pollStartRef.current > CONVERSION_POLL_TIMEOUT
      ) {
        clearInterval(id);
        return;
      }
      query.refetch();
    }, CONVERSION_POLL_INTERVAL);

    return () => clearInterval(id);
  }, [isPending, query]);

  return query;
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
    onSuccess: () => {
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
 * 1. 각 파일마다 presigned URL 발급 → S3 업로드 → 완료 확인
 * 2. 모든 file_id를 일괄로 Part에 연결
 */
export function useAttachFiles(partId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      // 각 파일을 병렬로 업로드
      const fileIds = await Promise.all(
        files.map(async (file) => {
          const contentType = file.type || "application/octet-stream";
          const { file_id, upload_url } = await createFileUpload({
            original_name: file.name,
            content_type: contentType,
            file_size: file.size,
          });
          await uploadFileToPresignedUrl(upload_url, file, contentType);
          await completeFileUpload(file_id);
          return file_id;
        }),
      );

      // Part에 일괄 연결
      return attachFilesToPart(partId!, { file_ids: fileIds });
    },
    onSuccess: () => {
      toast.success("파일이 첨부되었습니다");
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
