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
type NormalizedResponse<T> = [Exclude<T, Blob>] extends [never] ? T : DeepDefined<Exclude<T, Blob>>;

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
