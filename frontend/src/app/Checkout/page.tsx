"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, List, Space, Typography, message } from "antd";
import { apiPost } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import type { CartItem } from "@/components/landing/landing-data";
import { readProfileCart } from "@/components/profile/cart-storage";

const { Title, Text } = Typography;

type CreateOrderPayload = {
  customerId: string;
  items: { isbn: string; quantity: number }[];
};

type CreatedOrder = {
  orderId: string;
  totalAmount: number;
};

// Renders the checkout page section.
export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    // Renders the if section.
    if (!session) {
      router.replace('/login');
      return;
    }

    setUser(session.user);
    setCart(readProfileCart(session.user.id));
  }, [router]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  // Renders the handle place order section.
  async function handlePlaceOrder() {
    if (!user) return;
    // Renders the if section.
    if (cart.length === 0) {
      message.warning('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateOrderPayload = {
        customerId: user.id,
        items: cart.map((item) => ({ isbn: item.isbn, quantity: item.quantity })),
      };

      const order = await apiPost<CreatedOrder>('/orders', payload);
      message.success('Order created. Redirecting to payment gateway...');
      router.push(`/payment-gateway?orderId=${encodeURIComponent(order.orderId)}&amount=${encodeURIComponent(String(order.totalAmount))}`);
    } catch {
      message.error('Could not place your order. Please check stock levels and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="fb-shell" style={{ padding: "24px clamp(16px,5vw,80px)" }}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Title level={2} style={{ margin: 0 }}>Checkout</Title>
        <Text type="secondary">Review your cart and continue to payment.</Text>

        <Card>
          <List
            dataSource={cart}
            locale={{ emptyText: 'Your cart is empty.' }}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={`${item.title} x ${item.quantity}`}
                  description={item.author}
                />
                <Text strong>${(item.price * item.quantity).toFixed(2)}</Text>
              </List.Item>
            )}
          />

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <Text strong>Total</Text>
            <Text strong>${total.toFixed(2)}</Text>
          </div>

          <Space style={{ marginTop: 16 }}>
            <Button onClick={() => router.push('/profile')}>Back to profile</Button>
            <Button type="primary" loading={submitting} onClick={handlePlaceOrder}>
              Process payment
            </Button>
          </Space>
        </Card>
      </Space>
    </main>
  );
}