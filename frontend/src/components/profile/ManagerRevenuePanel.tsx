"use client";

import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Space, Statistic, Tag, Typography } from "antd";
import { DollarOutlined, ReloadOutlined } from "@ant-design/icons";
import { apiGet } from "@/lib/api";

const { Title, Text } = Typography;

type RevenueSummary = {
  grossRevenue: number;
  paidOrderCount: number;
  totalItemsSold: number;
  averageOrderValue: number;
};

// Renders the manager revenue panel section.
export default function ManagerRevenuePanel() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Renders the load revenue section.
  async function loadRevenue() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<RevenueSummary>("/orders/revenue/summary");
      setSummary(data);
    } catch {
      setError("Unable to load revenue summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenue();
  }, []);

  return (
    <Card style={{ borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div>
          <Tag color="green" style={{ borderRadius: 999, marginBottom: 8 }}>Revenue</Tag>
          <Title level={4} style={{ margin: 0 }}>Sales revenue</Title>
          <Text type="secondary">Total revenue collected from paid orders.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadRevenue} loading={loading}>Refresh</Button>
      </div>

      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

      <Space size={16} wrap>
        <Statistic
          title="Gross revenue"
          value={summary?.grossRevenue ?? 0}
          prefix={<DollarOutlined />}
          precision={2}
        />
        <Statistic
          title="Paid orders"
          value={summary?.paidOrderCount ?? 0}
        />
        <Statistic
          title="Items sold"
          value={summary?.totalItemsSold ?? 0}
        />
        <Statistic
          title="Avg order value"
          value={summary?.averageOrderValue ?? 0}
          prefix={<DollarOutlined />}
          precision={2}
        />
      </Space>
    </Card>
  );
}