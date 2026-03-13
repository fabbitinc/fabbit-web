import type { CreateFileRequestDto, FileUploadSource } from "@/api/file.types";
import type { HashFileResponseMessage } from "@/api/file-hash-worker.types";

interface PendingHashRequest {
  reject: (reason?: unknown) => void;
  resolve: (contentHash: string) => void;
}

let fileHashWorker: Worker | null = null;
let nextRequestId = 1;
const pendingHashRequests = new Map<number, PendingHashRequest>();

function rejectAllPendingHashRequests(message: string) {
  for (const [requestId, pendingRequest] of pendingHashRequests.entries()) {
    pendingRequest.reject(new Error(message));
    pendingHashRequests.delete(requestId);
  }
}

function getFileHashWorker() {
  if (fileHashWorker) {
    return fileHashWorker;
  }

  fileHashWorker = new Worker(new URL("./file-hash.worker.ts", import.meta.url), {
    type: "module",
  });

  fileHashWorker.onmessage = (event: MessageEvent<HashFileResponseMessage>) => {
    const pendingRequest = pendingHashRequests.get(event.data.requestId);

    if (!pendingRequest) {
      return;
    }

    pendingHashRequests.delete(event.data.requestId);

    if (event.data.type === "success") {
      pendingRequest.resolve(event.data.contentHash);
      return;
    }

    pendingRequest.reject(new Error(event.data.message));
  };

  fileHashWorker.onerror = () => {
    rejectAllPendingHashRequests("파일 해시 워커가 비정상 종료되었습니다.");
    fileHashWorker?.terminate();
    fileHashWorker = null;
  };

  return fileHashWorker;
}

export async function calculateFileSha256Hex(file: Blob) {
  const worker = getFileHashWorker();
  const requestId = nextRequestId++;

  return new Promise<string>((resolve, reject) => {
    pendingHashRequests.set(requestId, { reject, resolve });
    worker.postMessage({ file, requestId });
  });
}

export async function toCreateFileUploadRequestFromFile({
  file,
  originalName = file.name,
  contentType = file.type || "application/octet-stream",
  fileSize = file.size,
}: FileUploadSource): Promise<CreateFileRequestDto> {
  return {
    original_name: originalName,
    content_type: contentType,
    file_size: fileSize,
    content_hash: await calculateFileSha256Hex(file),
  };
}

export async function toCreateFileUploadRequestsFromFiles(
  sources: FileUploadSource[],
): Promise<CreateFileRequestDto[]> {
  const requests: CreateFileRequestDto[] = [];

  for (const source of sources) {
    requests.push(await toCreateFileUploadRequestFromFile(source));
  }

  return requests;
}
