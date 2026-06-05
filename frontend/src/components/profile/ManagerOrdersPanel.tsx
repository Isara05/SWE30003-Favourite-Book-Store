"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Select, Space, Table, Tag, Typography, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { apiGet, apiPatch } from "@/lib/api";
import type { ProfileOrder } from "@/components/profile/OrdersList";

const { Title, Text } = Typography;

const ORDER_STATUSES = ["Created", "Paid", "Shipped", "Cancelled"] as const;

type OrderStatusValue = (typeof ORDER_STATUSES)[number];

// Renders the status color section.
function statusColor(status: string) {
  if (status === "Paid") return "green";
  if (status === "Shipped") return "blue";
  if (status === "Cancelled") return "red";
  return "gold";
}

// Renders the manager orders panel section.
export default function ManagerOrdersPanel() {
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, OrderStatusValue>>({});

  const totalOrders = useMemo(() => orders.length, [orders]);

  // Renders the load orders section.
  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ProfileOrder[]>("/orders");
      setOrders(data);
      setSelectedStatus((current) => {
        const next = { ...current };
        data.forEach((order) => {
          // Renders the if section.
          if (!next[order.orderId]) {
            next[order.orderId] = order.status as OrderStatusValue;
          }
        });
        return next;
      });
    } catch {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // Renders the update status section.
  async function updateStatus(orderId: string) {
    const nextStatus = selectedStatus[orderId];
    if (!nextStatus) return;
    setUpdatingId(orderId);
    try {
      await apiPatch(`/orders/${orderId}/status`, { newStatus: nextStatus });
      message.success(`Updated ${orderId}.`);
      await loadOrders();
    } catch {
      message.error("Could not update the order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Card style={{ borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Tag color="purple" style={{ borderRadius: 999, marginBottom: 8 }}>Order control</Tag>
          <Title level={4} style={{ margin: 0 }}>Order lifecycle</Title>
          <Text type="secondary">Inspect the current order queue and move orders through the allowed statuses.</Text>
        </div>
        <Space>
          <Tag color="blue">{totalOrders} orders</Tag>
          <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={loading}>Refresh</Button>
        </Space>
      </div>

      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      <Table
        rowKey="orderId"
        loading={loading}
        size="small"
        pagination={{ pageSize: 8 }}
        dataSource={orders}
        locale={{ emptyText: "No orders found." }}
        columns={[
          { title: "Order ID", dataIndex: "orderId", width: 180 },
          { title: "Customer", dataIndex: "customerId", width: 160 },
          {
            title: "Date",
            dataIndex: "date",
            width: 150,
            render: (value: string) => new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }),
          },
          {
            title: "Items",
            width: 80,
            render: (_: unknown, record: ProfileOrder) => record.lines.reduce((sum, line) => sum + line.quantity, 0),
          },
          {
            title: "Total",
            dataIndex: "totalAmount",
            width: 120,
            render: (value: number) => `$${Number(value).toFixed(2)}`,
          },
          {
            title: "Status",
            dataIndex: "status",
            width: 120,
            render: (value: string) => <Tag color={statusColor(value)}>{value}</Tag>,
          },
          {
            title: "Update",
            key: "update",
            width: 250,
            render: (_: unknown, record: ProfileOrder) => (
              <Space>
                <Select
                  value={selectedStatus[record.orderId] ?? (record.status as OrderStatusValue)}
                  style={{ width: 120 }}
                  options={ORDER_STATUSES.map((value) => ({ label: value, value }))}
                  onChange={(value: OrderStatusValue) => setSelectedStatus((current) => ({ ...current, [record.orderId]: value }))}
                />
                <Button loading={updatingId === record.orderId} onClick={() => updateStatus(record.orderId)}>
                  Save
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
