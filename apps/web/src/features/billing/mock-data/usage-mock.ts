import type {
  StorageMonthlyTrend,
  StorageCategoryTrend,
  CreditCategoryTrend,
} from "../types/usage-trend.types";

/** 월별 스토리지 추이 (누적 증가 + 노이즈) */
export function generateStorageMonthlyTrend(months: number = 6): StorageMonthlyTrend[] {
  const now = new Date();
  const result: StorageMonthlyTrend[] = [];
  const baseGB = 2.1; // 시작 기준 GB

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const growth = (months - i) * 0.8; // 월 ~0.8GB 증가
    const noise = (Math.sin(i * 2.7) * 0.3); // 약간의 변동
    const gb = baseGB + growth + noise;
    result.push({
      month: monthLabel,
      bytesUsed: Math.round(gb * 1_000_000_000),
    });
  }

  return result;
}


/** 카테고리별 스토리지 추이 (일별 데이터, 최대 365일) */
export function generateStorageCategoryTrend(days: number = 365): StorageCategoryTrend[] {
  const now = new Date();
  const result: StorageCategoryTrend[] = [];
  const baseMB = { drawing: 1_800, attachment: 900, other: 300 };

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateLabel = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const progress = (days - i) / days;
    const drawingMB = baseMB.drawing + progress * 2_200 + Math.sin(i * 0.3) * 100;
    const attachmentMB = baseMB.attachment + progress * 1_100 + Math.cos(i * 0.5) * 60;
    const otherMB = baseMB.other + progress * 400 + Math.sin(i * 0.7) * 30;

    result.push({
      date: dateLabel,
      drawing: Math.round(drawingMB * 1_000_000),
      attachment: Math.round(attachmentMB * 1_000_000),
      other: Math.round(otherMB * 1_000_000),
    });
  }

  return result;
}

/** 기능별 크레딧 추이 (일별 데이터, 최대 365일) */
export function generateCreditCategoryTrend(days: number = 365): CreditCategoryTrend[] {
  const now = new Date();
  const result: CreditCategoryTrend[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const multiplier = isWeekend ? 0.2 : 1;
    const bomAnalysis = Math.max(0, Math.round((12 + Math.random() * 6 - 3) * multiplier));
    const drawingAnalysis = Math.max(0, Math.round((8 + Math.random() * 4 - 2) * multiplier));
    const aiChat = Math.max(0, Math.round((5 + Math.random() * 3 - 1) * multiplier));

    result.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      bomAnalysis,
      drawingAnalysis,
      aiChat,
    });
  }

  return result;
}
