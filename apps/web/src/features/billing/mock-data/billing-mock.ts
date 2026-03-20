import type {
  PaymentCardModel,
  PaymentHistoryModel,
  SubscriptionPlanModel,
} from "@/features/billing/types/billing-model";

export const mockPlan: SubscriptionPlanModel = {
  name: "Team",
  monthlyPrice: 29_000,
  status: "active",
  nextBillingDate: "2026-04-01",
};

export const mockCards: PaymentCardModel[] = [
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

export const mockPaymentHistory: PaymentHistoryModel[] = [
  {
    id: "pay-1",
    date: "2026-03-01",
    description: "Team 플랜 좌석 과금 - 3월",
    amount: 174_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-2",
    date: "2026-02-01",
    description: "Team 플랜 좌석 과금 - 2월",
    amount: 174_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-3",
    date: "2026-02-15",
    description: "스토리지 초과 5GB",
    amount: 1_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-4",
    date: "2026-01-01",
    description: "Team 플랜 좌석 과금 - 1월",
    amount: 174_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-5",
    date: "2025-12-20",
    description: "AI 크레딧 사용량 과금",
    amount: 15_000,
    status: "refunded",
  },
];
