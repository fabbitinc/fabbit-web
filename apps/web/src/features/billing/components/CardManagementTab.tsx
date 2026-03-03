import { useState } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  mockPlan,
  mockCards,
  mockPaymentHistory,
} from "../mock-data/billing-mock";
import type {
  PaymentCard,
  PlanStatus,
  PaymentStatus,
} from "../types/billing.types";

function getPlanStatusBadge(status: PlanStatus) {
  const map: Record<PlanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "활성", variant: "default" },
    trial: { label: "체험판", variant: "secondary" },
    overdue: { label: "연체", variant: "destructive" },
    cancelled: { label: "취소됨", variant: "outline" },
  };
  return map[status];
}

function getPaymentStatusBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid: { label: "결제 완료", variant: "default" },
    pending: { label: "대기", variant: "secondary" },
    failed: { label: "실패", variant: "destructive" },
    refunded: { label: "환불", variant: "outline" },
  };
  return map[status];
}

function getBrandLabel(brand: PaymentCard["brand"]) {
  const map: Record<string, string> = {
    VISA: "Visa",
    MASTERCARD: "MC",
    AMEX: "Amex",
    JCB: "JCB",
    UNIONPAY: "UnionPay",
  };
  return map[brand] ?? brand;
}

function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function CardManagementTab() {
  const [cards, setCards] = useState(mockCards);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  function handleSetDefault(cardId: string) {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === cardId })),
    );
    toast.success("기본 카드가 변경되었습니다.");
  }

  function handleDeleteCard(cardId: string) {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    toast.success("카드가 삭제되었습니다.");
  }

  function handleAddCard() {
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvc || !cardForm.name) {
      toast.error("모든 항목을 입력해 주세요.");
      return;
    }
    const last4 = cardForm.number.replace(/\s/g, "").slice(-4);
    const newCard: PaymentCard = {
      id: `card-${Date.now()}`,
      brand: "VISA",
      last4,
      expiryMonth: parseInt(cardForm.expiry.split("/")[0], 10) || 1,
      expiryYear: 2000 + (parseInt(cardForm.expiry.split("/")[1], 10) || 26),
      holderName: cardForm.name,
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    setCardForm({ number: "", expiry: "", cvc: "", name: "" });
    setAddDialogOpen(false);
    toast.success("카드가 등록되었습니다.");
  }

  return (
    <div className="space-y-8">
      {/* ── 현재 플랜 요약 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">현재 플랜</h2>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {mockPlan.name}
                </span>
                <Badge variant={getPlanStatusBadge(mockPlan.status).variant}>
                  {getPlanStatusBadge(mockPlan.status).label}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                월 {formatCurrency(mockPlan.monthlyPrice)} · 다음 결제일{" "}
                {mockPlan.nextBillingDate}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="cursor-pointer">
            플랜 변경
          </Button>
        </div>
      </section>

      {/* ── 등록된 카드 ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">결제 수단</h2>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            카드 추가
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              등록된 카드가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {getBrandLabel(card.brand)}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <Badge variant="default" className="text-[10px]">
                          기본
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {card.holderName} · 만료{" "}
                      {String(card.expiryMonth).padStart(2, "0")}/
                      {card.expiryYear}
                    </p>
                  </div>
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-36 p-1">
                    {!card.isDefault && (
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleSetDefault(card.id)}
                      >
                        <Star className="h-3.5 w-3.5" />
                        기본 설정
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 결제 이력 ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">결제 이력</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  날짜
                </th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">
                  설명
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                  금액
                </th>
                <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                  상태
                </th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {mockPaymentHistory.map((row) => {
                const badge = getPaymentStatusBadge(row.status);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2.5 text-foreground">{row.date}</td>
                    <td className="px-4 py-2.5 text-foreground">
                      {row.description}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {row.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 cursor-pointer"
                          title="영수증 다운로드"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 카드 추가 Dialog ── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>카드 추가</DialogTitle>
            <DialogDescription>
              결제에 사용할 카드 정보를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="card-number">카드 번호</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardForm.number}
                onChange={(e) =>
                  setCardForm((f) => ({ ...f, number: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="card-expiry">만료일</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={cardForm.expiry}
                  onChange={(e) =>
                    setCardForm((f) => ({ ...f, expiry: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="card-cvc">CVC</Label>
                <Input
                  id="card-cvc"
                  placeholder="123"
                  value={cardForm.cvc}
                  onChange={(e) =>
                    setCardForm((f) => ({ ...f, cvc: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card-name">카드 명의</Label>
              <Input
                id="card-name"
                placeholder="홍길동"
                value={cardForm.name}
                onChange={(e) =>
                  setCardForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setAddDialogOpen(false)}
            >
              취소
            </Button>
            <Button className="cursor-pointer" onClick={handleAddCard}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
