import { apiClient } from "@/api/client";
import { toast } from "sonner";

/**
 * API에서 Excel 파일을 받아 브라우저 다운로드를 트리거한다.
 * StreamingResponse(blob)를 처리하며, Content-Disposition 헤더가 있으면 파일명을 추출한다.
 */
export async function downloadExcel(
  url: string,
  fallbackFilename: string,
): Promise<void> {
  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
      timeout: 60_000, // Excel 생성은 기본 timeout보다 여유 있게
    });

    // Content-Disposition에서 파일명 추출
    const disposition = response.headers["content-disposition"] as
      | string
      | undefined;
    let filename = fallbackFilename;
    if (disposition) {
      // filename*=UTF-8''encoded 또는 filename="name" 패턴 매칭
      const utf8Match = disposition.match(
        /filename\*=UTF-8''(.+?)(?:;|$)/i,
      );
      const basicMatch = disposition.match(
        /filename="?([^";\n]+)"?/i,
      );
      if (utf8Match?.[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else if (basicMatch?.[1]) {
        filename = basicMatch[1];
      }
    }

    // Blob URL 생성 후 자동 클릭으로 다운로드
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);

    toast.success("파일 다운로드가 완료되었습니다");
  } catch {
    toast.error("파일 다운로드에 실패했습니다");
  }
}
