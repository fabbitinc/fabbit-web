// 사용량 추이 차트 데이터 타입

/** 월별 스토리지 추이 */
export interface StorageMonthlyTrend {
  month: string;
  bytesUsed: number;
}

/** 카테고리별 스토리지 추이 (일별/월별) */
export interface StorageCategoryTrend {
  date: string;
  drawing: number;
  attachment: number;
  other: number;
}

/** 기능별 크레딧 추이 */
export interface CreditCategoryTrend {
  date: string;
  bomAnalysis: number;
  drawingAnalysis: number;
  aiChat: number;
}
