"use client";

import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Space, Table, Tag, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "@/lib/api";

const { Title, Text } = Typography;

type PaymentRecord = {
  paymentId: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: "Processed" | "Pending" | "Failed";
  message: string;
};

// Renders the status color section.
function statusColor(status: PaymentRecord["status"]) {
  if (status === "Processed") return "green";
  if (status === "Pending") return "orange";
  return "red";
}

// Renders the staff payments panel section.
export default function StaffPaymentsPanel() {
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pendingDirectTransfers = useMemo(
    () => payments.filter((p) => p.status === "Pending" && p.method.startsWith("direct:")),
    [payments],
  );

  // Renders the load payments section.
  async function loadPayments() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<PaymentRecord[]>("/payments");
      setPayments(data);
    } catch (err) {
      setError("Unable to load payments. Make sure you are logged in as staff/manager.");
    } finally {
      setLoading(false);
    }
  }

  // Renders the handle confirm section.
  async function handleConfirm(paymentId: string, confirmed: boolean) {
    setConfirmingId(paymentId);
    try {
      await apiPost<PaymentRecord>(`/payments/${paymentId}/confirm`, { confirmed });
      message.success(confirmed ? "Transfer confirmed." : "Transfer rejected.");
      await loadPayments();
    } catch {
      message.error("Unable to update transfer status.");
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <Card style={{ borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Tag color="volcano" style={{ borderRadius: 999, marginBottom: 8 }}>Staff Queue</Tag>
          <Title level={4} style={{ margin: 0 }}>Bank transfer approvals</Title>
          <Text type="secondary">Review pending direct transfers and approve or reject them.</Text>
        </div>
        <Space>
          <Tag color="orange">{pendingDirectTransfers.length} pending</Tag>
          <Button icon={<ReloadOutlined />} onClick={loadPayments} loading={loading}>Refresh</Button>
        </Space>
      </div>

      {!payments.length && !loading && !error ? (
        <Alert type="info" showIcon message="No data loaded yet" description="Click Refresh to load payment activity." style={{ marginBottom: 16 }} />
      ) : null}

      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      <Table
        rowKey="paymentId"
        loading={loading}
        size="small"
        pagination={{ pageSize: 8 }}
        dataSource={payments}
        locale={{ emptyText: "No payment records found." }}
        columns={[
          { title: "Payment ID", dataIndex: "paymentId", width: 220 },
          { title: "Order", dataIndex: "orderId", width: 180 },
          {
            title: "Method",
            dataIndex: "method",
            width: 160,
            render: (value: string) => <Text code>{value}</Text>,
          },
          {
            title: "Amount",
            dataIndex: "amount",
            width: 110,
            render: (value: number) => `$${Number(value).toFixed(2)}`,
          },
          {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: (value: PaymentRecord["status"]) => <Tag color={statusColor(value)}>{value}</Tag>,
          },
          {
            title: "Message",
            dataIndex: "message",
            ellipsis: true,
            render: (value: string) => <Text type="secondary">{value}</Text>,
          },
          {
            title: "Action",
            key: "action",
            width: 220,
            render: (_: unknown, record: PaymentRecord) => {
              const canReview = record.status === "Pending" && record.method.startsWith("direct:");
              // Renders the if section.
              if (!canReview) {
                return <Text type="secondary">N/A</Text>;
              }
              return (
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    loading={confirmingId === record.paymentId}
                    onClick={() => handleConfirm(record.paymentId, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    size="small"
                    loading={confirmingId === record.paymentId}
                    onClick={() => handleConfirm(record.paymentId, false)}
                  >
                    Reject
                  </Button>
                </Space>
              );
            },
          },
        ]}
      />
    </Card>
  );
}
