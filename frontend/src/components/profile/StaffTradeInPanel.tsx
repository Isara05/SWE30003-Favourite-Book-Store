"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { apiGet, apiPost } from "@/lib/api";

type TradeInRecord = {
  tradeInId: string;
  customerId: string;
  bookIsbn: string;
  condition: "Good" | "Fair" | "Poor";
  creditIssued: number;
  status?: "Pending" | "Approved" | "Rejected";
  approverId?: string;
  approvalDate?: string;
  notes?: string;
  recordDate: string;
};

const { Title, Text } = Typography;

// Renders the color for status section.
function colorForStatus(status?: TradeInRecord["status"]) {
  if (status === "Approved") return "green";
  if (status === "Rejected") return "red";
  return "orange";
}

// Renders the staff trade in panel section.
export default function StaffTradeInPanel({ approverId }: { approverId: string }) {
  const [records, setRecords] = useState<TradeInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  // Renders the load records section.
  async function loadRecords() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<TradeInRecord[]>("/customers/tradeins/pending");
      setRecords(data);
    } catch {
      setError("Unable to load pending trade-ins.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  // Renders the handle decision section.
  async function handleDecision(record: TradeInRecord, approve: boolean) {
    setProcessingId(record.tradeInId);
    try {
      await apiPost(`/customers/tradeins/${record.tradeInId}/approve`, {
        approverId,
        approve,
        notes: notesById[record.tradeInId] ?? undefined,
      });
      message.success(approve ? "Trade-in approved." : "Trade-in rejected.");
      await loadRecords();
    } catch {
      message.error("Unable to update trade-in.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Card style={{ borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Tag color="volcano" style={{ borderRadius: 999, marginBottom: 8 }}>Trade-in queue</Tag>
          <Title level={4} style={{ margin: 0 }}>Pending trade-ins</Title>
          <Text type="secondary">Review customer trade-in requests and approve or reject them.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadRecords} loading={loading}>Refresh</Button>
      </div>

      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      <Table
        rowKey="tradeInId"
        loading={loading}
        size="small"
        pagination={{ pageSize: 8 }}
        dataSource={records}
        locale={{ emptyText: "No pending trade-ins." }}
        columns={[
          { title: "Trade-in ID", dataIndex: "tradeInId", width: 180 },
          { title: "Customer", dataIndex: "customerId", width: 160 },
          { title: "ISBN", dataIndex: "bookIsbn", width: 140 },
          { title: "Condition", dataIndex: "condition", width: 120 },
          {
            title: "Credit",
            dataIndex: "creditIssued",
            width: 110,
            render: (value: number) => `$${Number(value).toFixed(2)}`,
          },
          {
            title: "Status",
            dataIndex: "status",
            width: 110,
            render: (value: TradeInRecord["status"]) => <Tag color={colorForStatus(value)}>{value ?? "Pending"}</Tag>,
          },
          {
            title: "Notes",
            key: "notes",
            width: 220,
            render: (_: unknown, record: TradeInRecord) => (
              <Input
                placeholder="Optional note"
                value={notesById[record.tradeInId] ?? ""}
                onChange={(event) => setNotesById((current) => ({ ...current, [record.tradeInId]: event.target.value }))}
              />
            ),
          },
          {
            title: "Action",
            key: "action",
            width: 220,
            render: (_: unknown, record: TradeInRecord) => (
              <Space>
                <Button type="primary" loading={processingId === record.tradeInId} onClick={() => handleDecision(record, true)}>
                  Approve
                </Button>
                <Button danger loading={processingId === record.tradeInId} onClick={() => handleDecision(record, false)}>
                  Reject
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
