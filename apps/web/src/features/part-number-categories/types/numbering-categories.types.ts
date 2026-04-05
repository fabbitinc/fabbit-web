// 카테고리 UI 모델
export interface NumberingCategoryModel {
  id: string;
  name: string;
  formatPrefix: string;
  formatSuffix: string;
  digits: number;
  previewPartNumber: string;
}

// 다음 품번 미리보기 모델
export interface NextNumberPreviewModel {
  partNumber: string;
  note: string | null;
}

// 품번 사용 가능 여부 모델
export interface PartNumberAvailabilityModel {
  partNumber: string;
  available: boolean;
}
