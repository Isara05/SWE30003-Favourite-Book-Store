"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Card, Form, Input, Radio, Space, Typography, message } from "antd";
import { apiPost } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import { readProfileCart, writeProfileCart } from "@/components/profile/cart-storage";

const { Title, Text } = Typography;

type SavedCard = {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  nickName: string;
};

type CardFormValues = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  nickName?: string;
};

// Renders the get payment profile key section.
function getPaymentProfileKey(userId: string) {
  return `fb_payment_profile_${userId}`;
}

// Renders the mask card number section.
function maskCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

// Renders the normalize amount section.
function normalizeAmount(input: string | null): number {
  const amount = Number(input ?? "0");
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Math.round(amount * 100) / 100;
}

// Renders the payment gateway content section.
function PaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [useSavedCard, setUseSavedCard] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [form] = Form.useForm<CardFormValues>();

  const orderId = searchParams.get("orderId") ?? "";
  const amount = useMemo(() => normalizeAmount(searchParams.get("amount")), [searchParams]);

  useEffect(() => {
    const session = getAuthSession();
    // Renders the if section.
    if (!session) {
      router.replace("/login");
      return;
    }

    setUser(session.user);

    const raw = window.localStorage.getItem(getPaymentProfileKey(session.user.id));
    // Renders the if section.
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { cards?: SavedCard[] };
        const cards = parsed.cards ?? [];
        setSavedCards(cards);
        setSelectedCardId(cards[0]?.id ?? null);
      } catch {
        setSavedCards([]);
        setSelectedCardId(null);
      }
    }
  }, [router]);

  // Renders the process payment section.
  async function processPayment(values?: CardFormValues) {
    if (!user) return;
    // Renders the if section.
    if (!orderId || amount <= 0) {
      message.error("Invalid payment request. Please restart checkout.");
      return;
    }

    // Renders the if section.
    if (useSavedCard) {
      // Renders the if section.
      if (!selectedCardId) {
        message.warning("Please select a saved card.");
        return;
      }
    } else {
      // Renders the if section.
      if (!values?.cardholderName || !values?.cardNumber || !values?.expiry) {
        message.warning("Please complete card details.");
        return;
      }
    }

    setProcessing(true);
    try {
      await apiPost(`/orders/${orderId}/payments`, { amount, method: "CardDetails" });

      const currentCart = readProfileCart(user.id);
      // Renders the if section.
      if (currentCart.length > 0) {
        writeProfileCart(user.id, []);
      }

      setPaid(true);
      setPaidOrderId(orderId);
      setPaidAmount(amount);
      message.success("Payment processed successfully.");
    } catch {
      message.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  // Renders the if section.
  if (paid) {
    return (
      <main className="fb-shell" style={{ padding: "24px clamp(16px,5vw,80px)" }}>
        <Card style={{ maxWidth: 760, margin: "0 auto" }}>
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <Title level={2} style={{ margin: 0 }}>Payment successful</Title>
            <Alert
              type="success"
              showIcon
              message={`Order ${paidOrderId} has been paid.`}
              description={`Amount charged: $${paidAmount.toFixed(2)} (mock gateway)`}
            />
            <Text type="secondary">
              This is a simulated gateway confirmation screen. No real payment was processed.
            </Text>
            <Space>
              <Button type="primary" onClick={() => router.push('/profile')}>
                Back to profile
              </Button>
              <Button onClick={() => router.push('/checkout')}>
                Start new checkout
              </Button>
            </Space>
          </Space>
        </Card>
      </main>
    );
  }

  return (
    <main className="fb-shell" style={{ padding: "24px clamp(16px,5vw,80px)" }}>
      <Card style={{ maxWidth: 760, margin: "0 auto" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Title level={2} style={{ margin: 0 }}>Payment gateway (mock)</Title>
          <Text type="secondary">
            Complete payment for order <strong>{orderId || "-"}</strong>.
          </Text>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong>Amount due</Text>
            <Text strong>${amount.toFixed(2)}</Text>
          </div>

          <Radio.Group
            value={useSavedCard ? "saved" : "new"}
            onChange={(event) => setUseSavedCard(event.target.value === "saved")}
          >
            <Space direction="vertical">
              <Radio value="saved">Use saved card</Radio>
              <Radio value="new">Use new card</Radio>
            </Space>
          </Radio.Group>

          {useSavedCard ? (
            <Card size="small">
              {savedCards.length === 0 ? (
                <Text type="secondary">No saved cards found. Switch to "Use new card".</Text>
              ) : (
                <Radio.Group
                  value={selectedCardId}
                  onChange={(event) => setSelectedCardId(event.target.value)}
                  style={{ width: "100%" }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {savedCards.map((card) => (
                      <Radio key={card.id} value={card.id}>
                        {card.nickName || "Card"} - {maskCardNumber(card.cardNumber)} ({card.expiry})
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
            </Card>
          ) : (
            <Form form={form} layout="vertical" onFinish={processPayment}>
              <Form.Item name="nickName" label="Card label (optional)">
                <Input placeholder="Personal Visa" />
              </Form.Item>
              <Form.Item name="cardholderName" label="Cardholder name" rules={[{ required: true }]}>
                <Input placeholder="Name on card" />
              </Form.Item>
              <Form.Item
                name="cardNumber"
                label="Card number"
                rules={[{ required: true, message: "Please enter a card number" }]}
              >
                <Input placeholder="4111 1111 1111 1111" />
              </Form.Item>
              <Form.Item name="expiry" label="Expiry" rules={[{ required: true, message: "Please enter expiry" }]}>
                <Input placeholder="MM/YY" />
              </Form.Item>
            </Form>
          )}

          <Space>
            <Button onClick={() => router.push('/checkout')}>Back to checkout</Button>
            {useSavedCard ? (
              <Button type="primary" loading={processing} onClick={() => processPayment()}>
                Pay now
              </Button>
            ) : (
              <Button type="primary" loading={processing} onClick={() => form.submit()}>
                Pay now
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </main>
  );
}

// Renders the payment gateway page section.
export default function PaymentGatewayPage() {
  return (
    <Suspense fallback={<main className="fb-shell" style={{ padding: "24px clamp(16px,5vw,80px)" }}>Loading payment gateway...</main>}>
      <PaymentGatewayContent />
    </Suspense>
  );
}
