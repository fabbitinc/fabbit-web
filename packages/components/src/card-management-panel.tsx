import { CreditCard, Download, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@fabbit/ui";

export type CardManagementPlanStatus = "active" | "trial" | "overdue" | "cancelled";
export type CardManagementPaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type CardManagementCardBrand = "VISA" | "MASTERCARD" | "AMEX" | "JCB" | "UNIONPAY";

export interface CardManagementPlan {
  name: string;
  monthlyPrice: number;
  status: CardManagementPlanStatus;
  nextBillingDate: string;
}

export interface CardManagementCard {
  id: string;
  brand: CardManagementCardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  isDefault: boolean;
}

export interface CardManagementPaymentHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: CardManagementPaymentStatus;
  receiptUrl?: string;
}

export interface CardManagementForm {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

export interface CardManagementPanelProps {
  cards: CardManagementCard[];
  form: CardManagementForm;
  isDialogOpen: boolean;
  paymentHistory: CardManagementPaymentHistory[];
  plan: CardManagementPlan;
  onAddCard: () => void;
  onChangePlan?: () => void;
  onDeleteCard: (cardId: string) => void;
  onDialogOpenChange: (open: boolean) => void;
  onFormChange: (nextForm: CardManagementForm) => void;
  onSetDefaultCard: (cardId: string) => void;
}

function getPlanStatusBadge(status: CardManagementPlanStatus) {
  const items: Record<CardManagementPlanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "활성", variant: "default" },
    trial: { label: "체험판", variant: "secondary" },
    overdue: { label: "연체", variant: "destructive" },
    cancelled: { label: "취소됨", variant: "outline" },
  };

  return items[status];
}

function getPaymentStatusBadge(status: CardManagementPaymentStatus) {
  const items: Record<CardManagementPaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid: { label: "결제 완료", variant: "default" },
    pending: { label: "대기", variant: "secondary" },
    failed: { label: "실패", variant: "destructive" },
    refunded: { label: "환불", variant: "outline" },
  };

  return items[status];
}

function getBrandLabel(brand: CardManagementCardBrand) {
  const items: Record<CardManagementCardBrand, string> = {
    VISA: "Visa",
    MASTERCARD: "MC",
    AMEX: "Amex",
    JCB: "JCB",
    UNIONPAY: "UnionPay",
  };

  return items[brand];
}

function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function CardManagementPanel({
  cards,
  form,
  isDialogOpen,
  paymentHistory,
  plan,
  onAddCard,
  onChangePlan,
  onDeleteCard,
  onDialogOpenChange,
  onFormChange,
  onSetDefaultCard,
}: CardManagementPanelProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">현재 플랜</h2>
        <div className="rounded-[24px] border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                <Badge variant={getPlanStatusBadge(plan.status).variant}>{getPlanStatusBadge(plan.status).label}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                월 {formatCurrency(plan.monthlyPrice)} · 다음 결제일 {plan.nextBillingDate}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={onChangePlan}>
              플랜 변경
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">결제 수단</h2>
          <Button className="gap-1" size="sm" variant="outline" onClick={() => onDialogOpenChange(true)}>
            <Plus className="size-4" />
            카드 추가
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-border/70 py-10">
            <CreditCard className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">등록된 카드가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-[24px] border border-border/70 bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] font-semibold" variant="secondary">
                        {getBrandLabel(card.brand)}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">•••• {card.last4}</span>
                      {card.isDefault ? <Badge className="text-[10px]">기본</Badge> : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.holderName} · 만료 {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
                    </p>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-36 p-1">
                    {!card.isDefault ? (
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                        type="button"
                        onClick={() => onSetDefaultCard(card.id)}
                      >
                        <Star className="size-3.5" />
                        기본 설정
                      </button>
                    ) : null}
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                      type="button"
                      onClick={() => onDeleteCard(card.id)}
                    >
                      <Trash2 className="size-3.5" />
                      삭제
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">결제 이력</h2>
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">날짜</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">설명</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">금액</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">상태</th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">영수증</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((history) => {
                const badge = getPaymentStatusBadge(history.status);

                return (
                  <tr key={history.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 text-foreground">{history.date}</td>
                    <td className="px-4 py-3 text-foreground">{history.description}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{formatCurrency(history.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {history.receiptUrl ? (
                        <Button aria-label={`${history.date} 결제 영수증 다운로드`} size="icon" title="영수증 다운로드" variant="ghost">
                          <Download className="size-3.5" />
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>카드 추가</DialogTitle>
            <DialogDescription>결제에 사용할 카드 정보를 입력해 주세요.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="card-number">카드 번호</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={form.number}
                onChange={(event) => onFormChange({ ...form, number: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="card-expiry">만료일</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(event) => onFormChange({ ...form, expiry: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input
                  id="card-cvc"
                  placeholder="123"
                  value={form.cvc}
                  onChange={(event) => onFormChange({ ...form, cvc: event.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-name">카드 소유자</Label>
              <Input
                id="card-name"
                placeholder="홍길동"
                value={form.name}
                onChange={(event) => onFormChange({ ...form, name: event.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onDialogOpenChange(false)}>
              취소
            </Button>
            <Button onClick={onAddCard}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
