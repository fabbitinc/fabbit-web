export interface HashFileRequestMessage {
  file: Blob;
  requestId: number;
}

export interface HashFileSuccessMessage {
  contentHash: string;
  requestId: number;
  type: "success";
}

export interface HashFileErrorMessage {
  message: string;
  requestId: number;
  type: "error";
}

export type HashFileResponseMessage =
  | HashFileSuccessMessage
  | HashFileErrorMessage;
