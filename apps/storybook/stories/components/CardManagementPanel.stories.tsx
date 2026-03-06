import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CardManagementPanel, type CardManagementPanelProps } from "@fabbit/components";

const samplePlan = {
  name: "Business",
  monthlyPrice: 99_000,
  status: "active",
  nextBillingDate: "2026-04-01",
} satisfies CardManagementPanelProps["plan"];

const sampleCards = [
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
] satisfies CardManagementPanelProps["cards"];

const samplePaymentHistory = [
  {
    id: "pay-1",
    date: "2026-03-01",
    description: "Business 플랜 - 3월",
    amount: 99_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-2",
    date: "2026-02-15",
    description: "스토리지 추가 5GB",
    amount: 5_000,
    status: "paid",
    receiptUrl: "#",
  },
  {
    id: "pay-3",
    date: "2025-12-20",
    description: "AI 크레딧 추가 구매",
    amount: 15_000,
    status: "refunded",
  },
] satisfies CardManagementPanelProps["paymentHistory"];

function CardManagementPanelStory({
  initialCards = sampleCards,
  plan = samplePlan,
  paymentHistory = samplePaymentHistory,
}: {
  initialCards?: CardManagementPanelProps["cards"];
  plan?: CardManagementPanelProps["plan"];
  paymentHistory?: CardManagementPanelProps["paymentHistory"];
}) {
  const [cards, setCards] = useState(initialCards);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CardManagementPanelProps["form"]>({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  return (
    <CardManagementPanel
      cards={cards}
      form={form}
      isDialogOpen={dialogOpen}
      paymentHistory={paymentHistory}
      plan={plan}
      onAddCard={() => undefined}
      onChangePlan={() => undefined}
      onDeleteCard={(cardId) => setCards((current) => current.filter((card) => card.id !== cardId))}
      onDialogOpenChange={setDialogOpen}
      onFormChange={setForm}
      onSetDefaultCard={(cardId) =>
        setCards((current) => current.map((card) => ({ ...card, isDefault: card.id === cardId })))
      }
    />
  );
}

const meta = {
  title: "Components/CardManagementPanel",
  component: CardManagementPanelStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CardManagementPanelStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CardManagementPanelStory />,
};

export const EmptyCards: Story = {
  render: () => <CardManagementPanelStory initialCards={[]} />,
};
