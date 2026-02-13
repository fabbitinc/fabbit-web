import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 번역된 텍스트와 원문이 다르면 "번역 (원문)" 형식으로 반환.
 * 같으면 원문만 반환. (영어 환경에서 중복 방지)
 */
export function withOriginal(localized: string, original: string): string {
  return localized === original ? original : `${localized} (${original})`;
}
