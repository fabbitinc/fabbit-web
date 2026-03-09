import type {
  CreditCategoryTrendModel,
  StorageCategoryTrendModel,
} from "@/features/billing/types/usage-trend-model";

export function generateStorageCategoryTrend(days = 365): StorageCategoryTrendModel[] {
  const now = new Date();
  const result: StorageCategoryTrendModel[] = [];
  const baseMegabytes = { drawing: 1_800, attachment: 900, other: 300 };

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - index);

    const progress = (days - index) / days;
    const drawing = baseMegabytes.drawing + progress * 2_200 + Math.sin(index * 0.3) * 100;
    const attachment = baseMegabytes.attachment + progress * 1_100 + Math.cos(index * 0.5) * 60;
    const other = baseMegabytes.other + progress * 400 + Math.sin(index * 0.7) * 30;

    result.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      drawing: Math.round(drawing * 1_000_000),
      attachment: Math.round(attachment * 1_000_000),
      other: Math.round(other * 1_000_000),
    });
  }

  return result;
}

export function generateCreditCategoryTrend(days = 365): CreditCategoryTrendModel[] {
  const now = new Date();
  const result: CreditCategoryTrendModel[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.2 : 1;

    result.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      bomAnalysis: Math.max(0, Math.round((12 + Math.random() * 6 - 3) * weekendMultiplier)),
      drawingAnalysis: Math.max(0, Math.round((8 + Math.random() * 4 - 2) * weekendMultiplier)),
      aiChat: Math.max(0, Math.round((5 + Math.random() * 3 - 1) * weekendMultiplier)),
    });
  }

  return result;
}
