"use client";

import React, { useMemo, useState } from "react";
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { apiDelete, apiPut } from "@/lib/api";
import type { Book } from "@/components/landing/landing-data";

const { Title, Text } = Typography;

const BOOK_FORMAT_OPTIONS = ["Paperback", "Hardcover", "Ebook"] as const;
const BOOK_CONDITION_OPTIONS = ["New", "Used"] as const;

type BookFormValues = Pick<Book, "isbn" | "title" | "author" | "genre" | "format" | "condition" | "price" | "stockLevel">;

type ManagerBooksPanelProps = {
  books: Book[];
  onRefresh: () => Promise<void>;
};

// Renders the manager books panel section.
export default function ManagerBooksPanel({ books, onRefresh }: ManagerBooksPanelProps) {
  const [form] = Form.useForm<BookFormValues>();
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => editingBook ? `Edit ${editingBook.title}` : "Edit book", [editingBook]);

  // Renders the open editor section.
  async function openEditor(book: Book) {
    setEditingBook(book);
    form.setFieldsValue(book);
  }

  // Renders the handle save section.
  async function handleSave(values: BookFormValues) {
    if (!editingBook) return;
    setSubmitting(true);
    try {
      await apiPut(`/catalog/books/${editingBook.isbn}`, values);
      message.success(`Updated ${values.title}.`);
      setEditingBook(null);
      await onRefresh();
    } catch {
      message.error("Could not update the book.");
    } finally {
      setSubmitting(false);
    }
  }

  // Renders the handle delete section.
  async function handleDelete(book: Book) {
    try {
      await apiDelete(`/catalog/books/${book.isbn}`);
      message.success(`Deleted ${book.title}.`);
      await onRefresh();
    } catch {
      message.error("Could not delete the book.");
    }
  }

  return (
    <>
    <Card style={{ borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <Tag color="gold" style={{ borderRadius: 999, marginBottom: 8 }}>Live catalog</Tag>
          <Title level={4} style={{ margin: 0 }}>Books in the system</Title>
          <Text type="secondary">Everything the store currently has, including staff-added titles.</Text>
        </div>
        <Tag color="blue">{books.length} books</Tag>
      </div>

      <Table
        size="small"
        rowKey="isbn"
        pagination={false}
        dataSource={books}
        columns={[
          { title: 'ISBN', dataIndex: 'isbn', width: 140 },
          { title: 'Title', dataIndex: 'title' },
          { title: 'Genre', dataIndex: 'genre', width: 140 },
          { title: 'Format', dataIndex: 'format', width: 120 },
          { title: 'Stock', dataIndex: 'stockLevel', width: 90 },
          {
            title: 'Source',
            dataIndex: 'source',
            width: 100,
            render: (value: string) => <Tag color={value === 'Used' ? 'blue' : 'green'}>{value || 'New'}</Tag>,
          },
          {
            title: 'Price',
            dataIndex: 'price',
            width: 110,
            render: (value: number) => `$${value.toFixed(2)}`,
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 180,
            render: (_: unknown, record: Book) => (
              <Space>
                <Button size="small" onClick={() => openEditor(record)}>Edit</Button>
                <Popconfirm title="Delete this book?" description="This removes the title from the catalog." okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => handleDelete(record)}>
                  <Button danger size="small">Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        locale={{ emptyText: 'No books in the catalog yet.' }}
      />
    </Card>

    <Modal
      title={title}
      open={Boolean(editingBook)}
      onCancel={() => setEditingBook(null)}
      onOk={() => form.submit()}
      okText="Save changes"
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form<BookFormValues> layout="vertical" form={form} onFinish={handleSave}>
        <Form.Item name="isbn" label="ISBN"><Input disabled /></Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="author" label="Author" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="genre" label="Genre" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="format" label="Format" rules={[{ required: true }]}>
          <Select options={BOOK_FORMAT_OPTIONS.map((value) => ({ label: value, value }))} />
        </Form.Item>
        <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
          <Select options={BOOK_CONDITION_OPTIONS.map((value) => ({ label: value, value }))} />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="stockLevel" label="Stock" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
      </Form>
    </Modal>
    </>
  );
}