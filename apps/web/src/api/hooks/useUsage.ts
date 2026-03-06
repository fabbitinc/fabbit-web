import { useQuery } from "@tanstack/react-query";
import { getStorageUsage, getCreditUsage } from "../usage";

export const STORAGE_USAGE_QUERY_KEY = ["usage", "storage"] as const;
export const CREDIT_USAGE_QUERY_KEY = ["usage", "credits"] as const;

/** 스토리지 사용량 */
export function useStorageUsage() {
  return useQuery({
    queryKey: STORAGE_USAGE_QUERY_KEY,
    queryFn: getStorageUsage,
  });
}

/** AI 크레딧 사용량 */
export function useCreditUsage() {
  return useQuery({
    queryKey: CREDIT_USAGE_QUERY_KEY,
    queryFn: getCreditUsage,
  });
}
