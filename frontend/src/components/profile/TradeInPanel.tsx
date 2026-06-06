"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Select, Space, Tag, Typography } from 'antd';
import { apiGet, apiPost } from '@/lib/api';
import type { Book } from '@/components/landing/landing-data';
import type { ProfileOrder } from '@/components/profile/OrdersList';

type TradeInRecord = {
  tradeInId: string;
  customerId: string;
  bookIsbn: string;
  condition: 'Good' | 'Fair' | 'Poor';
  creditIssued: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
  approverId?: string;
  approvalDate?: string;
  notes?: string;
  recordDate: string;
};

type TradeInPanelProps = {
  customerId: string;
  orders: ProfileOrder[];
  books: Book[];
  onSuccess?: (tradeIn: TradeInRecord) => void;
};

const CONDITION_MULTIPLIERS: Record<TradeInRecord['condition'], number> = {
  Good: 0.4,
  Fair: 0.25,
  Poor: 0.1,
};

// Renders the unique purchased isbns section.
function uniquePurchasedIsbns(orders: ProfileOrder[]) {
  return [...new Set(orders.flatMap((order) => order.lines.map((line) => line.isbn)))];
}

// Renders the trade in panel section.
export default function TradeInPanel({ customerId, orders, books, onSuccess }: TradeInPanelProps) {
  const [form] = Form.useForm<{ isbn: string; condition: TradeInRecord['condition'] }>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeInRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<TradeInRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const eligibleBooks = useMemo(() => {
    const purchasedIsbns = uniquePurchasedIsbns(orders);
    return purchasedIsbns
      .map((isbn) => books.find((book) => book.isbn === isbn))
      .filter((book): book is Book => Boolean(book));
  }, [books, orders]);

  const selectedIsbn = Form.useWatch('isbn', form);
  const selectedCondition = Form.useWatch('condition', form) as TradeInRecord['condition'] | undefined;

  const estimate = useMemo(() => {
    if (!selectedIsbn || !selectedCondition) return null;
    const book = eligibleBooks.find((item) => item.isbn === selectedIsbn);
    if (!book) return null;
    const multiplier = CONDITION_MULTIPLIERS[selectedCondition];
    return Number((book.price * multiplier).toFixed(2));
  }, [eligibleBooks, selectedCondition, selectedIsbn]);

  useEffect(() => {
    let active = true;
    // Renders the load history section.
    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const records = await apiGet<TradeInRecord[]>(`/customers/${customerId}/tradeins`);
        if (!active) return;
        setHistory(records);
      } catch {
        if (active) setHistory([]);
      } finally {
        if (active) setHistoryLoading(false);
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [customerId, result]);

  // Renders the handle submit section.
  async function handleSubmit(values: { isbn: string; condition: TradeInRecord['condition'] }) {
    setLoading(true);
    setError(null);
    try {
      const tradeIn = await apiPost<TradeInRecord>(`/customers/${customerId}/tradein`, values);
      setResult(tradeIn);
        setHistory((current) => [tradeIn, ...current]);
      form.resetFields();
      onSuccess?.(tradeIn);
    } catch {
      setError('Trade-in failed. Choose a book from your order history and a valid condition.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card size="small" style={{ borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
      <Typography.Text strong>Trade-in credit</Typography.Text>
      <div style={{ color: '#64748b', marginTop: 4, marginBottom: 12 }}>Add credit for a returned book.</div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="isbn" label="Purchased book" rules={[{ required: true, message: 'Select a book' }]}>
          <Select
            placeholder={eligibleBooks.length ? 'Select a book from your orders' : 'No purchased books found'}
            options={eligibleBooks.map((book) => ({ label: `${book.title} (${book.isbn})`, value: book.isbn }))}
            disabled={eligibleBooks.length === 0}
          />
        </Form.Item>
        <Form.Item name="condition" label="Condition" rules={[{ required: true, message: 'Select a condition' }]}>
          <Select
            placeholder="Select condition"
            options={['Good', 'Fair', 'Poor'].map((value) => ({ label: value, value }))}
          />
        </Form.Item>
        {estimate !== null ? <div style={{ marginBottom: 12, color: '#475569' }}>Estimated credit: ${estimate.toFixed(2)}</div> : null}
        <Button type="primary" htmlType="submit" loading={loading} block>
          Process trade-in
        </Button>
      </Form>

      {error ? <Alert style={{ marginTop: 12 }} type="error" showIcon message={error} /> : null}
      {result ? (
        <Alert
          style={{ marginTop: 12 }}
          type="success"
          showIcon
          message={`Trade-in ${result.tradeInId}`}
          description={`Credited $${result.creditIssued.toFixed(2)} for ${result.bookIsbn} (${result.condition})`}
        />
      ) : null}

      <div style={{ marginTop: 16 }}>
        <Typography.Text strong>Trade-in history</Typography.Text>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {historyLoading ? <div style={{ color: '#64748b' }}>Loading history...</div> : null}
          {!historyLoading && history.length === 0 ? <div style={{ color: '#64748b' }}>No trade-in records yet.</div> : null}
          {history.map((tradeIn) => (
            <Card key={tradeIn.tradeInId} size="small" style={{ borderRadius: 12 }}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Space wrap>
                  <Tag color={tradeIn.status === 'Approved' ? 'green' : tradeIn.status === 'Rejected' ? 'red' : 'orange'}>
                    {tradeIn.status ?? 'Pending'}
                  </Tag>
                  <Tag color="blue">{tradeIn.bookIsbn}</Tag>
                </Space>
                <div style={{ fontWeight: 600 }}>{tradeIn.tradeInId}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {new Date(tradeIn.recordDate).toLocaleString()} · Credit ${tradeIn.creditIssued.toFixed(2)}
                </div>
              </Space>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
