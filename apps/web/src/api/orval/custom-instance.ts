import type { AxiosError, AxiosRequestConfig, Method, ResponseType } from "axios";
import { apiClient } from "@/api/client";

interface CustomInstanceOptions {
  url: string;
  method: Method;
  params?: unknown;
  data?: unknown;
  headers?: AxiosRequestConfig["headers"];
  responseType?: ResponseType;
  signal?: AbortSignal;
}

type Defined<T> = Exclude<T, undefined>;
type DeepDefined<T> = T extends Blob
  ? T
  : T extends readonly (infer Item)[]
    ? DeepDefined<Defined<Item>>[]
    : T extends object
      ? { [Key in keyof T]-?: DeepDefined<Defined<T[Key]>> }
      : T;
type BlobResponse<T> = Extract<T, Blob>;
type JsonResponse<T> = Exclude<T, Blob | void>;
type NormalizedResponse<T> = [JsonResponse<T>] extends [never]
  ? ([BlobResponse<T>] extends [never] ? void : BlobResponse<T>)
  : DeepDefined<JsonResponse<T>> | BlobResponse<T>;

export async function customInstance<T>(
  { url, method, params, data, headers, responseType, signal }: CustomInstanceOptions,
  options?: AxiosRequestConfig,
): Promise<NormalizedResponse<T>> {
  const response = await apiClient.request<T>({
    url,
    method,
    params,
    data,
    headers,
    responseType,
    signal,
    ...options,
  });

  return response.data as NormalizedResponse<T>;
}

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
