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

export async function customInstance<T>(
  { url, method, params, data, headers, responseType, signal }: CustomInstanceOptions,
  options?: AxiosRequestConfig,
): Promise<T> {
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

  return response.data;
}

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
