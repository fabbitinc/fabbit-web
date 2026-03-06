import { useState } from "react";
import { CardManagementPanel } from "@fabbit/components";
import { toast } from "sonner";
import { mockCards, mockPaymentHistory, mockPlan } from "@/features/billing/mock-data/billing-mock";
import type { PaymentCardModel } from "@/features/billing/types/billing-model";

export function CardManagementTab() {
  const [cards, setCards] = useState(mockCards);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  function handleSetDefault(cardId: string) {
    setCards((current) => current.map((card) => ({ ...card, isDefault: card.id === cardId })));
    toast.success("기본 카드가 변경되었습니다.");
  }

  function handleDelete(cardId: string) {
    setCards((current) => current.filter((card) => card.id !== cardId));
    toast.success("카드가 삭제되었습니다.");
  }

  function handleAddCard() {
    if (!form.number || !form.expiry || !form.cvc || !form.name) {
      toast.error("모든 항목을 입력해 주세요.");
      return;
    }

    const [month, year] = form.expiry.split("/");
    const nextCard: PaymentCardModel = {
      id: `card-${Date.now()}`,
      brand: "VISA",
      last4: form.number.replace(/\s/g, "").slice(-4),
      expiryMonth: Number.parseInt(month, 10) || 1,
      expiryYear: 2000 + (Number.parseInt(year, 10) || 26),
      holderName: form.name,
      isDefault: cards.length === 0,
    };

    setCards((current) => [...current, nextCard]);
    setForm({ number: "", expiry: "", cvc: "", name: "" });
    setDialogOpen(false);
    toast.success("카드가 등록되었습니다.");
  }

  return (
    <CardManagementPanel
      cards={cards}
      form={form}
      isDialogOpen={dialogOpen}
      paymentHistory={mockPaymentHistory}
      plan={mockPlan}
      onAddCard={handleAddCard}
      onDeleteCard={handleDelete}
      onDialogOpenChange={setDialogOpen}
      onFormChange={setForm}
      onSetDefaultCard={handleSetDefault}
    />
  );
}
