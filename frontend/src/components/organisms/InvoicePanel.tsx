"use client";

import React, { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { apiGet } from '@/lib/api';

type Invoice = {
  invoiceId: string;
  orderId: string;
  issueDate: string;
  totalAmount: number;
};

interface InvoicePanelProps {
  defaultOrderId?: string;
}

// Renders the invoice panel section.
export default function InvoicePanel({ defaultOrderId = '' }: InvoicePanelProps) {
  const [form] = Form.useForm<{ orderId: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    form.setFieldsValue({ orderId: defaultOrderId });
  }, [defaultOrderId, form]);

  // Renders the handle lookup section.
  async function handleLookup(values: { orderId: string }) {
    const orderId = values.orderId.trim();
    // Renders the if section.
    if (!orderId) {
      setError('Please enter an order ID.');
      setInvoice(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<Invoice>(`/invoices/order/${orderId}`);
      setInvoice(result);
    } catch {
      setInvoice(null);
      setError('Invoice not found for that order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card size="small" style={{ borderRadius: 14 }} styles={{ body: { padding: 16 } }}>
      <Typography.Text strong>Invoice lookup</Typography.Text>
      <div style={{ color: '#64748b', marginTop: 4, marginBottom: 12 }}>Retrieve invoice details by order ID.</div>

      <Form form={form} layout="vertical" onFinish={handleLookup}>
        <Form.Item name="orderId" label="Order ID" style={{ marginBottom: 12 }}>
          <Input placeholder="ORD-..." />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Fetch invoice
        </Button>
      </Form>

      {error ? <Alert style={{ marginTop: 12 }} type="error" showIcon message={error} /> : null}

      {invoice ? (
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          <Alert type="success" showIcon message={`Invoice ${invoice.invoiceId}`} description={`Order ${invoice.orderId}`} />
          <div style={{ fontSize: 13, color: '#475569' }}>Issued: {new Date(invoice.issueDate).toLocaleString()}</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>${invoice.totalAmount.toFixed(2)}</div>
        </div>
      ) : null}
    </Card>
  );
}
