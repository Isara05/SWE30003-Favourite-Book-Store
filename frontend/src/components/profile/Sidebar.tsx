"use client";

import React from "react";
import { Button, Card, Divider, Form, Input, InputNumber, Space, Tag, Typography, message } from "antd";
import { LogoutOutlined, ShoppingCartOutlined, CrownOutlined } from "@ant-design/icons";
import type { AuthUser } from "@/lib/auth";
import ManagerRevenuePanel from "./ManagerRevenuePanel";

type CustomerProfile = {
  customerId: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  accountBalance: number;
};

type SavedCard = {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  nickName: string;
};

type CustomerPaymentProfile = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  cards: SavedCard[];
};

const { Text } = Typography;

// Renders the get storage key section.
function getStorageKey(userId: string) {
  return `fb_payment_profile_${userId}`;
}

// Renders the mask card number section.
function maskCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

// Renders the sidebar section.
export default function Sidebar({
  user,
  onLogout,
  customerProfile,
  cartCount = 0,
  onOpenCart,
}: {
  user: AuthUser;
  onLogout: () => void;
  customerProfile?: CustomerProfile | null;
  cartCount?: number;
  onOpenCart?: () => void;
}) {
  const isStaff = user.role !== 'customer';

  return (
    <aside style={{ padding: 24, borderRadius: 12, background: '#fff', border: '1px solid #e8e4dd' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>{user.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
        <div>
          <div style={{ fontWeight: 700 }}>{user.name}</div>
          <div style={{ color: '#888', fontSize: 13 }}>{user.email}</div>
          <Tag color={isStaff ? 'gold' : 'blue'} style={{ marginTop: 6, borderRadius: 999 }}>
            {isStaff ? <CrownOutlined style={{ marginRight: 4 }} /> : null}
            {isStaff ? 'Manager' : 'Customer'}
          </Tag>
        </div>
      </div>

      {isStaff ? (
        <div style={{ marginBottom: 16, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
          You can add books and review the live catalog from your dashboard.
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!isStaff ? (
          <Button icon={<ShoppingCartOutlined />} type="text" onClick={onOpenCart}>
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Button>
        ) : null}
        <Button icon={<LogoutOutlined />} type="text" danger onClick={onLogout}>Sign out</Button>
      </div>

      {isStaff ? (
        <div style={{ marginTop: 16 }}>
          <ManagerRevenuePanel />
        </div>
      ) : null}

      {!isStaff && customerProfile ? <CustomerFinancePanel user={user} customerProfile={customerProfile} /> : null}
    </aside>
  );
}

// Renders the customer finance panel section.
function CustomerFinancePanel({
  user,
  customerProfile,
}: {
  user: AuthUser;
  customerProfile: CustomerProfile;
}) {
  const [paymentForm] = Form.useForm<CustomerPaymentProfile>();
  const [cardForm] = Form.useForm<{ cardholderName: string; cardNumber: string; expiry: string; nickName: string }>();
  const [savedCards, setSavedCards] = React.useState<SavedCard[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const raw = window.localStorage.getItem(getStorageKey(user.id));
    // Renders the if section.
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CustomerPaymentProfile;
        paymentForm.setFieldsValue(parsed);
        setSavedCards(parsed.cards ?? []);
      } catch {
        paymentForm.setFieldsValue({
          bankName: '',
          accountName: customerProfile.name,
          accountNumber: '',
          branchCode: '',
          cards: [],
        });
      }
    } else {
      paymentForm.setFieldsValue({
        bankName: '',
        accountName: customerProfile.name,
        accountNumber: '',
        branchCode: '',
        cards: [],
      });
    }

    setHydrated(true);
  }, [customerProfile.name, paymentForm, user.id]);

  // Renders the persist profile section.
  function persistProfile(nextProfile: CustomerPaymentProfile) {
    window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(nextProfile));
  }

  // Renders the handle save bank details section.
  function handleSaveBankDetails(values: CustomerPaymentProfile) {
    const nextProfile = { ...values, cards: savedCards };
    persistProfile(nextProfile);
    message.success('Bank details saved locally for this profile.');
  }

  // Renders the handle add card section.
  function handleAddCard(values: { cardholderName: string; cardNumber: string; expiry: string; nickName: string }) {
    const nextCards = [
      ...savedCards,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...values,
      },
    ];
    setSavedCards(nextCards);
    const currentBankValues = paymentForm.getFieldsValue();
    persistProfile({
      bankName: currentBankValues.bankName ?? '',
      accountName: currentBankValues.accountName ?? customerProfile.name,
      accountNumber: currentBankValues.accountNumber ?? '',
      branchCode: currentBankValues.branchCode ?? '',
      cards: nextCards,
    });
    cardForm.resetFields();
    message.success('Card added locally to this profile.');
  }

  // Renders the handle remove card section.
  function handleRemoveCard(cardId: string) {
    const nextCards = savedCards.filter((card) => card.id !== cardId);
    setSavedCards(nextCards);
    const currentBankValues = paymentForm.getFieldsValue();
    persistProfile({
      bankName: currentBankValues.bankName ?? '',
      accountName: currentBankValues.accountName ?? customerProfile.name,
      accountNumber: currentBankValues.accountNumber ?? '',
      branchCode: currentBankValues.branchCode ?? '',
      cards: nextCards,
    });
  }

  return (
    <Card size="small" style={{ marginTop: 16, borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
      <Text strong>Customer balance</Text>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>${customerProfile.accountBalance.toFixed(2)}</div>
      <Text type="secondary">This comes from the live customer record.</Text>

      <Divider style={{ margin: '14px 0' }} />

      <Text strong>Bank details</Text>
      {hydrated ? (
        <Form form={paymentForm} layout="vertical" onFinish={handleSaveBankDetails} style={{ marginTop: 10 }}>
          <Form.Item name="bankName" label="Bank name">
            <Input placeholder="Bank name" />
          </Form.Item>
          <Form.Item name="accountName" label="Account name">
            <Input placeholder="Account name" />
          </Form.Item>
          <Form.Item name="accountNumber" label="Account number">
            <Input placeholder="Account number" />
          </Form.Item>
          <Form.Item name="branchCode" label="Branch / BSB">
            <Input placeholder="Branch code" />
          </Form.Item>
          <div style={{ display: 'grid', gap: 8, marginBottom: 12, color: '#64748b', fontSize: 13 }}>
            <div>Address: {customerProfile.address}</div>
            <div>Phone: {customerProfile.phoneNumber}</div>
          </div>
          <Button type="primary" htmlType="submit" block>
            Save bank details
          </Button>
        </Form>
      ) : null}

      <Divider style={{ margin: '14px 0' }} />

      <Text strong>Saved cards</Text>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {savedCards.length === 0 ? <div style={{ color: '#64748b', fontSize: 13 }}>No cards added yet.</div> : null}
        {savedCards.map((card) => (
          <Card key={card.id} size="small" style={{ borderRadius: 12 }} styles={{ body: { padding: 12 } }}>
            <div style={{ fontWeight: 700 }}>{card.nickName || 'Card'}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{card.cardholderName}</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>{maskCardNumber(card.cardNumber)} · {card.expiry}</div>
            <Space style={{ marginTop: 8 }}>
              <Button size="small" onClick={() => handleRemoveCard(card.id)}>
                Remove
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <Form form={cardForm} layout="vertical" onFinish={handleAddCard} style={{ marginTop: 12 }}>
        <Form.Item name="nickName" label="Card label" rules={[{ required: true, message: 'Enter a card label' }]}>
          <Input placeholder="Personal Visa" />
        </Form.Item>
        <Form.Item name="cardholderName" label="Cardholder name" rules={[{ required: true }]}>
          <Input placeholder="Name on card" />
        </Form.Item>
        <Form.Item name="cardNumber" label="Card number" rules={[{ required: true }]}>
          <Input placeholder="1234 5678 9012 3456" />
        </Form.Item>
        <Form.Item name="expiry" label="Expiry" rules={[{ required: true }]}>
          <Input placeholder="MM/YY" />
        </Form.Item>
        <Button type="dashed" htmlType="submit" block>
          Add card
        </Button>
      </Form>
    </Card>
  );
}
