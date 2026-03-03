import type {
  PaymentCard,
  SubscriptionPlan,
  PaymentHistory,
  StorageUsage,
  StorageOverageSettings,
  AIFeatureUsage,
  AIUsageTrend,
  AICreditPackage,
} from "../types/billing.types";

// ── 플랜 ──
export const mockPlan: SubscriptionPlan = {
  name: "Business",
  monthlyPrice: 99_000,
  status: "active",
  nextBillingDate: "2026-04-01",
};

// ── 카드 ──
export const mockCards: PaymentCard[] = [
  {
    id: "card-1",
    brand: "VISA",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2028,
    holderName: "김지훈",
    isDefault: true,
  },
  {
    id: "card-2",
    brand: "MASTERCARD",
    last4: "8888",
    expiryMonth: 6,
    expiryYear: 2027,
    holderName: "김지훈",
    isDefault: false,
  },
];

// ── 결제 이력 ──
export const mockPaymentHistory: PaymentHistory[] = [
  {
    id: "pay-1",
    date: "2026-03-01",
    description: "Business 플랜 — 3월",
    amount: 99_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-2",
    date: "2026-02-01",
    description: "Business 플랜 — 2월",
    amount: 99_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-3",
    date: "2026-02-15",
    description: "스토리지 추가 5GB",
    amount: 5_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-4",
    date: "2026-01-01",
    description: "Business 플랜 — 1월",
    amount: 99_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-5",
    date: "2025-12-20",
    description: "AI 크레딧 추가 (BOM 분석 100건)",
    amount: 15_000,
    status: "refunded",
  },
];

// ── 스토리지 ──
export const mockStorageUsage: StorageUsage = {
  usedGB: 8.2,
  limitGB: 10,
  categories: [
    { key: "cad", label: "CAD 파일", usedGB: 4.1, color: "var(--brand-500)" },
    { key: "drawing", label: "도면", usedGB: 2.3, color: "var(--status-info)" },
    { key: "bom", label: "BOM", usedGB: 1.2, color: "var(--status-warning)" },
    { key: "etc", label: "기타", usedGB: 0.6, color: "var(--muted-foreground)" },
  ],
};

export const mockOverageSettings: StorageOverageSettings = {
  policy: "pay_per_use",
  pricePerGB: 1_000,
  monthlyCapAmount: 50_000,
};

// ── AI 사용량 ──
export const mockAIFeatureUsages: AIFeatureUsage[] = [
  {
    key: "bom_analysis",
    label: "BOM 분석",
    icon: "FileSpreadsheet",
    used: 78,
    limit: 100,
    unit: "건",
  },
  {
    key: "drawing_analysis",
    label: "도면 분석",
    icon: "ScanLine",
    used: 42,
    limit: 200,
    unit: "건",
  },
  {
    key: "ai_chat",
    label: "AI 채팅",
    icon: "MessageSquare",
    used: 1_520,
    limit: 5_000,
    unit: "토큰(K)",
  },
];

function generateTrendData(): AIUsageTrend[] {
  const data: AIUsageTrend[] = [];
  const now = new Date(2026, 2, 3); // 2026-03-03
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      bom_analysis: Math.floor(Math.random() * 8) + 2,
      drawing_analysis: Math.floor(Math.random() * 12) + 3,
      ai_chat: Math.floor(Math.random() * 200) + 50,
    });
  }
  return data;
}

export const mockAIUsageTrend: AIUsageTrend[] = generateTrendData();

export const mockCreditPackages: AICreditPackage[] = [
  {
    featureKey: "bom_analysis",
    label: "BOM 분석",
    quantity: 100,
    price: 15_000,
    unit: "건",
  },
  {
    featureKey: "drawing_analysis",
    label: "도면 분석",
    quantity: 200,
    price: 25_000,
    unit: "건",
  },
  {
    featureKey: "ai_chat",
    label: "AI 채팅",
    quantity: 5_000,
    price: 10_000,
    unit: "토큰(K)",
  },
];
