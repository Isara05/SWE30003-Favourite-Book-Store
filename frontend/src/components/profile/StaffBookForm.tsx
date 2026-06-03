"use client";

import React from "react";
import { Form, Input, InputNumber, Select, Button, Card, Typography, Tag } from "antd";
import { BookOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const BOOK_FORMAT_OPTIONS = ['Paperback', 'Hardcover', 'Ebook'] as const;
const BOOK_CONDITION_OPTIONS = ['New', 'Used'] as const;

// Renders the staff book form section.
export default function StaffBookForm({ onCreate, recentBooks }: { onCreate: (v: any) => Promise<void>; recentBooks: any[] }) {
  const [form] = Form.useForm();

  return (
    <Card style={{ borderRadius: 16 }}>
      <Tag color="green" style={{ borderRadius: 999 }}>Staff dashboard</Tag>
      <Title level={4} style={{ marginTop: 6 }}>Add books to the system</Title>
      <Text type="secondary">Create new book entries for the catalog.</Text>

      <Form layout="vertical" form={form} onFinish={async (v) => { await onCreate(v); form.resetFields(); }} style={{ marginTop: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Form.Item name="isbn" label="ISBN" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="author" label="Author" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="genre" label="Genre" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="format" label="Format" rules={[{ required: true }]}>
            <Select options={BOOK_FORMAT_OPTIONS.map(i=>({label:i,value:i}))} />
          </Form.Item>
          <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
            <Select options={BOOK_CONDITION_OPTIONS.map(i=>({label:i,value:i}))} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="stockLevel" label="Stock" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button type="primary" htmlType="submit">Save book</Button>
        </div>
      </Form>

      {recentBooks && recentBooks.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Recently added</Text>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {recentBooks.map((b: any) => (
              <Card size="small" key={b.isbn} style={{ borderRadius: 12 }}>{b.title}</Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
