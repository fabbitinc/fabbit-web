/// <reference lib="webworker" />

import hashWasmSha256 from "hash-wasm/dist/sha256.umd.min.js";
import type {
  HashFileErrorMessage,
  HashFileRequestMessage,
  HashFileSuccessMessage,
} from "./file-hash-worker.types";

async function calculateFileSha256Hex(file: Blob) {
  const hasher = await hashWasmSha256.createSHA256();
  const reader = file.stream().getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value) {
        hasher.update(value);
      }
    }
  } finally {
    reader.releaseLock();
  }

  const digest = hasher.digest("hex");

  if (typeof digest !== "string") {
    throw new Error("파일 해시 계산 결과가 올바르지 않습니다.");
  }

  return digest;
}

self.onmessage = async (event: MessageEvent<HashFileRequestMessage>) => {
  const { file, requestId } = event.data;

  try {
    const contentHash = await calculateFileSha256Hex(file);
    const response: HashFileSuccessMessage = {
      contentHash,
      requestId,
      type: "success",
    };

    self.postMessage(response);
  } catch (error) {
    const response: HashFileErrorMessage = {
      message:
        error instanceof Error
          ? error.message
          : "파일 해시 계산 중 오류가 발생했습니다.",
      requestId,
      type: "error",
    };

    self.postMessage(response);
  }
};

export {};
