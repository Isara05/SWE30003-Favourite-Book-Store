"use client";

import React, { useState } from "react";
import { Card, Tag, Button, Modal } from "antd";
import { apiGet } from "@/lib/api";

type OrderItem = {
  isbn: string;
  quantity: number;
  priceAtSale: number;
  lineTotal: number;
};

export type ProfileOrder = {
  orderId: string;
  date: string;
  status: string;
  customerId: string;
  lines: OrderItem[];
  payments: { amount: number }[];
  totalAmount: number;
};

// Renders the orders list section.
export default function OrdersList({ orders }: { orders: ProfileOrder[] }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [receipts, setReceipts] = useState<string[] | null>(null);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // Renders the show receipts section.
  async function showReceipts(orderId: string) {
    setLoadingReceipts(true);
    try {
      const res = await apiGet<string[]>(`/orders/${orderId}/receipts`);
      setReceipts(res);
      setModalVisible(true);
    } catch (e) {
      setReceipts([`Failed to load receipts: ${e}`]);
      setModalVisible(true);
    } finally {
      setLoadingReceipts(false);
    }
  }
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Order history</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {orders.length === 0 ? (
          <Card size="small" style={{ borderRadius: 12 }}>
            <div style={{ color: '#64748b' }}>No orders yet.</div>
          </Card>
        ) : null}
        {orders.map((o) => (
          <Card key={o.orderId} size="small" style={{ borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.orderId}</div>
                <div style={{ color: '#888', fontSize: 13 }}>
                  {new Date(o.date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })} · {o.lines.reduce((sum, line) => sum + line.quantity, 0)} items
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Tag color={o.status === 'Paid' ? 'green' : o.status === 'Created' ? 'blue' : 'gold'}>{o.status}</Tag>
                <div style={{ fontWeight: 700, marginTop: 8 }}>${o.totalAmount.toFixed(2)}</div>
                <div style={{ marginTop: 8 }}>
                  <Button size="small" onClick={() => showReceipts(o.orderId)} loading={loadingReceipts}>
                    Receipts
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal title="Receipts" open={modalVisible} onOk={() => setModalVisible(false)} onCancel={() => setModalVisible(false)}>
        {receipts ? (
          <div>
            {receipts.map((r, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                {r}
              </div>
            ))}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal>
    </div>
  );
}
